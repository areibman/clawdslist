import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { z } from 'zod';

const ingestUrlSchema = z.object({
  sourceUrl: z.string().url(),
  storefrontId: z.string().optional(),
});

// POST /api/ingestion/url - Ingest listing from URL
export async function POST(req: NextRequest) {
  try {
    const agent = await authenticateRequest(req);
    
    // For demo, allow unauthenticated ingestion
    let agentId = agent?.id;
    if (!agentId) {
      const demoAgent = await prisma.agent.findFirst({
        where: { email: 'seller-bot@clawdslist.com' },
      });
      agentId = demoAgent?.id;
    }

    const body = await req.json();
    const data = ingestUrlSchema.parse(body);

    // Create listing source record
    const listingSource = await prisma.listingSource.create({
      data: {
        sourceType: 'URL_CRAWL',
        sourceUrl: data.sourceUrl,
        storefrontId: data.storefrontId,
        status: 'PENDING',
      },
    });

    // In production, this would:
    // 1. Enqueue a job to the worker via Redis
    // 2. Worker would use Firecrawl/Reducto to extract data
    // 3. Worker would create the listing from extracted data

    // For demo, simulate the ingestion process
    setTimeout(async () => {
      try {
        // Simulate extraction delay
        await prisma.listingSource.update({
          where: { id: listingSource.id },
          data: {
            status: 'PROCESSING',
          },
        });

        // Simulate extracted data
        const extractedData = {
          title: `Imported: ${new URL(data.sourceUrl).hostname} Product`,
          description: `This listing was automatically imported from ${data.sourceUrl}. The content would be extracted using Firecrawl/Reducto in production.`,
          price: Math.floor(Math.random() * 500) + 10,
          images: [`https://placehold.co/600x400/dc2626/ffffff?text=Imported`],
        };

        // Get default category
        const category = await prisma.category.findFirst();

        if (category && agentId) {
          // Create the listing
          const listing = await prisma.listing.create({
            data: {
              agentId,
              storefrontId: data.storefrontId,
              categoryId: category.id,
              title: extractedData.title,
              slug: `imported-${Date.now()}`,
              description: extractedData.description,
              price: extractedData.price,
              status: 'PENDING_REVIEW',
              isDigital: false,
            },
          });

          // Update source with listing reference
          await prisma.listingSource.update({
            where: { id: listingSource.id },
            data: {
              listingId: listing.id,
              status: 'COMPLETED',
              processedAt: new Date(),
              rawPayload: extractedData,
            },
          });

          // Create media asset
          await prisma.mediaAsset.create({
            data: {
              listingId: listing.id,
              url: extractedData.images[0],
              type: 'IMAGE',
              sortOrder: 0,
            },
          });
        }
      } catch (error) {
        console.error('Ingestion processing error:', error);
        await prisma.listingSource.update({
          where: { id: listingSource.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Processing failed',
          },
        });
      }
    }, 2000);

    await prisma.auditLog.create({
      data: {
        agentId,
        action: 'URL_INGESTION_STARTED',
        entityType: 'ListingSource',
        entityId: listingSource.id,
        metadata: { sourceUrl: data.sourceUrl },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sourceId: listingSource.id,
        status: 'PENDING',
        message: 'Ingestion job queued. The listing will be created once processing completes.',
      },
    }, { status: 202 });
  } catch (error) {
    console.error('Error starting URL ingestion:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to start URL ingestion' },
      { status: 500 }
    );
  }
}

// GET /api/ingestion/url - Check ingestion status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'sourceId required' },
        { status: 400 }
      );
    }

    const source = await prisma.listingSource.findUnique({
      where: { id: sourceId },
      include: {
        listing: {
          include: {
            media: { take: 1 },
          },
        },
      },
    });

    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error('Error checking ingestion status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
