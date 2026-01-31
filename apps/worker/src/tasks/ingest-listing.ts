import { task, logger } from "@trigger.dev/sdk/v3";
import FirecrawlApp from "@mendable/firecrawl-js";

export interface IngestListingPayload {
  listingId: string;
  sourceUrl: string;
  agentId: string;
  categoryId?: string;
  locationId?: string;
}

interface ExtractedProductData {
  title: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  specifications: Record<string, string>;
  seller?: string;
  condition?: string;
  rawContent: string;
}

// Initialize Firecrawl client
const getFirecrawlClient = () => {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }
  return new FirecrawlApp({ apiKey });
};

// Extract product data from scraped content
function extractProductData(scrapeResult: any): ExtractedProductData {
  const markdown = scrapeResult.markdown || "";
  const metadata = scrapeResult.metadata || {};

  // Basic extraction - in production, use LLM or more sophisticated parsing
  let title = metadata.title || metadata.ogTitle || "Untitled Product";
  let description = metadata.description || metadata.ogDescription || "";
  let price: number | null = null;
  let currency = "USD";
  const images: string[] = [];

  // Try to extract price from content
  const priceMatch = markdown.match(/\$[\d,]+\.?\d*/);
  if (priceMatch) {
    price = parseFloat(priceMatch[0].replace(/[$,]/g, ""));
  }

  // Extract images from metadata
  if (metadata.ogImage) {
    images.push(metadata.ogImage);
  }

  // Clean up title (remove site name suffixes)
  title = title.replace(/\s*[-|]\s*.*$/, "").trim();

  // Truncate description if too long
  if (description.length > 1000) {
    description = description.substring(0, 997) + "...";
  }

  return {
    title,
    description,
    price,
    currency,
    images,
    specifications: {},
    rawContent: markdown.substring(0, 10000), // Limit raw content size
  };
}

export const ingestListing = task({
  id: "ingest-listing",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: IngestListingPayload) => {
    const { listingId, sourceUrl, agentId, categoryId, locationId } = payload;

    logger.info("Starting listing ingestion", { listingId, sourceUrl });

    // Step 1: Validate URL
    let url: URL;
    try {
      url = new URL(sourceUrl);
    } catch {
      throw new Error(`Invalid URL: ${sourceUrl}`);
    }

    // Step 2: Scrape content using Firecrawl
    logger.info("Fetching content from URL", { sourceUrl });

    const firecrawl = getFirecrawlClient();

    const scrapeResult = await firecrawl.scrapeUrl(sourceUrl, {
      formats: ["markdown"],
    });

    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape URL: ${scrapeResult.error || "Unknown error"}`);
    }

    logger.info("Successfully scraped URL", {
      listingId,
      contentLength: scrapeResult.markdown?.length || 0,
    });

    // Step 3: Extract and normalize product data
    logger.info("Extracting product data", { listingId });

    const extractedData = extractProductData(scrapeResult);

    logger.info("Extracted product data", {
      listingId,
      title: extractedData.title,
      price: extractedData.price,
      imageCount: extractedData.images.length,
    });

    // Step 4: Prepare normalized listing data
    const normalizedListing = {
      title: extractedData.title,
      description: extractedData.description || `Imported from ${url.hostname}`,
      price: extractedData.price || 0,
      currency: extractedData.currency,
      type: "ITEM" as const,
      status: extractedData.price ? "ACTIVE" : "PENDING_REVIEW", // Need review if no price
      categoryId,
      locationId,
    };

    // Step 5: Prepare source data for storage
    const sourceData = {
      listingId,
      sourceUrl,
      rawPayload: {
        markdown: extractedData.rawContent,
        metadata: scrapeResult.metadata,
        extractedAt: new Date().toISOString(),
      },
      provider: "firecrawl",
    };

    // Step 6: Prepare media assets
    const mediaAssets = extractedData.images.map((imageUrl, index) => ({
      listingId,
      url: imageUrl,
      sortOrder: index,
    }));

    // TODO: Update listing in database
    // await prisma.$transaction([
    //   prisma.listing.update({
    //     where: { id: listingId },
    //     data: normalizedListing,
    //   }),
    //   prisma.listingSource.create({
    //     data: sourceData,
    //   }),
    //   prisma.mediaAsset.createMany({
    //     data: mediaAssets,
    //   }),
    // ]);

    logger.info("Ingestion completed successfully", {
      listingId,
      title: normalizedListing.title,
      status: normalizedListing.status,
    });

    return {
      success: true,
      listingId,
      listing: normalizedListing,
      source: sourceData,
      mediaAssets,
    };
  },
});
