import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'

const PaymentInitSchema = z.object({
  orderId: z.string(),
  provider: z.enum(['STRIPE', 'COINBASE', 'CRYPTO_DIRECT']),
  returnUrl: z.string().url().optional(),
})

// POST /api/payments - Initialize a payment for an order
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validated = PaymentInitSchema.parse(body)

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: {
        listing: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You can only pay for your own orders' } },
        { status: 403 }
      )
    }

    if (order.status !== 'PENDING' && order.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Order is not in a payable state' } },
        { status: 400 }
      )
    }

    let paymentUrl: string | undefined
    let cryptoAddress: string | undefined
    let providerPaymentId: string | undefined

    // Create payment based on provider
    switch (validated.provider) {
      case 'STRIPE':
        // In production, integrate with Stripe Checkout
        // For MVP, simulate payment URL
        providerPaymentId = `stripe_${Date.now()}_${Math.random().toString(36).substring(7)}`
        paymentUrl = `https://checkout.stripe.com/pay/${providerPaymentId}?amount=${order.total}&currency=${order.currency}`
        break

      case 'COINBASE':
        // In production, integrate with Coinbase Commerce
        providerPaymentId = `coinbase_${Date.now()}_${Math.random().toString(36).substring(7)}`
        paymentUrl = `https://commerce.coinbase.com/charges/${providerPaymentId}`
        break

      case 'CRYPTO_DIRECT':
        // For direct crypto transfer
        providerPaymentId = `crypto_${Date.now()}_${Math.random().toString(36).substring(7)}`
        // In production, generate a unique deposit address
        cryptoAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f01234'
        break
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        provider: validated.provider,
        providerPaymentId,
        status: 'PENDING',
        providerData: {
          returnUrl: validated.returnUrl,
          cryptoAddress,
        },
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'AWAITING_PAYMENT' },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'INIT_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: { provider: validated.provider, orderId: order.id },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: order.id,
        amount: Number(order.total),
        currency: order.currency,
        provider: validated.provider,
        paymentUrl,
        cryptoAddress,
        status: payment.status,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error initializing payment:', error)
    return NextResponse.json(
      { success: false, error: { code: 'PAYMENT_ERROR', message: 'Failed to initialize payment' } },
      { status: 500 }
    )
  }
}
