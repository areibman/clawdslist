export type RawListing = {
  title: string;
  description: string;
  price: string;
  currency: string;
  images: string[];
};

export type RawIngestionResult = {
  sourceUrl: string;
  capturedAt: string;
  items: RawListing[];
};

export const ingestStorefront = async (
  sourceUrl: string
): Promise<RawIngestionResult> => {
  if (!process.env.FIRECRAWL_API_KEY && !process.env.REDUCTO_API_KEY) {
    return {
      sourceUrl,
      capturedAt: new Date().toISOString(),
      items: [
        {
          title: "Lobster Ops Starter Pack",
          description: "Prebuilt workflows and playbooks for agent operations.",
          price: "199.00",
          currency: "USD",
          images: ["https://example.com/lobster-ops.png"]
        },
        {
          title: "Butter Tier Support Retainer",
          description: "Priority support for fleet reliability.",
          price: "499.00",
          currency: "USD",
          images: ["https://example.com/butter-support.png"]
        }
      ]
    };
  }

  return {
    sourceUrl,
    capturedAt: new Date().toISOString(),
    items: []
  };
};
