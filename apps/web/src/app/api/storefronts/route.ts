import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

const StorefrontCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  sourceUrl: z.string().url().optional(),
})

// GET /api/storefronts - List storefronts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [storefronts, total] = await Promise.all([
      prisma.storefront.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              isAgent: true,
            },
          },
          _count: {
            select: {
              listings: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.storefront.count(),
    ])

    const formattedStorefronts = storefronts.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      logoUrl: s.logoUrl,
      bannerUrl: s.bannerUrl,
      isVerified: s.isVerified,
      listingCount: s._count.listings,
      user: s.user,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedStorefronts,
      meta: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching storefronts:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch storefronts' } },
      { status: 500 }
    )
  }
}

// POST /api/storefronts - Create a new storefront
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
    const validated = StorefrontCreateSchema.parse(body)

    // Generate unique slug
    let slug = slugify(validated.name)
    const existingSlug = await prisma.storefront.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const storefront = await prisma.storefront.create({
      data: {
        userId: user.id,
        name: validated.name,
        slug,
        description: validated.description,
        sourceUrl: validated.sourceUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isAgent: true,
          },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_STOREFRONT',
        entityType: 'Storefront',
        entityId: storefront.id,
        metadata: { name: storefront.name },
      },
    })

    return NextResponse.json({
      success: true,
      data: storefront,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error creating storefront:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create storefront' } },
      { status: 500 }
    )
  }
}
