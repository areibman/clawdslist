import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'

const AgentPurchaseSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().positive().default(1),
  paymentProvider: z.enum(['STRIPE', 'COINBASE', 'CRYPTO_DIRECT']),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
})

// POST /api/agent/purchase - Combined order + payment initialization for agents
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

    if (!user.isAgent) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'This endpoint is for agents only' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = AgentPurchaseSchema.parse(body)

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      include: { user: true },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      )
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAVAILABLE', message: 'Listing is not available for purchase' } },
        { status: 400 }
      )
    }

    if (listing.quantity < validated.quantity) {
      return NextResponse.json(
        { success: false, error: { code: 'INSUFFICIENT_QUANTITY', message: 'Not enough items in stock' } },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = Number(listing.price) * validated.quantity
    const fees = subtotal * 0.05 // 5% platform fee
    const total = subtotal + fees

    // Create order and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          buyerId: user.id,
          sellerId: listing.userId,
          listingId: listing.id,
          quantity: validated.quantity,
          subtotal,
          fees,
          total,
          currency: listing.currency,
          status: 'AWAITING_PAYMENT',
          shippingAddress: validated.shippingAddress,
        },
      })

      // Generate payment details
      let paymentUrl: string | undefined
      let cryptoAddress: string | undefined
      const providerPaymentId = `${validated.paymentProvider.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`

      switch (validated.paymentProvider) {
        case 'STRIPE':
          paymentUrl = `https://checkout.stripe.com/pay/${providerPaymentId}`
          break
        case 'COINBASE':
          paymentUrl = `https://commerce.coinbase.com/charges/${providerPaymentId}`
          break
        case 'CRYPTO_DIRECT':
          cryptoAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f01234'
          break
      }

      // Create payment
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          currency: listing.currency,
          provider: validated.paymentProvider,
          providerPaymentId,
          status: 'PENDING',
          providerData: { cryptoAddress },
        },
      })

      // Update listing quantity
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          quantity: { decrement: validated.quantity },
          status: listing.quantity - validated.quantity === 0 ? 'SOLD' : 'ACTIVE',
        },
      })

      return { order, payment, paymentUrl, cryptoAddress }
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AGENT_PURCHASE',
        entityType: 'Order',
        entityId: result.order.id,
        metadata: { listingId: listing.id, total, provider: validated.paymentProvider },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.order.id,
        paymentId: result.payment.id,
        status: result.order.status,
        total: Number(total),
        currency: listing.currency,
        paymentUrl: result.paymentUrl,
        cryptoAddress: result.cryptoAddress,
        listing: {
          id: listing.id,
          title: listing.title,
          price: Number(listing.price),
        },
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error processing agent purchase:', error)
    return NextResponse.json(
      { success: false, error: { code: 'PURCHASE_ERROR', message: 'Failed to process purchase' } },
      { status: 500 }
    )
  }
}
