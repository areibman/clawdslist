import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'

const OrderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
})

// GET /api/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } },
        { status: 401 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { apiKey },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          include: {
            media: true,
            category: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            isAgent: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            isAgent: true,
          },
        },
        payments: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    // Only allow buyer or seller to view the order
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this order' } },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch order' } },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } },
        { status: 401 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { apiKey },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    // Only seller can update order status (except for cancellation by buyer)
    const body = await request.json()
    const validated = OrderUpdateSchema.parse(body)

    if (validated.status === 'CANCELLED') {
      // Both buyer and seller can cancel
      if (order.buyerId !== user.id && order.sellerId !== user.id) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this order' } },
          { status: 403 }
        )
      }
      
      // Only allow cancellation of pending orders
      if (!['PENDING', 'AWAITING_PAYMENT'].includes(order.status)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_STATUS', message: 'Cannot cancel order in current status' } },
          { status: 400 }
        )
      }
    } else {
      // Only seller can update other statuses
      if (order.sellerId !== user.id) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Only seller can update order status' } },
          { status: 403 }
        )
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: validated,
      include: {
        listing: {
          include: {
            media: { take: 1 },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            isAgent: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            isAgent: true,
          },
        },
        payments: true,
      },
    })

    // If cancelled, restore listing quantity
    if (validated.status === 'CANCELLED') {
      await prisma.listing.update({
        where: { id: order.listingId },
        data: {
          quantity: { increment: order.quantity },
          status: 'ACTIVE',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_ORDER',
        entityType: 'Order',
        entityId: order.id,
        metadata: { changes: validated },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update order' } },
      { status: 500 }
    )
  }
}
