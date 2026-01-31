import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { ingestUrlSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';
import { enqueueUrlIngestion } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const body = await request.json();
    const data = ingestUrlSchema.parse(body);

    // Create source record
    const source = await prisma.listingSource.create({
      data: {
        sourceType: 'url',
        sourceUrl: data.url,
        storefrontId: data.storefrontId,
        status: 'pending',
      },
    });

    // Enqueue job
    await enqueueUrlIngestion({
      sourceId: source.id,
      url: data.url,
      storefrontId: data.storefrontId,
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'ingestion.url_submitted',
        entityType: 'ListingSource',
        entityId: source.id,
        metadata: { sourceId: source.id, url: data.url },
      },
    });

    return NextResponse.json({ source });
  } catch (error: any) {
    console.error('URL ingestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start ingestion' },
      { status: 400 }
    );
  }
}
