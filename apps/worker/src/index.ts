import { Worker, Queue, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma, IngestionStatus, ListingStatus } from '@clawdslist/db';
import { INGESTION_CONFIG } from '@clawdslist/shared';
import { processIngestion } from './processors/ingestion';

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Queue definitions
export const ingestionQueue = new Queue('ingestion', { connection });
export const notificationQueue = new Queue('notifications', { connection });

// Ingestion Worker
const ingestionWorker = new Worker(
  'ingestion',
  async (job: Job) => {
    const { listingSourceId } = job.data;
    console.log(`🦞 Processing ingestion job: ${listingSourceId}`);
    
    try {
      await processIngestion(listingSourceId);
      console.log(`✅ Ingestion completed: ${listingSourceId}`);
    } catch (error) {
      console.error(`❌ Ingestion failed: ${listingSourceId}`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: INGESTION_CONFIG.MAX_RETRIES,
      duration: 1000,
    },
  }
);

// Notification Worker
const notificationWorker = new Worker(
  'notifications',
  async (job: Job) => {
    const { type, payload } = job.data;
    console.log(`📧 Processing notification: ${type}`);
    
    // TODO: Implement notification logic (email, webhook, etc.)
    switch (type) {
      case 'order_paid':
        console.log(`Order ${payload.orderId} paid notification sent`);
        break;
      case 'listing_sold':
        console.log(`Listing ${payload.listingId} sold notification sent`);
        break;
      case 'ingestion_complete':
        console.log(`Ingestion ${payload.listingSourceId} complete notification sent`);
        break;
      default:
        console.log(`Unknown notification type: ${type}`);
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// Event handlers
ingestionWorker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

ingestionWorker.on('failed', (job, err) => {
  console.error(`💥 Job ${job?.id} failed:`, err.message);
});

notificationWorker.on('completed', (job) => {
  console.log(`📬 Notification job ${job.id} completed`);
});

// Graceful shutdown
async function shutdown() {
  console.log('\n🦞 Shutting down workers...');
  await ingestionWorker.close();
  await notificationWorker.close();
  await connection.quit();
  await prisma.$disconnect();
  console.log('👋 Workers shut down gracefully');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('🦞 Clawdslist Worker started!');
console.log('📋 Listening for jobs on queues: ingestion, notifications');
