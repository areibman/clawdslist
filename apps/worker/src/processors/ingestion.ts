import { prisma, IngestionStatus, ListingStatus } from '@clawdslist/db';
import { NormalizedListingData } from '@clawdslist/shared';

/**
 * Process a listing source ingestion job
 * This would integrate with Firecrawl/Reducto in production
 */
export async function processIngestion(listingSourceId: string): Promise<void> {
  // Get the listing source
  const listingSource = await prisma.listingSource.findUnique({
    where: { id: listingSourceId },
    include: { storefront: true },
  });

  if (!listingSource) {
    throw new Error(`ListingSource not found: ${listingSourceId}`);
  }

  // Update status to processing
  await prisma.listingSource.update({
    where: { id: listingSourceId },
    data: { status: IngestionStatus.PROCESSING },
  });

  try {
    let normalizedData: NormalizedListingData;

    if (listingSource.sourceType === 'url' && listingSource.sourceUrl) {
      // URL-based ingestion (would use Firecrawl/Reducto in production)
      normalizedData = await extractFromUrl(listingSource.sourceUrl);
    } else if (listingSource.sourceType === 'upload' || listingSource.sourceType === 'api') {
      // Direct data submission
      normalizedData = normalizeRawData(listingSource.rawPayload as Record<string, unknown>);
    } else {
      throw new Error('Invalid source type or missing source URL');
    }

    // Generate a unique slug
    const slug = generateSlug(normalizedData.title);

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        title: normalizedData.title,
        slug: slug,
        description: normalizedData.description,
        priceUsd: normalizedData.price || 0,
        status: ListingStatus.PENDING_REVIEW,
        storefrontId: listingSource.storefrontId,
      },
    });

    // Create media assets if images provided
    if (normalizedData.images && normalizedData.images.length > 0) {
      await prisma.mediaAsset.createMany({
        data: normalizedData.images.map((url, index) => ({
          url,
          filename: `image-${index + 1}`,
          mimeType: 'image/jpeg',
          sortOrder: index,
          listingId: listing.id,
        })),
      });
    }

    // Update the listing source with success
    await prisma.listingSource.update({
      where: { id: listingSourceId },
      data: {
        status: IngestionStatus.COMPLETED,
        normalizedData: normalizedData as any,
        listingId: listing.id,
        processedAt: new Date(),
      },
    });

    console.log(`✅ Created listing ${listing.id} from source ${listingSourceId}`);
  } catch (error) {
    // Update the listing source with failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await prisma.listingSource.update({
      where: { id: listingSourceId },
      data: {
        status: IngestionStatus.FAILED,
        errorMessage,
        retryCount: { increment: 1 },
      },
    });

    throw error;
  }
}

/**
 * Extract listing data from a URL
 * In production, this would use Firecrawl or Reducto
 */
async function extractFromUrl(url: string): Promise<NormalizedListingData> {
  console.log(`🔍 Extracting data from URL: ${url}`);
  
  // Mock extraction for MVP
  // In production, integrate with Firecrawl:
  // const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  // const result = await firecrawl.scrapeUrl(url, { formats: ['markdown', 'html'] });
  
  // For now, return mock data based on URL
  const domain = new URL(url).hostname;
  
  return {
    title: `Product from ${domain}`,
    description: `This product was automatically imported from ${url}. Please edit the description to add more details about your listing.`,
    price: 99.99,
    currency: 'USD',
    images: [],
    attributes: {
      sourceUrl: url,
      importedAt: new Date().toISOString(),
    },
  };
}

/**
 * Normalize raw data into listing format
 */
function normalizeRawData(rawData: Record<string, unknown>): NormalizedListingData {
  return {
    title: (rawData.title as string) || 'Untitled Listing',
    description: (rawData.description as string) || 'No description provided.',
    price: typeof rawData.price === 'number' ? rawData.price : parseFloat(rawData.price as string) || 0,
    currency: (rawData.currency as string) || 'USD',
    images: Array.isArray(rawData.images) ? rawData.images : [],
    attributes: rawData.attributes as Record<string, unknown> || {},
  };
}

/**
 * Generate a URL-safe slug from a title
 */
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
  
  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${baseSlug}-${suffix}`;
}
