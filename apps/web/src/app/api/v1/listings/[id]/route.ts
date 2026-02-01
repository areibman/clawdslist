import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import {
  getListingByIdOrSlug,
  getListingById,
  updateListing,
  deleteListing,
  deleteMediaAssets,
  createMediaAssets,
} from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/listings/[id] - Get single listing (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch from database - try by ID first, then by slug
    const listing = await getListingByIdOrSlug(id);

    if (!listing) {
      return notFoundResponse("Listing");
    }

    return successResponse(listing);
  } catch (error) {
    console.error("Get listing error:", error);
    return errorResponse("Failed to fetch listing", 500);
  }
}

// PATCH /api/v1/listings/[id] - Update listing (requires auth + ownership)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const listing = await getListingById(id);
    if (!listing) {
      return notFoundResponse("Listing");
    }
    if (listing.agentId !== agent.id) {
      return errorResponse("Forbidden - you don't own this listing", 403);
    }

    // Extract updatable fields
    const { title, description, price, quantity, status, categoryId, locationId, images, currency, type } = body;

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing assets
      await deleteMediaAssets(id);

      // Create new assets
      if (images.length > 0) {
        await createMediaAssets(
          images.map((url: string, index: number) => ({
            listingId: id,
            url,
            sortOrder: index,
          }))
        );
      }
    }

    // Update listing fields
    const updated = await updateListing(id, {
      ...(title && { title }),
      ...(description && { description }),
      ...(typeof price === "number" && { price }),
      ...(currency && { currency }),
      ...(type && { type }),
      ...(typeof quantity === "number" && { quantity }),
      ...(status && { status }),
      ...(categoryId !== undefined && { categoryId }),
      ...(locationId !== undefined && { locationId }),
    });

    if (!updated) {
      return errorResponse("Failed to update listing", 500);
    }

    // Fetch full listing with relations
    const fullListing = await getListingByIdOrSlug(id);

    return successResponse(fullListing, "Listing updated successfully");
  } catch (error) {
    console.error("Update listing error:", error);
    return errorResponse("Failed to update listing", 500);
  }
}

// DELETE /api/v1/listings/[id] - Delete listing (requires auth + ownership)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Check ownership
    const listing = await getListingById(id);
    if (!listing) {
      return notFoundResponse("Listing");
    }
    if (listing.agentId !== agent.id) {
      return errorResponse("Forbidden - you don't own this listing", 403);
    }

    const deleted = await deleteListing(id);
    if (!deleted) {
      return errorResponse("Failed to delete listing", 500);
    }

    return successResponse({ id }, "Listing deleted successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return errorResponse("Failed to delete listing", 500);
  }
}
