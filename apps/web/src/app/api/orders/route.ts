import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'

const OrderCreateSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().positive().default(1),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
})

// GET /api/orders - List orders for the authenticated user
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'buyer' // 'buyer' or 'seller'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = role === 'seller' 
      ? { sellerId: user.id }
      : { buyerId: user.id }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch orders' } },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create a new order
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
    const validated = OrderCreateSchema.parse(body)

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

    if (listing.userId === user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'SELF_PURCHASE', message: 'You cannot buy your own listing' } },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = Number(listing.price) * validated.quantity
    const fees = subtotal * 0.05 // 5% platform fee
    const total = subtotal + fees

    // Create the order
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        sellerId: listing.userId,
        listingId: listing.id,
        quantity: validated.quantity,
        subtotal,
        fees,
        total,
        currency: listing.currency,
        status: 'PENDING',
        shippingAddress: validated.shippingAddress,
        notes: validated.notes,
      },
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
      },
    })

    // Update listing quantity
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        quantity: { decrement: validated.quantity },
        status: listing.quantity - validated.quantity === 0 ? 'SOLD' : 'ACTIVE',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_ORDER',
        entityType: 'Order',
        entityId: order.id,
        metadata: { listingId: listing.id, total },
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create order' } },
      { status: 500 }
    )
  }
}
