import { task, logger } from "@trigger.dev/sdk/v3";
import FirecrawlApp from "@mendable/firecrawl-js";
import {
  detectPlatform,
  filterProductUrls,
  type PlatformConfig,
} from "@clawdslist/shared";

export interface IngestStorefrontPayload {
  jobId: string;
  storefrontUrl: string;
  agentId: string;
  categoryId?: string;
  locationId?: string;
  storefrontId?: string;
  maxListings?: number;
}

interface ExtractedProductData {
  title: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  sourceUrl: string;
}

interface ImportResult {
  success: boolean;
  sourceUrl: string;
  listingId?: string;
  title?: string;
  error?: string;
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
function extractProductData(scrapeResult: any, sourceUrl: string): ExtractedProductData {
  const markdown = scrapeResult.markdown || "";
  const metadata = scrapeResult.metadata || {};

  // Basic extraction
  let title = metadata.title || metadata.ogTitle || "Untitled Product";
  let description = metadata.description || metadata.ogDescription || "";
  let price: number | null = null;
  const currency = "USD";
  const images: string[] = [];

  // Try to extract price from content (handles $1,234.56 format)
  const pricePatterns = [
    /\$[\d,]+\.?\d*/,
    /USD\s*[\d,]+\.?\d*/i,
    /Price:\s*\$?[\d,]+\.?\d*/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = markdown.match(pattern);
    if (match) {
      price = parseFloat(match[0].replace(/[$,USD\s]/gi, ""));
      if (!isNaN(price) && price > 0) break;
      price = null;
    }
  }

  // Extract images from metadata
  if (metadata.ogImage) {
    images.push(metadata.ogImage);
  }

  // Clean up title (remove site name suffixes like " - Etsy" or " | eBay")
  title = title.replace(/\s*[-|–—]\s*[^-|–—]*$/, "").trim();

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
    sourceUrl,
  };
}

// Generate a slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50)
    .replace(/-$/, "");
}

export const ingestStorefront = task({
  id: "ingest-storefront",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: IngestStorefrontPayload) => {
    const {
      jobId,
      storefrontUrl,
      agentId,
      categoryId,
      locationId,
      storefrontId,
      maxListings = 50,
    } = payload;

    logger.info("Starting storefront ingestion", { jobId, storefrontUrl, maxListings });

    // Step 1: Detect platform and validate
    const platform = detectPlatform(storefrontUrl);
    if (!platform) {
      throw new Error(`Unsupported platform for URL: ${storefrontUrl}`);
    }

    logger.info("Detected platform", { platform: platform.name });

    // Step 2: Initialize Firecrawl
    const firecrawl = getFirecrawlClient();

    // Step 3: Map the storefront to discover product URLs
    logger.info("Mapping storefront to discover products", { storefrontUrl });

    let productUrls: string[] = [];

    try {
      // Use map to discover URLs on the storefront
      // The map() method returns an array of link objects or strings
      const mapResult = await firecrawl.map(storefrontUrl, {
        search: "product listing item buy price",
        limit: maxListings * 3, // Get more URLs to filter down
      });

      // mapResult is the links array directly
      if (mapResult && Array.isArray(mapResult.links)) {
        productUrls = mapResult.links.map((link: any) => 
          typeof link === "string" ? link : link.url || link.href || ""
        ).filter(Boolean);
      }

      logger.info("Map completed", { urlCount: productUrls.length });
    } catch (mapError) {
      logger.warn("Map failed, falling back to crawl", { error: mapError });
      
      try {
        // Fallback: use crawl with limited depth
        const crawlResult = await firecrawl.crawl(storefrontUrl, {
          limit: maxListings * 2,
          includePaths: platform.includePaths,
          excludePaths: platform.excludePaths,
          scrapeOptions: { formats: ["markdown"] },
        });

        // crawlResult.data is an array of scraped pages
        if (crawlResult && Array.isArray(crawlResult.data)) {
          productUrls = crawlResult.data
            .map((page: any) => page.metadata?.sourceURL || page.metadata?.url || page.url)
            .filter(Boolean);
        }
      } catch (crawlError) {
        logger.error("Crawl also failed", { error: crawlError });
        throw new Error(`Failed to discover products: ${crawlError}`);
      }
    }

    // Step 4: Filter to only product URLs
    const filteredUrls = filterProductUrls(productUrls, platform);
    const urlsToProcess = filteredUrls.slice(0, maxListings);

    logger.info("Discovered product URLs", {
      total: productUrls.length,
      filtered: filteredUrls.length,
      processing: urlsToProcess.length,
    });

    if (urlsToProcess.length === 0) {
      return {
        success: true,
        jobId,
        message: "No product listings found on this storefront",
        imported: 0,
        failed: 0,
        listings: [],
      };
    }

    // Step 5: Scrape each product URL and extract data
    const results: ImportResult[] = [];
    const listings: any[] = [];

    for (let i = 0; i < urlsToProcess.length; i++) {
      const productUrl = urlsToProcess[i];
      
      logger.info(`Processing product ${i + 1}/${urlsToProcess.length}`, { productUrl });

      try {
        // scrape() returns the document directly, throws on error
        const scrapeResult = await firecrawl.scrape(productUrl, {
          formats: ["markdown"],
        });

        // If we get here, scrape was successful
        const extractedData = extractProductData(scrapeResult, productUrl);
        
        // Generate listing data
        const listingId = `lst_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const slug = `${generateSlug(extractedData.title)}-${Date.now()}`;

        const listing = {
          id: listingId,
          title: extractedData.title,
          slug,
          description: extractedData.description || `Imported from ${platform.name}`,
          price: extractedData.price || 0,
          currency: extractedData.currency,
          type: "ITEM",
          status: extractedData.price && extractedData.price > 0 ? "ACTIVE" : "PENDING_REVIEW",
          agentId,
          categoryId,
          locationId,
          storefrontId,
          source: {
            sourceUrl: productUrl,
            rawPayload: {
              markdown: scrapeResult.markdown?.substring(0, 10000),
              metadata: scrapeResult.metadata,
              extractedAt: new Date().toISOString(),
            },
            provider: "firecrawl",
          },
          images: extractedData.images,
        };

        listings.push(listing);
        results.push({
          success: true,
          sourceUrl: productUrl,
          listingId,
          title: extractedData.title,
        });

        logger.info("Extracted product", {
          listingId,
          title: extractedData.title,
          price: extractedData.price,
        });

        // TODO: Actually save to database
        // await prisma.$transaction([
        //   prisma.listing.create({ data: { ... } }),
        //   prisma.listingSource.create({ data: listing.source }),
        //   prisma.mediaAsset.createMany({ data: listing.images.map(...) }),
        // ]);

      } catch (error) {
        logger.error("Error processing product", { productUrl, error });
        results.push({
          success: false,
          sourceUrl: productUrl,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Small delay to avoid rate limiting
      if (i < urlsToProcess.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Step 6: Summarize results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    logger.info("Storefront ingestion completed", {
      jobId,
      imported: successful.length,
      failed: failed.length,
    });

    return {
      success: true,
      jobId,
      platform: platform.name,
      storefrontUrl,
      imported: successful.length,
      failed: failed.length,
      listings: listings.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        status: l.status,
        sourceUrl: l.source.sourceUrl,
      })),
      errors: failed.map((f) => ({
        sourceUrl: f.sourceUrl,
        error: f.error,
      })),
    };
  },
});
