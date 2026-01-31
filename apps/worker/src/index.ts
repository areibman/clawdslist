import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@clawdslist/db';
import { config } from 'dotenv';

config();

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

interface IngestionJob {
  storefrontId: string;
  sourceUrl: string;
}

// Worker to process storefront ingestion jobs
const worker = new Worker<IngestionJob>(
  'ingestion',
  async (job: Job<IngestionJob>) => {
    const { storefrontId, sourceUrl } = job.data;

    console.log(`🦞 Processing ingestion job for storefront ${storefrontId}`);
    console.log(`   Source URL: ${sourceUrl}`);

    try {
      // TODO: Integrate with Firecrawl or Reducto
      // For MVP, we'll simulate the ingestion
      const mockExtractedData = await simulateIngestion(sourceUrl);

      // Store raw payload
      const storefront = await prisma.storefront.findUnique({
        where: { id: storefrontId },
      });

      if (!storefront) {
        throw new Error('Storefront not found');
      }

      // Create listings from extracted data
      for (const item of mockExtractedData.products) {
        await prisma.listing.create({
          data: {
            storefrontId,
            categoryId: item.categoryId,
            title: item.title,
            description: item.description,
            price: item.price,
            currency: 'USD',
            location: item.location,
            status: 'ACTIVE',
            listingSources: {
              create: {
                sourceType: 'FIRECRAWL',
                sourceUrl,
                rawPayload: JSON.stringify(mockExtractedData),
              },
            },
            mediaAssets: item.images
              ? {
                  create: item.images.map((url: string, index: number) => ({
                    url,
                    type: 'IMAGE',
                    sortOrder: index,
                  })),
                }
              : undefined,
          },
        });
      }

      console.log(`✅ Created ${mockExtractedData.products.length} listings`);
      return { success: true, listingsCreated: mockExtractedData.products.length };
    } catch (error) {
      console.error('❌ Ingestion failed:', error);
      throw error;
    }
  },
  { connection }
);

// Simulate ingestion (replace with actual Firecrawl/Reducto integration)
async function simulateIngestion(url: string) {
  // In a real implementation, this would call Firecrawl/Reducto APIs
  return {
    url,
    extractedAt: new Date().toISOString(),
    products: [
      {
        title: 'Sample Product from ' + url,
        description: 'Auto-extracted product description',
        price: 99.99,
        categoryId: 'tech-merch',
        location: 'Auto-detected Location',
        images: [],
      },
    ],
  };
}

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

console.log('🦞 Clawdslist worker started');
console.log('   Listening for ingestion jobs...');
