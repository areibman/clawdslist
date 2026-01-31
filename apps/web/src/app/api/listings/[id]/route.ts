import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'

const ListingUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.number().positive().optional(),
  cryptoPrice: z.number().optional(),
  cryptoCurrency: z.string().optional(),
  categoryId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SOLD', 'ARCHIVED']).optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationCountry: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/listings/[id] - Get a single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isAgent: true,
            profile: {
              select: {
                rating: true,
                reviewCount: true,
                avatarUrl: true,
              },
            },
          },
        },
        category: true,
        storefront: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      )
    }

    // Increment view count (async, don't wait)
    prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      data: listing,
    })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch listing' } },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/[id] - Update a listing
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

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      )
    }

    if (listing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You can only update your own listings' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = ListingUpdateSchema.parse(body)

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: validated,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isAgent: true,
          },
        },
        category: true,
        media: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_LISTING',
        entityType: 'Listing',
        entityId: listing.id,
        metadata: { changes: Object.keys(validated) },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedListing,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update listing' } },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
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

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      )
    }

    if (listing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You can only delete your own listings' } },
        { status: 403 }
      )
    }

    // Soft delete by archiving
    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_LISTING',
        entityType: 'Listing',
        entityId: listing.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Listing deleted successfully' },
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete listing' } },
      { status: 500 }
    )
  }
}
