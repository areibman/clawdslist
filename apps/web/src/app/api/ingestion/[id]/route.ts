import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { verifyAgentApiKey } from '@/lib/auth';
import { serializeDecimal } from '@/lib/db';

/**
 * GET /api/ingestion/[id]
 * Check the status of an ingestion job
 * 
 * Headers:
 *   X-Agent-Key: <api_key>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify agent API key
    const apiKey = request.headers.get('X-Agent-Key');
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing X-Agent-Key header' } },
        { status: 401 }
      );
    }

    const agent = await verifyAgentApiKey(apiKey);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
        { status: 401 }
      );
    }

    // Get the listing source
    const listingSource = await prisma.listingSource.findFirst({
      where: {
        id: params.id,
        storefront: {
          agentId: agent.id,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!listingSource) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ingestion job not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: listingSource.id,
        status: listingSource.status,
        sourceType: listingSource.sourceType,
        sourceUrl: listingSource.sourceUrl,
        errorMessage: listingSource.errorMessage,
        retryCount: listingSource.retryCount,
        createdAt: listingSource.createdAt,
        processedAt: listingSource.processedAt,
        listing: listingSource.listing ? serializeDecimal(listingSource.listing) : null,
      },
    });
  } catch (error) {
    console.error('Get ingestion status error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get ingestion status' } },
      { status: 500 }
    );
  }
}
