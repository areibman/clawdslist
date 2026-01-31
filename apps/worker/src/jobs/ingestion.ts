import { prisma } from '../db';
import { IngestionStatus, ListingCondition, ListingStatus } from '@prisma/client';

interface IngestionJobData {
  jobId: string;
  sourceId: string;
  sourceUrl: string;
  storefrontId: string;
  agentId: string;
  autoPublish: boolean;
}

interface ExtractedListing {
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  condition?: string;
  category?: string;
}

/**
 * Mock Firecrawl extraction - in production, use the actual Firecrawl API
 */
async function extractFromUrl(url: string): Promise<ExtractedListing> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Parse URL to create mock data
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  // Generate mock extracted data based on URL
  return {
    title: `Product from ${hostname}`,
    description: `This product was automatically extracted from ${url}. 

In production, Firecrawl/Reducto would extract the actual product details including:
- Full product description
- Specifications
- Features
- Pricing information

🦞 Shell yeah! Our clawdbots are getting smarter!`,
    price: Math.floor(Math.random() * 500) + 50,
    currency: 'USD',
    images: [
      `https://picsum.photos/seed/${Date.now()}/800/600`,
    ],
    condition: 'NEW',
    category: 'tech-merch',
  };
}

/**
 * Process URL ingestion job
 */
export async function processIngestionJob(data: IngestionJobData): Promise<void> {
  const { jobId, sourceId, sourceUrl, storefrontId, agentId, autoPublish } = data;

  try {
    // Update source status to processing
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: { status: IngestionStatus.PROCESSING },
    });

    console.log(`🦞 Crawling URL: ${sourceUrl}`);

    // Extract data from URL
    const extracted = await extractFromUrl(sourceUrl);

    // Store raw extraction
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: {
        rawPayload: { url: sourceUrl, extracted },
        extractedData: extracted,
      },
    });

    // Find category
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: extracted.category || '' },
          { slug: 'tech-merch' }, // Default category
        ],
      },
    });

    if (!category) {
      throw new Error('No category found');
    }

    // Create listing slug
    const baseSlug = extracted.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title: extracted.title,
        slug,
        description: extracted.description,
        price: extracted.price,
        currency: extracted.currency,
        quantity: 1,
        condition: (extracted.condition as ListingCondition) || ListingCondition.NEW,
        status: autoPublish ? ListingStatus.ACTIVE : ListingStatus.PENDING_REVIEW,
        storefrontId,
        categoryId: category.id,
        agentId,
        ...(autoPublish && { publishedAt: new Date() }),
        media: {
          create: extracted.images.map((url, index) => ({
            url,
            thumbnailUrl: url,
            type: 'IMAGE',
            sortOrder: index,
          })),
        },
      },
    });

    // Update source with listing reference
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: {
        status: autoPublish ? IngestionStatus.COMPLETED : IngestionStatus.NEEDS_REVIEW,
        listingId: listing.id,
        processedAt: new Date(),
      },
    });

    // Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Log success
    await prisma.auditLog.create({
      data: {
        action: 'INGESTION_COMPLETED',
        entityType: 'Listing',
        entityId: listing.id,
        agentId,
        metadata: {
          sourceUrl,
          sourceId,
          autoPublish,
          title: extracted.title,
        },
      },
    });

    console.log(`✅ Created listing: ${listing.title}`);
  } catch (error) {
    console.error('Ingestion error:', error);

    // Update source with error
    await prisma.listingSource.update({
      where: { id: sourceId },
      data: {
        status: IngestionStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Log failure
    await prisma.auditLog.create({
      data: {
        action: 'INGESTION_FAILED',
        entityType: 'ListingSource',
        entityId: sourceId,
        agentId,
        metadata: {
          sourceUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    });

    throw error;
  }
}
