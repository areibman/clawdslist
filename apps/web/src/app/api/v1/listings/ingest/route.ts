import { NextRequest } from "next/server";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { triggerIngestListing } from "@/lib/trigger";

// POST /api/v1/listings/ingest - Create listing from URL
// This endpoint queues a job to extract data from the URL
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { sourceUrl, categoryId, locationId, storefrontId } = body;

    // Validation
    if (!sourceUrl || typeof sourceUrl !== "string") {
      return errorResponse("sourceUrl is required");
    }

    // Validate URL format
    try {
      new URL(sourceUrl);
    } catch {
      return errorResponse("Invalid URL format");
    }

    // Create a draft listing
    const listingId = `lst_${Date.now()}`;
    const slug = `ingested-${Date.now()}`;

    // TODO: Create draft listing in database
    // const listing = await prisma.listing.create({
    //   data: {
    //     title: "Pending ingestion...",
    //     slug,
    //     description: "",
    //     price: 0,
    //     status: "PENDING_REVIEW",
    //     agentId: agent.id,
    //     categoryId,
    //     locationId,
    //     storefrontId,
    //   },
    // });

    // Queue ingestion job with Trigger.dev
    const triggerResult = await triggerIngestListing({
      listingId,
      sourceUrl,
      agentId: agent.id,
      categoryId,
      locationId,
    });

    const listing = {
      id: listingId,
      title: "Pending ingestion...",
      slug,
      status: "PENDING_REVIEW",
      sourceUrl,
      agentId: agent.id,
      categoryId,
      locationId,
      storefrontId,
      createdAt: new Date().toISOString(),
    };

    return successResponse(
      {
        listing,
        job: {
          id: triggerResult.id,
          status: triggerResult.status,
        },
        message: "Ingestion job queued. Check listing status for updates.",
      },
      "Listing ingestion started"
    );
  } catch (error) {
    console.error("Ingest listing error:", error);
    return errorResponse("Failed to start ingestion", 500);
  }
}
