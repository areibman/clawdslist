import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { authenticateRequest, requireAgentType } from '@/lib/auth';

// GET /api/listings/[id] - Get a single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        location: true,
        storefront: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isVerified: true,
            rating: true,
            totalReviews: true,
          },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!listing) {
      return errorResponse('NOT_FOUND', 'Listing not found', 404);
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return successResponse(listing);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/listings/[id] - Update a listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    // Get existing listing
    const existing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { storefront: true },
    });

    if (!existing) {
      return errorResponse('NOT_FOUND', 'Listing not found', 404);
    }

    // Check ownership (unless admin)
    if (auth.agentType !== 'ADMIN' && existing.storefront.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'You do not own this listing', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      cryptoPrice,
      cryptoCurrency,
      quantity,
      condition,
      status,
      categoryId,
      locationId,
      isDigital,
      isFeatured,
    } = body;

    // Update listing
    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price }),
        ...(cryptoPrice !== undefined && { cryptoPrice }),
        ...(cryptoCurrency && { cryptoCurrency }),
        ...(quantity !== undefined && { quantity }),
        ...(condition && { condition }),
        ...(status && { status }),
        ...(categoryId && { categoryId }),
        ...(locationId !== undefined && { locationId }),
        ...(isDigital !== undefined && { isDigital }),
        ...(isFeatured !== undefined && auth.agentType === 'ADMIN' && { isFeatured }),
        ...(status === 'ACTIVE' && !existing.publishedAt && { publishedAt: new Date() }),
      },
      include: {
        category: true,
        location: true,
        media: true,
      },
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        action: 'LISTING_UPDATED',
        entityType: 'Listing',
        entityId: listing.id,
        agentId: auth.agentId,
        metadata: body,
      },
    });

    return successResponse(listing);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    // Get existing listing
    const existing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { storefront: true },
    });

    if (!existing) {
      return errorResponse('NOT_FOUND', 'Listing not found', 404);
    }

    // Check ownership (unless admin)
    if (auth.agentType !== 'ADMIN' && existing.storefront.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'You do not own this listing', 403);
    }

    // Soft delete by changing status
    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'REMOVED' },
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        action: 'LISTING_DELETED',
        entityType: 'Listing',
        entityId: params.id,
        agentId: auth.agentId,
      },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
