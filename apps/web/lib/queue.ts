import { Queue } from "bullmq";
import IORedis from "ioredis";

let _queue: Queue | null = null;

export function getIngestionQueue() {
  if (_queue) return _queue;
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  _queue = new Queue("ingestion", { connection });
  return _queue;
}

