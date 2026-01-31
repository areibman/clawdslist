import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { authenticateRequest, requireAgentType } from '@/lib/auth';

// GET /api/listings - Search and list listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const locationId = searchParams.get('locationId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const isDigital = searchParams.get('isDigital');
    const featured = searchParams.get('featured');
    const storefrontId = searchParams.get('storefrontId');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE',
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    if (condition) {
      where.condition = condition;
    }

    if (isDigital !== null) {
      where.isDigital = isDigital === 'true';
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (storefrontId) {
      where.storefrontId = storefrontId;
    }

    // Build sort order
    let orderBy: any = { publishedAt: 'desc' };
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
    }

    // Get total count
    const total = await prisma.listing.count({ where });

    // Get listings
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        location: true,
        storefront: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            rating: true,
          },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    // Transform response
    const transformedListings = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      cryptoPrice: listing.cryptoPrice,
      cryptoCurrency: listing.cryptoCurrency,
      quantity: listing.quantity,
      condition: listing.condition,
      isDigital: listing.isDigital,
      isFeatured: listing.isFeatured,
      viewCount: listing.viewCount,
      publishedAt: listing.publishedAt,
      category: listing.category,
      location: listing.location,
      storefront: listing.storefront,
      imageUrl: listing.media[0]?.url || null,
      thumbnailUrl: listing.media[0]?.thumbnailUrl || null,
    }));

    return successResponse(transformedListings, {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    if (!auth.storefrontId) {
      return errorResponse('FORBIDDEN', 'Seller must have a storefront', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      cryptoPrice,
      cryptoCurrency,
      quantity = 1,
      condition,
      categoryId,
      locationId,
      isDigital = false,
      media = [],
    } = body;

    // Validate required fields
    if (!title || !description || !price || !categoryId) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', 400);
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title,
        slug,
        description,
        price,
        cryptoPrice,
        cryptoCurrency,
        quantity,
        condition: condition || (isDigital ? 'DIGITAL' : 'NEW'),
        status: 'PENDING_REVIEW',
        isDigital,
        storefrontId: auth.storefrontId,
        categoryId,
        locationId,
        agentId: auth.agentId,
        media: {
          create: media.map((m: any, index: number) => ({
            url: m.url,
            thumbnailUrl: m.thumbnailUrl,
            type: m.type || 'IMAGE',
            altText: m.altText,
            sortOrder: index,
          })),
        },
      },
      include: {
        category: true,
        location: true,
        media: true,
      },
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        action: 'LISTING_CREATED',
        entityType: 'Listing',
        entityId: listing.id,
        agentId: auth.agentId,
        metadata: { title, price, categoryId },
      },
    });

    return successResponse(listing, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
