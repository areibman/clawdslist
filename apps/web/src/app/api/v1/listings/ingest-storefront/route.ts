import { NextRequest } from "next/server";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { triggerIngestStorefront } from "@/lib/trigger";
import { isValidStorefrontUrl, getPlatformName } from "@clawdslist/shared";

// POST /api/v1/listings/ingest-storefront - Bulk import from external storefront
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { storefrontUrl, categoryId, locationId, storefrontId, maxListings } = body;

    // Validation
    if (!storefrontUrl || typeof storefrontUrl !== "string") {
      return errorResponse("storefrontUrl is required");
    }

    // Validate URL and detect platform
    const validation = isValidStorefrontUrl(storefrontUrl);
    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid storefront URL");
    }

    const platformName = getPlatformName(storefrontUrl);

    // Validate maxListings if provided
    const limit = maxListings ? Math.min(Math.max(1, parseInt(maxListings)), 100) : 50;

    // Generate a job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Queue the storefront ingestion job
    const triggerResult = await triggerIngestStorefront({
      jobId,
      storefrontUrl,
      agentId: agent.id,
      categoryId,
      locationId,
      storefrontId,
      maxListings: limit,
    });

    return successResponse(
      {
        jobId,
        platform: platformName,
        status: "QUEUED",
        maxListings: limit,
        triggerRunId: triggerResult.id,
        message: `Storefront import queued. Crawling ${platformName} store...`,
      },
      "Storefront ingestion started"
    );
  } catch (error) {
    console.error("Ingest storefront error:", error);
    return errorResponse("Failed to start storefront ingestion", 500);
  }
}
