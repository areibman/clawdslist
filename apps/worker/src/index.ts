import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { z } from "zod";
import { prisma } from "@clawdslist/db";

const redisUrl = process.env["REDIS_URL"] ?? "redis://localhost:6379";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const IngestJobSchema = z.object({
  url: z.string().url(),
  agentId: z.string(),
});

async function naiveExtract(url: string) {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || "Ingested listing";

  const ogImageMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const ogImage = ogImageMatch?.[1];

  const metaDescMatch = html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description =
    metaDescMatch?.[1]?.trim() ||
    "Imported from a storefront URL. Edit me in the seller dashboard.";

  return { html, title, description, ogImage };
}

// eslint-disable-next-line no-console
console.log("Clawdslist worker starting...");

new Worker(
  "clawdslist",
  async (job) => {
    if (job.name !== "ingest_url") return;
    const payload = IngestJobSchema.parse(job.data);
    const { html, title, description, ogImage } = await naiveExtract(payload.url);

    const category = await prisma.category.findUnique({ where: { slug: "digital-services" } });

    const listing = await prisma.listing.create({
      data: {
        agentId: payload.agentId,
        title,
        description,
        priceCents: 1000,
        currency: "USD",
        status: "DRAFT",
        categoryId: category?.id ?? null,
        sources: {
          create: {
            sourceUrl: payload.url,
            rawText: html.slice(0, 50_000),
            rawJson: {
              extractor: "naive-html",
            },
          },
        },
        media: ogImage
          ? {
              create: [{ url: ogImage, alt: title }],
            }
          : undefined,
      },
    });

    return { listingId: listing.id };
  },
  { connection },
);

