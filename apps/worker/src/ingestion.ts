import { createId, type IngestionStatus, type Listing } from "@clawdslist/shared";

interface IngestionInput {
  storefrontId: string;
  sourceUrl: string;
}

interface IngestionResult {
  status: IngestionStatus;
  listings: Listing[];
  rawPayload?: Record<string, unknown>;
}

const mockListingFromUrl = (storefrontId: string, url: string): Listing => {
  const now = new Date().toISOString();
  return {
    id: createId("listing"),
    storefrontId,
    title: "Imported catch from " + url,
    description:
      "Auto-normalized listing pulled from the source URL. Replace this with the clean Reducto payload.",
    priceFiatCents: 4200,
    priceCrypto: 0.002,
    currency: "USD",
    status: "ACTIVE",
    categoryId: undefined,
    location: undefined,
    media: [],
    createdAt: now,
    updatedAt: now,
  };
};

export async function ingestStorefront(input: IngestionInput): Promise<IngestionResult> {
  const { storefrontId, sourceUrl } = input;

  // Placeholder for Firecrawl + Reducto integration.
  const rawPayload = {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    notes: "Replace with Firecrawl/Reducto structured extraction.",
  };

  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    status: "SUCCEEDED",
    listings: [mockListingFromUrl(storefrontId, sourceUrl)],
    rawPayload,
  };
}
