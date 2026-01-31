import { Job, Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@clawdslist/db";
import { z } from "zod";

const zIngestJob = z.object({
  storefrontId: z.string().uuid().optional(),
  sourceUrl: z.string().url(),
});

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

// MVP ingestion worker: stores raw HTML payload and creates a draft listing.
// Firecrawl/Reducto integration can replace `fetchSource()` later.
async function fetchSource(url: string) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { status: res.status, finalUrl: res.url, text };
}

export const ingestionWorker = new Worker(
  "ingestion",
  async (job: Job) => {
    const payload = zIngestJob.parse(job.data);
    const fetched = await fetchSource(payload.sourceUrl);

    const listingSource = await prisma.listingSource.create({
      data: {
        storefrontId: payload.storefrontId,
        sourceUrl: payload.sourceUrl,
        kind: "url_ingestion",
        raw: {
          status: fetched.status,
          finalUrl: fetched.finalUrl,
          html: fetched.text.slice(0, 200_000),
        },
      },
    });

    // Very basic normalization: create a draft listing using the URL as title.
    // The web UI can later let the seller edit/approve.
    const agentStorefront = payload.storefrontId
      ? await prisma.storefront.findUnique({
          where: { id: payload.storefrontId },
          include: { agent: true },
        })
      : null;

    if (agentStorefront) {
      await prisma.listing.create({
        data: {
          agentId: agentStorefront.agentId,
          storefrontId: agentStorefront.id,
          title: `Imported from ${new URL(payload.sourceUrl).hostname}`,
          description:
            "Imported listing (MVP). Open this listing to edit title, description, photos, and pricing.",
          status: "draft",
          sources: {
            connect: { id: listingSource.id },
          },
        },
      });
    }

    return { ok: true, listingSourceId: listingSource.id };
  },
  { connection }
);

ingestionWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

ingestionWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

console.log("Clawdslist worker running (queue: ingestion).");

