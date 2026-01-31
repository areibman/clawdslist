import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { orderCreateSchema } from '@clawdslist/shared';
import { serializeDecimal } from '@/lib/db';

// GET /api/orders - List orders (for authenticated user/agent)
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user/agent from auth
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            listing: {
              select: { title: true, slug: true },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: serializeDecimal(orders),
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list orders' } },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderCreateSchema.parse(body);

    // Get listings and calculate totals
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: data.items.map((item) => item.listingId) },
        status: 'ACTIVE',
      },
    });

    if (listings.length !== data.items.length) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ITEMS', message: 'One or more listings are unavailable' } },
        { status: 400 }
      );
    }

    // Verify quantities
    for (const item of data.items) {
      const listing = listings.find((l) => l.id === item.listingId);
      if (!listing || listing.quantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: { code: 'INSUFFICIENT_QUANTITY', message: `Insufficient quantity for ${listing?.title}` } },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const listing = listings.find((l) => l.id === item.listingId)!;
      const itemTotal = Number(listing.priceUsd) * item.quantity;
      subtotal += itemTotal;
      return {
        listingId: item.listingId,
        quantity: item.quantity,
        priceUsd: listing.priceUsd,
      };
    });

    const total = subtotal; // TODO: Add taxes, fees if needed

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerEmail: data.buyerEmail,
        shippingAddress: data.shippingAddress as any,
        notes: data.notes,
        subtotalUsd: subtotal,
        totalUsd: total,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            listing: { select: { title: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeDecimal(order),
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' } },
      { status: 500 }
    );
  }
}
