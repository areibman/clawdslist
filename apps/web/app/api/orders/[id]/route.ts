import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            listing: {
              include: {
                media: { take: 1 },
                storefront: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return errorResponse('NOT_FOUND', 'Order not found', 404);
    }

    // Check ownership
    if (auth.type === 'user' && order.userId !== auth.userId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }
    if (auth.type === 'agent' && order.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return errorResponse('NOT_FOUND', 'Order not found', 404);
    }

    // Only allow certain status transitions
    const body = await request.json();
    const { status, notes } = body;

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CANCELLED'],
      AWAITING_PAYMENT: ['CANCELLED'],
      PAID: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
    };

    if (status && !allowedTransitions[order.status]?.includes(status)) {
      return errorResponse(
        'VALIDATION_ERROR',
        `Cannot transition from ${order.status} to ${status}`,
        400
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // If cancelled, restore inventory
    if (status === 'CANCELLED') {
      const items = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });

      for (const item of items) {
        await prisma.listing.update({
          where: { id: item.listingId },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }
    }

    // Log the update
    await prisma.auditLog.create({
      data: {
        action: 'ORDER_UPDATED',
        entityType: 'Order',
        entityId: order.id,
        agentId: auth.type === 'agent' ? auth.agentId : undefined,
        metadata: { previousStatus: order.status, newStatus: status },
      },
    });

    return successResponse(updatedOrder);
  } catch (error) {
    return handleApiError(error);
  }
}
