import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { directUploadSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';
import { enqueueDirectUpload } from '@/lib/queue';

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
    const data = directUploadSchema.parse(body);

    // Create source record
    const source = await prisma.listingSource.create({
      data: {
        sourceType: 'upload',
        storefrontId: data.storefrontId,
        status: 'pending',
        rawPayload: data,
      },
    });

    // Enqueue job
    await enqueueDirectUpload({
      sourceId: source.id,
      listing: data,
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'ingestion.upload_submitted',
        entityType: 'ListingSource',
        entityId: source.id,
        metadata: { sourceId: source.id },
      },
    });

    return NextResponse.json({ source });
  } catch (error: any) {
    console.error('Upload ingestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process upload' },
      { status: 400 }
    );
  }
}
