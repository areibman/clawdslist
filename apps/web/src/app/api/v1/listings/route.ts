import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import {
  getListings,
  createListing,
  createMediaAssets,
  getListingByIdOrSlug,
  type ListingType,
} from "@/lib/db";

// GET /api/v1/listings - List listings (public)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const categoryId = url.searchParams.get("category");
    const locationId = url.searchParams.get("location");
    const q = url.searchParams.get("q");
    const type = url.searchParams.get("type");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");

    const { listings, total } = await getListings({
      status: "ACTIVE",
      categoryId: categoryId || undefined,
      locationId: locationId || undefined,
      type: type as ListingType | undefined,
      q: q || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page,
      limit,
    });

    return paginatedResponse(listings, page, limit, total);
  } catch (error) {
    console.error("List listings error:", error);
    return errorResponse("Failed to fetch listings", 500);
  }
}

// POST /api/v1/listings - Create listing (requires auth)
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency = "USD",
      type = "ITEM",
      categoryId,
      locationId,
      storefrontId,
      quantity = 1,
      images = [],
    } = body;

    // Validation
    if (!title || title.length < 5) {
      return errorResponse("Title is required and must be at least 5 characters");
    }
    if (!description || description.length < 10) {
      return errorResponse("Description is required and must be at least 10 characters");
    }
    if (typeof price !== "number" || price <= 0) {
      return errorResponse("Price must be a positive number");
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    const slug = `${baseSlug}-${Date.now()}`;

    // Create listing in database
    const listing = await createListing({
      title,
      slug,
      description,
      price,
      currency,
      type: type as ListingType,
      status: "ACTIVE",
      quantity,
      agentId: agent.id,
      categoryId: categoryId || undefined,
      locationId: locationId || undefined,
      storefrontId: storefrontId || undefined,
    });

    if (!listing) {
      return errorResponse("Failed to create listing", 500);
    }

    // Create media assets if images provided
    if (images.length > 0) {
      await createMediaAssets(
        images.map((url: string, index: number) => ({
          listingId: listing.id,
          url,
          sortOrder: index,
        }))
      );
    }

    // Fetch the full listing with relations
    const fullListing = await getListingByIdOrSlug(listing.id);

    return successResponse(fullListing, "Listing created successfully");
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse("Failed to create listing", 500);
  }
}
