import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
};

let ingestionQueue: Queue | null = null;

export const getIngestionQueue = () => {
  if (!ingestionQueue) {
    ingestionQueue = new Queue("ingestion", { connection });
  }
  return ingestionQueue;
};

export const enqueueIngestion = async (payload: {
  storefrontId: string;
  sourceUrl: string;
  listingSourceId?: string;
}) => {
  const queue = getIngestionQueue();
  return queue.add("ingest-storefront", payload, {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  });
};
