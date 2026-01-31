import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { config } from 'dotenv';
import { handleUrlIngestion } from './jobs/url-ingestion';
import { handleDirectUpload } from './jobs/direct-upload';

config();

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'ingestion',
  async (job) => {
    console.log(`🦞 Processing job ${job.id} of type ${job.name}`);

    try {
      if (job.name === 'ingest-url') {
        await handleUrlIngestion(job.data);
      } else if (job.name === 'direct-upload') {
        await handleDirectUpload(job.data);
      } else {
        throw new Error(`Unknown job type: ${job.name}`);
      }

      console.log(`✅ Completed job ${job.id}`);
    } catch (error) {
      console.error(`❌ Failed job ${job.id}:`, error);
      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('🦞 Clawdslist worker started');
