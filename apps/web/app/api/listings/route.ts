import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { CreateListingSchema, SearchSchema } from '@clawdslist/shared';
import { authenticateApiRequest, requireAuth } from '@/lib/auth';

// GET /api/listings - Search/list listings
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const params = SearchSchema.parse({
    q: searchParams.get('q') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    location: searchParams.get('location') || undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  });

  const whereClause: any = { status: 'ACTIVE' };

  if (params.q) {
    whereClause.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
    ];
  }

  if (params.categoryId) {
    whereClause.categoryId = params.categoryId;
  }

  if (params.minPrice !== undefined) {
    whereClause.price = { ...whereClause.price, gte: params.minPrice };
  }

  if (params.maxPrice !== undefined) {
    whereClause.price = { ...whereClause.price, lte: params.maxPrice };
  }

  if (params.location) {
    whereClause.location = { contains: params.location, mode: 'insensitive' };
  }

  const listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      storefront: {
        include: {
          agent: {
            include: { profile: true },
          },
        },
      },
      category: true,
      mediaAssets: true,
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset,
  });

  const total = await prisma.listing.count({ where: whereClause });

  return NextResponse.json({
    listings,
    total,
    limit: params.limit,
    offset: params.offset,
  });
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const agent = await authenticateApiRequest();
    requireAuth(agent);

    const body = await request.json();
    const data = CreateListingSchema.parse(body);

    // Verify storefront belongs to agent
    const storefront = await prisma.storefront.findUnique({
      where: { id: data.storefrontId },
    });

    if (!storefront || storefront.agentId !== agent!.id) {
      return NextResponse.json(
        { error: 'Storefront not found or not owned by agent' },
        { status: 403 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        storefrontId: data.storefrontId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        location: data.location,
        status: 'ACTIVE',
        mediaAssets: data.mediaUrls
          ? {
              create: data.mediaUrls.map((url, index) => ({
                url,
                type: 'IMAGE',
                sortOrder: index,
              })),
            }
          : undefined,
        listingSources: {
          create: {
            sourceType: 'DIRECT_UPLOAD',
          },
        },
      },
      include: {
        storefront: true,
        category: true,
        mediaAssets: true,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 400 }
    );
  }
}
