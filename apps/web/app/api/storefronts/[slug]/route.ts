import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { requireAgentType } from '@/lib/auth';

// GET /api/storefronts/[slug] - Get storefront details
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const storefront = await prisma.storefront.findUnique({
      where: { slug: params.slug },
      include: {
        location: true,
        listings: {
          where: { status: 'ACTIVE' },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          include: {
            category: true,
            media: { take: 1 },
          },
        },
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!storefront) {
      return errorResponse('NOT_FOUND', 'Storefront not found', 404);
    }

    return successResponse({
      id: storefront.id,
      name: storefront.name,
      slug: storefront.slug,
      description: storefront.description,
      logoUrl: storefront.logoUrl,
      bannerUrl: storefront.bannerUrl,
      website: storefront.website,
      isVerified: storefront.isVerified,
      rating: storefront.rating,
      totalReviews: storefront.totalReviews,
      createdAt: storefront.createdAt,
      location: storefront.location,
      listingCount: storefront._count.listings,
      listings: storefront.listings.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        price: l.price,
        condition: l.condition,
        isDigital: l.isDigital,
        isFeatured: l.isFeatured,
        category: l.category,
        imageUrl: l.media[0]?.url,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/storefronts/[slug] - Update storefront
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);

    const storefront = await prisma.storefront.findUnique({
      where: { slug: params.slug },
    });

    if (!storefront) {
      return errorResponse('NOT_FOUND', 'Storefront not found', 404);
    }

    // Check ownership
    if (auth.agentType !== 'ADMIN' && storefront.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    const body = await request.json();
    const { name, description, logoUrl, bannerUrl, website, locationId } = body;

    const updated = await prisma.storefront.update({
      where: { id: storefront.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(website !== undefined && { website }),
        ...(locationId !== undefined && { locationId }),
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
