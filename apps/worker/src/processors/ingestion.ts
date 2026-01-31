import { prisma } from '@clawdslist/db'
import { slugify } from '@clawdslist/shared'

interface IngestionJobData {
  sourceId: string
  sourceUrl: string
  userId: string
  storefrontId?: string
}

interface ExtractedData {
  title: string
  description: string
  price: number
  currency: string
  images: string[]
  condition?: string
  tags?: string[]
}

// Simulated Firecrawl/Reducto extraction
// In production, integrate with actual Firecrawl or Reducto APIs
async function extractFromUrl(url: string): Promise<ExtractedData> {
  console.log(`Extracting data from: ${url}`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // For MVP, return mock data based on URL patterns
  // In production, use Firecrawl or Reducto
  const mockData: ExtractedData = {
    title: `Imported Item from ${new URL(url).hostname}`,
    description: `This item was automatically imported from ${url}. Please review and update the description as needed.`,
    price: Math.floor(Math.random() * 200) + 10,
    currency: 'USD',
    images: [
      `https://placehold.co/800x600/FF6B35/FFFFFF?text=${encodeURIComponent('Imported Item')}`,
    ],
    condition: 'GOOD',
    tags: ['imported', 'auto-extracted'],
  }

  return mockData
}

export async function processIngestion(data: IngestionJobData) {
  const { sourceId, sourceUrl, userId, storefrontId } = data

  try {
    // Update source status to processing
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: { status: 'PROCESSING' },
    })

    // Extract data from URL
    const extracted = await extractFromUrl(sourceUrl)

    // Generate unique slug
    let slug = slugify(extracted.title)
    const existingSlug = await prisma.listing.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        userId,
        storefrontId,
        title: extracted.title,
        slug,
        description: extracted.description,
        price: extracted.price,
        currency: extracted.currency,
        condition: (extracted.condition as any) || 'GOOD',
        status: 'PENDING_REVIEW', // Require manual review for imported listings
        tags: extracted.tags || [],
      },
    })

    // Add media assets
    for (let i = 0; i < extracted.images.length; i++) {
      await prisma.mediaAsset.create({
        data: {
          listingId: listing.id,
          url: extracted.images[i],
          mimeType: 'image/jpeg',
          sortOrder: i,
        },
      })
    }

    // Update source with result
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: {
        listingId: listing.id,
        status: 'COMPLETED',
        processedAt: new Date(),
        rawPayload: extracted as any,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'INGESTION_COMPLETED',
        entityType: 'Listing',
        entityId: listing.id,
        metadata: { sourceUrl, sourceId },
      },
    })

    console.log(`Created listing ${listing.id} from source ${sourceId}`)

    return {
      success: true,
      listingId: listing.id,
      title: extracted.title,
    }
  } catch (error) {
    console.error(`Ingestion failed for source ${sourceId}:`, error)

    // Update source with error
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    throw error
  }
}
