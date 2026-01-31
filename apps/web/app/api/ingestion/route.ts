import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { requireAgentType } from '@/lib/auth';
import { SourceType, IngestionStatus } from '@prisma/client';

// POST /api/ingestion - Submit a URL for ingestion
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    if (!auth.storefrontId) {
      return errorResponse('FORBIDDEN', 'Seller must have a storefront', 403);
    }

    const body = await request.json();
    const { sourceUrl, autoPublish = false } = body;

    if (!sourceUrl) {
      return errorResponse('VALIDATION_ERROR', 'Source URL is required', 400);
    }

    // Validate URL
    try {
      new URL(sourceUrl);
    } catch {
      return errorResponse('VALIDATION_ERROR', 'Invalid URL format', 400);
    }

    // Check for duplicate source
    const existing = await prisma.listingSource.findFirst({
      where: {
        sourceUrl,
        storefrontId: auth.storefrontId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    if (existing) {
      return errorResponse('ALREADY_EXISTS', 'This URL is already being processed', 400);
    }

    // Create listing source record
    const source = await prisma.listingSource.create({
      data: {
        sourceUrl,
        sourceType: SourceType.URL_CRAWL,
        status: IngestionStatus.PENDING,
        storefrontId: auth.storefrontId,
        extractedData: { autoPublish },
      },
    });

    // Create a job for the worker to process
    const job = await prisma.job.create({
      data: {
        type: 'INGEST_URL',
        payload: {
          sourceId: source.id,
          sourceUrl,
          storefrontId: auth.storefrontId,
          agentId: auth.agentId,
          autoPublish,
        },
        priority: 0,
      },
    });

    // Log the ingestion request
    await prisma.auditLog.create({
      data: {
        action: 'INGESTION_REQUESTED',
        entityType: 'ListingSource',
        entityId: source.id,
        agentId: auth.agentId,
        metadata: { sourceUrl, jobId: job.id },
      },
    });

    return successResponse({
      sourceId: source.id,
      jobId: job.id,
      status: 'PENDING',
      message: 'URL submitted for ingestion. Our clawdbots will process it shortly! 🦞',
    }, undefined, 202);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/ingestion - List ingestion jobs for the authenticated seller
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAgentType(request, ['SELLER', 'ADMIN']);
    
    if (!auth.storefrontId && auth.agentType !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 'Seller must have a storefront', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const where: any = {};

    if (auth.agentType !== 'ADMIN') {
      where.storefrontId = auth.storefrontId;
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.listingSource.count({ where });

    const sources = await prisma.listingSource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return successResponse(sources, {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
