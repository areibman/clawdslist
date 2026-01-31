import { ingestStorefront } from "./ingestion";

async function main() {
  const sourceUrl = process.env.INGEST_URL;
  const storefrontId = process.env.STOREFRONT_ID;

  if (!sourceUrl || !storefrontId) {
    console.log("Clawdslist worker ready. Set INGEST_URL and STOREFRONT_ID to run.");
    return;
  }

  const result = await ingestStorefront({ sourceUrl, storefrontId });
  console.log("Ingestion completed:", result.status, result.listings.length);
}

main().catch((error) => {
  console.error("Worker failed:", error);
  process.exit(1);
});
