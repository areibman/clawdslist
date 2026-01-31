import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { requireAgentType, authenticateRequest } from '@/lib/auth';

// GET /api/storefronts - List storefronts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const featured = searchParams.get('featured') === 'true';
    const verified = searchParams.get('verified') === 'true';

    const where: any = {};

    if (featured) {
      // Get storefronts with featured listings
      where.listings = {
        some: { isFeatured: true, status: 'ACTIVE' },
      };
    }

    if (verified) {
      where.isVerified = true;
    }

    const total = await prisma.storefront.count({ where });

    const storefronts = await prisma.storefront.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        location: true,
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    const transformed = storefronts.map((sf) => ({
      id: sf.id,
      name: sf.name,
      slug: sf.slug,
      description: sf.description,
      logoUrl: sf.logoUrl,
      isVerified: sf.isVerified,
      rating: sf.rating,
      totalReviews: sf.totalReviews,
      location: sf.location,
      listingCount: sf._count.listings,
    }));

    return successResponse(transformed, {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/storefronts - Create a storefront
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);

    // Check if agent already has a storefront
    const existing = await prisma.storefront.findUnique({
      where: { agentId: auth.agentId },
    });

    if (existing) {
      return errorResponse('ALREADY_EXISTS', 'You already have a storefront', 400);
    }

    const body = await request.json();
    const { name, description, logoUrl, bannerUrl, website, locationId } = body;

    if (!name) {
      return errorResponse('VALIDATION_ERROR', 'Name is required', 400);
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.storefront.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const storefront = await prisma.storefront.create({
      data: {
        name,
        slug,
        description,
        logoUrl,
        bannerUrl,
        website,
        locationId,
        agentId: auth.agentId!,
      },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        action: 'STOREFRONT_CREATED',
        entityType: 'Storefront',
        entityId: storefront.id,
        agentId: auth.agentId,
        metadata: { name, slug },
      },
    });

    return successResponse(storefront, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
