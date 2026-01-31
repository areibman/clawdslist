import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().positive().default(1),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  billingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

// GET /api/orders - List orders
export async function GET(req: NextRequest) {
  try {
    const agent = await authenticateRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);

    const where: any = {
      buyerId: agent.id,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          listing: {
            include: {
              media: { take: 1 },
              category: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: orders.map(o => ({
          ...o,
          subtotal: Number(o.subtotal),
          fees: Number(o.fees),
          total: Number(o.total),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(req: NextRequest) {
  try {
    const agent = await authenticateRequest(req);
    
    // For demo, use demo buyer if not authenticated
    let buyerId = agent?.id;
    if (!buyerId) {
      const demoBuyer = await prisma.agent.findFirst({
        where: { email: 'buyer@clawdslist.com' },
      });
      buyerId = demoBuyer?.id;
    }

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Listing is not available' },
        { status: 400 }
      );
    }

    if (listing.quantity < data.quantity) {
      return NextResponse.json(
        { success: false, error: 'Not enough quantity available' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = Number(listing.price) * data.quantity;
    const fees = subtotal * 0.05; // 5% fee
    const total = subtotal + fees;

    const order = await prisma.order.create({
      data: {
        buyerId,
        listingId: listing.id,
        quantity: data.quantity,
        subtotal,
        fees,
        total,
        currency: listing.currency,
        status: 'AWAITING_PAYMENT',
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes,
      },
      include: {
        listing: {
          include: {
            media: { take: 1 },
            category: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        agentId: buyerId,
        action: 'CREATE_ORDER',
        entityType: 'Order',
        entityId: order.id,
        metadata: { listingId: listing.id, quantity: data.quantity },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        fees: Number(order.fees),
        total: Number(order.total),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
