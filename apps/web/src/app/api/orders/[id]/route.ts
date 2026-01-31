import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { serializeDecimal } from '@/lib/db';

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            listing: {
              select: {
                title: true,
                slug: true,
                isDigital: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      // Try finding by order number
      const orderByNumber = await prisma.order.findUnique({
        where: { orderNumber: params.id },
        include: {
          items: {
            include: {
              listing: {
                select: {
                  title: true,
                  slug: true,
                  isDigital: true,
                },
              },
            },
          },
          payments: true,
        },
      });

      if (!orderByNumber) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: serializeDecimal(orderByNumber),
      });
    }

    return NextResponse.json({
      success: true,
      data: serializeDecimal(order),
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get order' } },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    // TODO: Validate authorization and valid status transitions

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'PAID' && { paidAt: new Date() }),
        ...(status === 'FULFILLED' && { fulfilledAt: new Date() }),
      },
      include: {
        items: {
          include: {
            listing: { select: { title: true, slug: true } },
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeDecimal(order),
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update order' } },
      { status: 500 }
    );
  }
}
