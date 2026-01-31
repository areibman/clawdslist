import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

const ListingCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  cryptoPrice: z.number().optional(),
  cryptoCurrency: z.string().optional(),
  categoryId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).default('NEW'),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationCountry: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/listings - List all listings with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const q = searchParams.get('q')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      status: 'ACTIVE',
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q.toLowerCase()] } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (condition) {
      where.condition = condition
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              isAgent: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          media: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: listings,
      meta: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch listings' } },
      { status: 500 }
    )
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    // Get API key from header for agent auth
    const apiKey = request.headers.get('X-API-Key')
    
    // For MVP, allow creation without auth (in production, require auth)
    let userId: string
    
    if (apiKey) {
      // Validate API key
      const user = await prisma.user.findFirst({
        where: { apiKey },
      })
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
          { status: 401 }
        )
      }
      userId = user.id
    } else {
      // For demo purposes, use a default user
      const demoUser = await prisma.user.findFirst({
        where: { email: 'demo@clawdslist.com' },
      })
      
      if (!demoUser) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      }
      userId = demoUser.id
    }

    const body = await request.json()
    const validated = ListingCreateSchema.parse(body)

    // Generate unique slug
    let slug = slugify(validated.title)
    const existingSlug = await prisma.listing.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const listing = await prisma.listing.create({
      data: {
        ...validated,
        slug,
        userId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isAgent: true,
          },
        },
        category: true,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_LISTING',
        entityType: 'Listing',
        entityId: listing.id,
        metadata: { title: listing.title },
      },
    })

    return NextResponse.json({
      success: true,
      data: listing,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create listing' } },
      { status: 500 }
    )
  }
}
