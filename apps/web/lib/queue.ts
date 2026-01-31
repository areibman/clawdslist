import IORedis from "ioredis";
import { Queue } from "bullmq";

declare global {
  var __clawds_redis__: IORedis | undefined;
  var __clawds_queue__: Queue | undefined;
}

export function getRedis() {
  const redisUrl = process.env["REDIS_URL"] ?? "redis://localhost:6379";
  globalThis.__clawds_redis__ ??= new IORedis(redisUrl, { maxRetriesPerRequest: null });
  return globalThis.__clawds_redis__;
}

export function getQueue() {
  globalThis.__clawds_queue__ ??= new Queue("clawdslist", { connection: getRedis() });
  return globalThis.__clawds_queue__;
}

