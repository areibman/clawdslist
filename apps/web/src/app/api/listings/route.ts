import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { listingCreateSchema, searchSchema } from '@clawdslist/shared';
import { serializeDecimal } from '@/lib/db';

// GET /api/listings - Search listings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = searchSchema.parse({
      q: searchParams.get('q') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const skip = (params.page - 1) * params.limit;

    const where = {
      status: 'ACTIVE' as const,
      ...(params.q && {
        OR: [
          { title: { contains: params.q, mode: 'insensitive' as const } },
          { description: { contains: params.q, mode: 'insensitive' as const } },
        ],
      }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.locationId && { locationId: params.locationId }),
      ...((params.minPrice !== undefined || params.maxPrice !== undefined) && {
        priceUsd: {
          ...(params.minPrice !== undefined && { gte: params.minPrice }),
          ...(params.maxPrice !== undefined && { lte: params.maxPrice }),
        },
      }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: true,
          location: true,
          media: { take: 1, orderBy: { sortOrder: 'asc' } },
          storefront: { select: { name: true, slug: true } },
        },
        orderBy: { [params.sortBy || 'createdAt']: params.sortOrder },
        skip,
        take: params.limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: serializeDecimal(listings),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        hasMore: skip + listings.length < total,
      },
    });
  } catch (error) {
    console.error('Search listings error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to search listings' } },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = listingCreateSchema.parse(body);

    // TODO: Get storefront from authenticated user/agent
    const storefront = await prisma.storefront.findFirst({
      where: { isActive: true },
    });

    if (!storefront) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_STOREFRONT', message: 'No active storefront found' } },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        priceUsd: data.priceUsd,
        priceCrypto: data.priceCrypto,
        cryptoCurrency: data.cryptoCurrency,
        quantity: data.quantity,
        isDigital: data.isDigital,
        status: 'ACTIVE',
        storefrontId: storefront.id,
        categoryId: data.categoryId,
        locationId: data.locationId,
      },
      include: {
        category: true,
        location: true,
        storefront: { select: { name: true, slug: true } },
      },
    });

    // Create media assets if provided
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      await prisma.mediaAsset.createMany({
        data: data.mediaUrls.map((url, index) => ({
          url,
          filename: `image-${index + 1}`,
          mimeType: 'image/jpeg',
          sortOrder: index,
          listingId: listing.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: serializeDecimal(listing),
    }, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create listing' } },
      { status: 500 }
    );
  }
}
