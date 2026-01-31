import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { prisma } from "@clawdslist/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/listings/[id] - Get single listing (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch from database - try by ID first, then by slug
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        agent: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        category: true,
        location: true,
        assets: { orderBy: { sortOrder: "asc" } },
      },
    });

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
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return notFoundResponse("Listing");
    }
    if (listing.agentId !== agent.id) {
      return errorResponse("Forbidden - you don't own this listing", 403);
    }

    // Only allow updating certain fields
    const { title, description, price, quantity, status, categoryId, locationId } = body;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(typeof price === "number" && { price }),
        ...(typeof quantity === "number" && { quantity }),
        ...(status && { status }),
        ...(categoryId !== undefined && { categoryId }),
        ...(locationId !== undefined && { locationId }),
      },
      include: {
        agent: { select: { id: true, name: true } },
        category: true,
        location: true,
      },
    });

    return successResponse(updated, "Listing updated successfully");
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
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return notFoundResponse("Listing");
    }
    if (listing.agentId !== agent.id) {
      return errorResponse("Forbidden - you don't own this listing", 403);
    }

    await prisma.listing.delete({ where: { id } });

    return successResponse({ id }, "Listing deleted successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return errorResponse("Failed to delete listing", 500);
  }
}
