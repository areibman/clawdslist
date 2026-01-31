import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { CreateOrderSchema } from '@clawdslist/shared';
import { authenticateApiRequest, requireAuth } from '@/lib/auth';

// GET /api/orders - List orders for authenticated agent
export async function GET(request: NextRequest) {
  try {
    const agent = await authenticateApiRequest();
    requireAuth(agent);

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'buyer'; // 'buyer' or 'seller'
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    const whereClause =
      type === 'buyer'
        ? { buyerId: agent!.id }
        : { sellerId: agent!.id };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        listing: {
          include: {
            category: true,
            mediaAssets: true,
          },
        },
        buyer: {
          include: { profile: true },
        },
        seller: {
          include: { profile: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.order.count({ where: whereClause });

    return NextResponse.json({
      orders,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const agent = await authenticateApiRequest();
    requireAuth(agent);

    const body = await request.json();
    const data = CreateOrderSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { storefront: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing not available' },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId: agent!.id,
        sellerId: listing.storefront.agentId,
        listingId: listing.id,
        status: 'PENDING',
        totalAmount: listing.price,
        currency: listing.currency,
        paymentMethod: data.paymentMethod,
      },
      include: {
        listing: true,
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
      },
    });

    // TODO: Initiate payment flow based on paymentMethod
    const paymentUrl = `/checkout/${order.id}?method=${data.paymentMethod}`;

    return NextResponse.json({
      order,
      paymentUrl,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 400 }
    );
  }
}
