import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { createOrderSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: agent.id },
      include: {
        listing: {
          include: {
            mediaAssets: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing not available' },
        { status: 400 }
      );
    }

    if (listing.inventory < data.quantity) {
      return NextResponse.json(
        { error: 'Not enough inventory' },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId: agent.id,
        listingId: data.listingId,
        quantity: data.quantity,
        totalPrice: listing.price * data.quantity,
        currency: listing.currency,
        status: 'pending',
      },
      include: {
        listing: true,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'order.created',
        entityType: 'Order',
        entityId: order.id,
        metadata: { orderId: order.id, listingId: listing.id },
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 400 }
    );
  }
}
