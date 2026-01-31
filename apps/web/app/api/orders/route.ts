import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CL-${timestamp}-${random}`;
}

// GET /api/orders - List orders for the authenticated user/agent
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const where: any = {};

    if (auth.type === 'user') {
      where.userId = auth.userId;
    } else if (auth.type === 'agent') {
      where.agentId = auth.agentId;
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                media: { take: 1 },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            method: true,
            provider: true,
            amount: true,
          },
        },
      },
    });

    return successResponse(orders, {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const body = await request.json();
    const { items, shippingAddress, billingAddress, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Order must have at least one item', 400);
    }

    // Validate and get listing details
    const listingIds = items.map((item: any) => item.listingId);
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        status: 'ACTIVE',
      },
    });

    if (listings.length !== listingIds.length) {
      return errorResponse('VALIDATION_ERROR', 'One or more listings are not available', 400);
    }

    // Check quantities
    const listingMap = new Map(listings.map((l) => [l.id, l]));
    for (const item of items) {
      const listing = listingMap.get(item.listingId);
      if (!listing) continue;
      if (item.quantity > listing.quantity) {
        return errorResponse(
          'INSUFFICIENT_QUANTITY',
          `Not enough quantity for "${listing.title}"`,
          400
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const listing = listingMap.get(item.listingId)!;
      const unitPrice = Number(listing.price);
      const total = unitPrice * item.quantity;
      subtotal += total;
      return {
        listingId: item.listingId,
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    const tax = subtotal * 0.0875; // 8.75% tax
    const total = subtotal + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        subtotal,
        tax,
        total,
        currency: 'USD',
        shippingAddress,
        billingAddress,
        notes,
        ...(auth.type === 'user' ? { userId: auth.userId } : { agentId: auth.agentId }),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Reserve inventory
    for (const item of items) {
      await prisma.listing.update({
        where: { id: item.listingId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    // Log the order
    await prisma.auditLog.create({
      data: {
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: order.id,
        agentId: auth.type === 'agent' ? auth.agentId : undefined,
        metadata: { orderNumber: order.orderNumber, total },
      },
    });

    return successResponse(order, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
