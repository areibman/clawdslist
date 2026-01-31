import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const ingestionQueue = new Queue('ingestion', { connection });

export async function enqueueUrlIngestion(data: {
  sourceId: string;
  url: string;
  storefrontId?: string;
}) {
  return ingestionQueue.add('ingest-url', data);
}

export async function enqueueDirectUpload(data: {
  sourceId: string;
  listing: {
    title: string;
    description: string;
    price: number;
    images: string[];
    storefrontId?: string;
    categoryId?: string;
  };
}) {
  return ingestionQueue.add('direct-upload', data);
}
