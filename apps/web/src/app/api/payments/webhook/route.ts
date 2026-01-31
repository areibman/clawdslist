import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'

// POST /api/payments/webhook - Handle payment provider webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('stripe-signature') || request.headers.get('x-coinbase-signature')
    
    // In production, verify webhook signature
    // For MVP, we'll process the webhook without verification

    const { provider, event, paymentId, status } = body

    // Find the payment
    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentId },
      include: { order: true },
    })

    if (!payment) {
      console.log(`Payment not found for provider ID: ${paymentId}`)
      return NextResponse.json({ received: true })
    }

    // Map provider status to our status
    let newStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' = 'PENDING'
    let orderStatus: 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' = 'AWAITING_PAYMENT'

    switch (event) {
      case 'payment_intent.succeeded':
      case 'charge:confirmed':
      case 'payment.completed':
        newStatus = 'COMPLETED'
        orderStatus = 'PAID'
        break
      case 'payment_intent.payment_failed':
      case 'charge:failed':
      case 'payment.failed':
        newStatus = 'FAILED'
        orderStatus = 'AWAITING_PAYMENT'
        break
      case 'charge.refunded':
      case 'charge:refunded':
      case 'payment.refunded':
        newStatus = 'REFUNDED'
        orderStatus = 'REFUNDED'
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
        return NextResponse.json({ received: true })
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'COMPLETED' ? new Date() : undefined,
        providerData: {
          ...(payment.providerData as object || {}),
          webhookEvent: event,
          webhookReceivedAt: new Date().toISOString(),
        },
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
    })

    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_WEBHOOK',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: { event, provider, status: newStatus },
      },
    })

    console.log(`Payment ${payment.id} updated to ${newStatus}, order ${payment.orderId} updated to ${orderStatus}`)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
