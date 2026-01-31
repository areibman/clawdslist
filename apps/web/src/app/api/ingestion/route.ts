import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'
// Note: In production, import the queue from a shared module
// import { ingestionQueue } from '@clawdslist/worker'

const IngestionSchema = z.object({
  sourceUrl: z.string().url(),
  storefrontId: z.string().optional(),
})

// POST /api/ingestion - Submit a URL for ingestion
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } },
        { status: 401 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { apiKey },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = IngestionSchema.parse(body)

    // Verify storefront ownership if provided
    if (validated.storefrontId) {
      const storefront = await prisma.storefront.findFirst({
        where: {
          id: validated.storefrontId,
          userId: user.id,
        },
      })

      if (!storefront) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Storefront not found or not owned by user' } },
          { status: 404 }
        )
      }
    }

    // Create listing source record
    const source = await prisma.listingSource.create({
      data: {
        sourceUrl: validated.sourceUrl,
        storefrontId: validated.storefrontId,
        sourceType: 'FIRECRAWL',
        status: 'PENDING',
      },
    })

    // In production, add job to queue:
    // await ingestionQueue.add('ingest', {
    //   sourceId: source.id,
    //   sourceUrl: validated.sourceUrl,
    //   userId: user.id,
    //   storefrontId: validated.storefrontId,
    // })

    // For MVP without Redis, simulate async processing
    // In production, this would be handled by the worker
    console.log(`Ingestion job queued: ${source.id}`)

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUBMIT_INGESTION',
        entityType: 'ListingSource',
        entityId: source.id,
        metadata: { sourceUrl: validated.sourceUrl },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sourceId: source.id,
        status: source.status,
        message: 'URL submitted for ingestion. Check back for status updates.',
      },
    }, { status: 202 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error submitting ingestion:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INGESTION_ERROR', message: 'Failed to submit for ingestion' } },
      { status: 500 }
    )
  }
}

// GET /api/ingestion - List ingestion jobs for user
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } },
        { status: 401 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { apiKey },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    // Get storefronts owned by user
    const storefronts = await prisma.storefront.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const storefrontIds = storefronts.map(s => s.id)

    const sources = await prisma.listingSource.findMany({
      where: {
        storefrontId: { in: storefrontIds },
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      data: sources,
    })
  } catch (error) {
    console.error('Error fetching ingestion jobs:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch ingestion jobs' } },
      { status: 500 }
    )
  }
}
