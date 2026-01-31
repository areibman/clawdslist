import { NextRequest, NextResponse } from 'next/server';
import { prisma, IngestionStatus } from '@clawdslist/db';
import { ingestionRequestSchema } from '@clawdslist/shared';
import { verifyAgentApiKey } from '@/lib/auth';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Initialize Redis connection for job queue
const getRedisConnection = () => {
  return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
};

/**
 * POST /api/ingestion
 * Submit a URL or data for ingestion into a listing
 * 
 * Headers:
 *   X-Agent-Key: <api_key>
 * 
 * Body:
 *   {
 *     "sourceUrl": "string" (optional),
 *     "sourceType": "url" | "upload" | "api",
 *     "rawData": { ... } (optional)
 *   }
 */
export async function POST(request: NextRequest) {
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

    // Get storefront for the agent
    const storefront = await prisma.storefront.findFirst({
      where: { agentId: agent.id, isActive: true },
    });

    if (!storefront) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_STOREFRONT', message: 'No active storefront found for this agent' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const data = ingestionRequestSchema.parse(body);

    // Validate input
    if (data.sourceType === 'url' && !data.sourceUrl) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'sourceUrl is required for url source type' } },
        { status: 400 }
      );
    }

    if ((data.sourceType === 'upload' || data.sourceType === 'api') && !data.rawData) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'rawData is required for upload/api source type' } },
        { status: 400 }
      );
    }

    // Create listing source record
    const listingSource = await prisma.listingSource.create({
      data: {
        sourceUrl: data.sourceUrl,
        sourceType: data.sourceType,
        rawPayload: data.rawData as any,
        status: IngestionStatus.QUEUED,
        storefrontId: storefront.id,
      },
    });

    // Queue the ingestion job
    try {
      const connection = getRedisConnection();
      const ingestionQueue = new Queue('ingestion', { connection });
      
      await ingestionQueue.add(
        'process-ingestion',
        { listingSourceId: listingSource.id },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );
      
      await connection.quit();
    } catch (queueError) {
      console.error('Failed to queue ingestion job:', queueError);
      // Update status to reflect queuing failure but don't fail the request
      await prisma.listingSource.update({
        where: { id: listingSource.id },
        data: { 
          status: IngestionStatus.FAILED,
          errorMessage: 'Failed to queue ingestion job',
        },
      });
    }

    // Log the ingestion request
    await prisma.auditLog.create({
      data: {
        action: 'INGESTION_SUBMITTED',
        entityType: 'ListingSource',
        entityId: listingSource.id,
        agentId: agent.id,
        metadata: {
          sourceType: data.sourceType,
          sourceUrl: data.sourceUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: listingSource.id,
        status: listingSource.status,
        message: 'Ingestion job queued. Check status using the returned ID.',
      },
    }, { status: 202 });
  } catch (error) {
    console.error('Ingestion error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process ingestion request' } },
      { status: 500 }
    );
  }
}
