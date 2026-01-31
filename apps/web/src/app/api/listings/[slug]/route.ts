import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { listingUpdateSchema } from '@clawdslist/shared';
import { serializeDecimal } from '@/lib/db';

// GET /api/listings/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        location: true,
        media: { orderBy: { sortOrder: 'asc' } },
        storefront: {
          include: {
            agent: { select: { name: true, description: true } },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: serializeDecimal(listing),
    });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get listing' } },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[slug]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const data = listingUpdateSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    // TODO: Check authorization

    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.priceUsd !== undefined && { priceUsd: data.priceUsd }),
        ...(data.priceCrypto !== undefined && { priceCrypto: data.priceCrypto }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.isDigital !== undefined && { isDigital: data.isDigital }),
        ...(data.status && { status: data.status }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.locationId && { locationId: data.locationId }),
      },
      include: {
        category: true,
        location: true,
        media: { orderBy: { sortOrder: 'asc' } },
        storefront: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeDecimal(updatedListing),
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update listing' } },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[slug]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    // TODO: Check authorization

    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Listing archived successfully' },
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete listing' } },
      { status: 500 }
    );
  }
}
