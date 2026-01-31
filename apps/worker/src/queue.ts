import { Queue, Worker } from "bullmq";

export const connection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
};

export const getIngestionQueue = () => new Queue("ingestion", { connection });

export const createIngestionWorker = (
  processor: Parameters<typeof Worker>[1]
) => {
  return new Worker("ingestion", processor, { connection });
};
