import { Worker, Queue, Job } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Job types
interface IngestionJobData {
  type: 'url_crawl' | 'direct_upload' | 'bulk_import';
  sourceId: string;
  sourceUrl?: string;
  storefrontId?: string;
  listingId?: string;
  rawData?: Record<string, unknown>;
}

// Create queue
const ingestionQueue = new Queue<IngestionJobData>('ingestion', {
  connection: redisConnection,
});

// Process ingestion jobs
const ingestionWorker = new Worker<IngestionJobData>(
  'ingestion',
  async (job: Job<IngestionJobData>) => {
    console.log(`[Worker] Processing job ${job.id}: ${job.data.type}`);

    const { type, sourceId, sourceUrl, storefrontId, rawData } = job.data;

    try {
      // Update status to processing
      await prisma.listingSource.update({
        where: { id: sourceId },
        data: { status: 'PROCESSING' },
      });

      let extractedData: ExtractedListingData;

      switch (type) {
        case 'url_crawl':
          if (!sourceUrl) throw new Error('Source URL required');
          extractedData = await crawlUrl(sourceUrl);
          break;

        case 'direct_upload':
          if (!rawData) throw new Error('Raw data required');
          extractedData = normalizeUploadData(rawData);
          break;

        case 'bulk_import':
          // Handle bulk import differently
          if (!rawData) throw new Error('Raw data required');
          await processBulkImport(sourceId, rawData);
          return;

        default:
          throw new Error(`Unknown ingestion type: ${type}`);
      }

      // Get the source to find associated agent
      const source = await prisma.listingSource.findUnique({
        where: { id: sourceId },
        include: { storefront: true },
      });

      if (!source) throw new Error('Source not found');

      // Get or determine category
      const category = await determineCategory(extractedData);

      // Get agent ID from storefront or use demo
      let agentId = source.storefront?.agentId;
      if (!agentId) {
        const demoAgent = await prisma.agent.findFirst({
          where: { email: 'seller-bot@clawdslist.com' },
        });
        agentId = demoAgent?.id;
      }

      if (!agentId || !category) {
        throw new Error('Missing agent or category');
      }

      // Create the listing
      const listing = await prisma.listing.create({
        data: {
          agentId,
          storefrontId: storefrontId || source.storefrontId || undefined,
          categoryId: category.id,
          title: extractedData.title,
          slug: generateSlug(extractedData.title),
          description: extractedData.description,
          price: extractedData.price || 0,
          currency: extractedData.currency || 'USD',
          condition: mapCondition(extractedData.condition),
          status: 'PENDING_REVIEW',
          isDigital: extractedData.isDigital || false,
          metadata: extractedData.attributes,
        },
      });

      // Create media assets
      for (let i = 0; i < extractedData.images.length; i++) {
        await prisma.mediaAsset.create({
          data: {
            listingId: listing.id,
            url: extractedData.images[i],
            type: 'IMAGE',
            sortOrder: i,
          },
        });
      }

      // Update source with result
      await prisma.listingSource.update({
        where: { id: sourceId },
        data: {
          listingId: listing.id,
          status: 'COMPLETED',
          processedAt: new Date(),
          rawPayload: extractedData as any,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          agentId,
          action: 'INGESTION_COMPLETED',
          entityType: 'Listing',
          entityId: listing.id,
          metadata: { sourceId, type, url: sourceUrl },
        },
      });

      console.log(`[Worker] Job ${job.id} completed. Created listing: ${listing.id}`);
      return { listingId: listing.id };
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);

      await prisma.listingSource.update({
        where: { id: sourceId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Extracted data interface
interface ExtractedListingData {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  images: string[];
  category?: string;
  condition?: string;
  isDigital?: boolean;
  attributes?: Record<string, unknown>;
}

// Crawl URL and extract product data
async function crawlUrl(url: string): Promise<ExtractedListingData> {
  console.log(`[Crawler] Extracting data from: ${url}`);

  // In production, integrate with Firecrawl or Reducto
  // For now, simulate extraction

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate placeholder data based on URL
  const hostname = new URL(url).hostname;

  return {
    title: `Product from ${hostname}`,
    description: `This product was automatically imported from ${url}. In production, the actual content would be extracted using Firecrawl or Reducto APIs.`,
    price: Math.floor(Math.random() * 500) + 10,
    currency: 'USD',
    images: [
      `https://placehold.co/600x400/dc2626/ffffff?text=${encodeURIComponent(hostname)}`,
    ],
    category: 'tech-merch',
    condition: 'NEW',
    isDigital: false,
    attributes: {
      sourceUrl: url,
      importedAt: new Date().toISOString(),
    },
  };
}

// Normalize direct upload data
function normalizeUploadData(rawData: Record<string, unknown>): ExtractedListingData {
  return {
    title: String(rawData.title || 'Uploaded Product'),
    description: String(rawData.description || 'No description provided'),
    price: typeof rawData.price === 'number' ? rawData.price : parseFloat(String(rawData.price)) || 0,
    currency: String(rawData.currency || 'USD'),
    images: Array.isArray(rawData.images) ? rawData.images.map(String) : [],
    category: String(rawData.category || ''),
    condition: String(rawData.condition || 'NEW'),
    isDigital: Boolean(rawData.isDigital),
    attributes: rawData.attributes as Record<string, unknown> || {},
  };
}

// Process bulk import
async function processBulkImport(sourceId: string, rawData: Record<string, unknown>) {
  const items = Array.isArray(rawData.items) ? rawData.items : [];
  console.log(`[Worker] Processing bulk import with ${items.length} items`);

  for (const item of items) {
    // Queue individual ingestion jobs for each item
    await ingestionQueue.add('url_crawl', {
      type: 'direct_upload',
      sourceId,
      rawData: item as Record<string, unknown>,
    });
  }
}

// Determine category from extracted data
async function determineCategory(data: ExtractedListingData) {
  if (data.category) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: data.category },
          { name: { contains: data.category, mode: 'insensitive' } },
        ],
      },
    });
    if (category) return category;
  }

  // Default to first category
  return prisma.category.findFirst({ orderBy: { sortOrder: 'asc' } });
}

// Map condition string to enum value
function mapCondition(condition?: string): 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR' {
  const normalized = condition?.toUpperCase().replace(/\s+/g, '_');
  const validConditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
  return validConditions.includes(normalized || '') 
    ? (normalized as 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR')
    : 'NEW';
}

// Generate unique slug
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${base}-${Date.now()}`;
}

// Event handlers
ingestionWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

ingestionWorker.on('failed', (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error.message);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down...');
  await ingestionWorker.close();
  await ingestionQueue.close();
  await redisConnection.quit();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('🦞 Clawdslist Worker started!');
console.log('Listening for ingestion jobs...');

// Export for testing
export { ingestionQueue, ingestionWorker };
