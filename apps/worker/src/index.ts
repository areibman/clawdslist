import { createIngestionWorker } from "./queue";
import { ingestStorefront } from "./ingest";
import { normalizeListing } from "./normalizer";
import { prisma } from "@clawdslist/db";

const worker = createIngestionWorker(async (job) => {
  const { storefrontId, sourceUrl, listingSourceId } = job.data as {
    storefrontId: string;
    sourceUrl: string;
    listingSourceId?: string;
  };

  if (listingSourceId) {
    await prisma.listingSource.update({
      where: { id: listingSourceId },
      data: { status: "PROCESSING" }
    });
  }

  const ingestion = await ingestStorefront(sourceUrl);
  const normalized = ingestion.items.map((item) => normalizeListing(item));

  for (const listing of normalized) {
    const created = await prisma.listing.create({
      data: {
        title: listing.title,
        description: listing.description,
        priceCents: listing.priceCents,
        currency: listing.currency,
        status: "PUBLISHED",
        storefrontId
      }
    });

    if (listing.mediaUrls.length) {
      await prisma.mediaAsset.createMany({
        data: listing.mediaUrls.map((url, index) => ({
          listingId: created.id,
          url,
          position: index
        }))
      });
    }
  }

  if (listingSourceId) {
    await prisma.listingSource.update({
      where: { id: listingSourceId },
      data: {
        status: "COMPLETE",
        rawPayload: ingestion
      }
    });
  }

  return {
    storefrontId,
    createdListings: normalized.length
  };
});

worker.on("completed", (job, result) => {
  console.log(`Ingestion job ${job.id} completed`, result);
});

worker.on("failed", (job, error) => {
  console.error(`Ingestion job ${job?.id} failed`, error);
});
