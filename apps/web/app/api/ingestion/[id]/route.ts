import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { requireAgentType } from '@/lib/auth';

// GET /api/ingestion/[id] - Get ingestion job status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    const source = await prisma.listingSource.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          include: {
            media: { take: 1 },
          },
        },
        storefront: {
          select: { agentId: true },
        },
      },
    });

    if (!source) {
      return errorResponse('NOT_FOUND', 'Ingestion job not found', 404);
    }

    // Check ownership
    if (auth.agentType !== 'ADMIN' && source.storefront?.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    return successResponse({
      id: source.id,
      sourceUrl: source.sourceUrl,
      sourceType: source.sourceType,
      status: source.status,
      errorMessage: source.errorMessage,
      extractedData: source.extractedData,
      processedAt: source.processedAt,
      createdAt: source.createdAt,
      listing: source.listing,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/ingestion/[id] - Cancel an ingestion job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    const source = await prisma.listingSource.findUnique({
      where: { id: params.id },
      include: {
        storefront: { select: { agentId: true } },
      },
    });

    if (!source) {
      return errorResponse('NOT_FOUND', 'Ingestion job not found', 404);
    }

    // Check ownership
    if (auth.agentType !== 'ADMIN' && source.storefront?.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    // Can only cancel pending jobs
    if (source.status !== 'PENDING') {
      return errorResponse('VALIDATION_ERROR', 'Can only cancel pending jobs', 400);
    }

    // Update status
    await prisma.listingSource.update({
      where: { id: params.id },
      data: { status: 'FAILED', errorMessage: 'Cancelled by user' },
    });

    // Cancel associated job
    await prisma.job.updateMany({
      where: {
        payload: { path: ['sourceId'], equals: params.id },
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });

    return successResponse({ cancelled: true });
  } catch (error) {
    return handleApiError(error);
  }
}
