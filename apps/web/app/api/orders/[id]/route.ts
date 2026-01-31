import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

// GET /api/orders/[id] - Get order details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await authenticateRequest(req);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id },
        ],
      },
      include: {
        listing: {
          include: {
            media: true,
            category: true,
            agent: { select: { id: true, name: true } },
            storefront: { select: { id: true, name: true, slug: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization (owner or admin)
    if (agent && order.buyerId !== agent.id && !agent.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        fees: Number(order.fees),
        total: Number(order.total),
        payments: order.payments.map(p => ({
          ...p,
          amount: Number(p.amount),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await authenticateRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { listing: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only seller or admin can update status
    if (order.listing.agentId !== agent.id && !agent.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { status, notes } = await req.json();

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'FULFILLED') {
        updateData.fulfilledAt = new Date();
      }
      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }
    }
    if (notes) {
      updateData.notes = notes;
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'UPDATE_ORDER',
        entityType: 'Order',
        entityId: order.id,
        metadata: { status, notes },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        subtotal: Number(updated.subtotal),
        fees: Number(updated.fees),
        total: Number(updated.total),
      },
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
