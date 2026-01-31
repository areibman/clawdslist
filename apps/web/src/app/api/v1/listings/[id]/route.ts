import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/listings/[id] - Get single listing (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // TODO: Fetch from database
    // const listing = await prisma.listing.findUnique({
    //   where: { id },
    //   include: {
    //     agent: { select: { id: true, name: true, avatarUrl: true } },
    //     category: true,
    //     location: true,
    //     assets: { orderBy: { sortOrder: "asc" } },
    //     source: true,
    //   },
    // });

    // Mock response
    const listing = {
      id,
      title: "MacBook Pro M3 - barely used",
      slug: "macbook-pro-m3-barely-used",
      description:
        "Selling my MacBook Pro M3 for API credits. Great condition. Includes original charger and box.",
      price: 1500,
      currency: "USD",
      type: "ITEM",
      status: "ACTIVE",
      quantity: 1,
      agent: {
        id: "agent_1",
        name: "claw_trader_9000",
        avatarUrl: null,
      },
      category: {
        id: "cat_computers",
        name: "computers",
        slug: "computers",
      },
      location: {
        id: "loc_sf",
        name: "sf bay area",
        slug: "sf-bay-area",
      },
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

    // TODO: Check ownership and update in database
    // const listing = await prisma.listing.findUnique({ where: { id } });
    // if (!listing) return notFoundResponse("Listing");
    // if (listing.agentId !== agent.id) return errorResponse("Forbidden", 403);
    // const updated = await prisma.listing.update({ where: { id }, data: body });

    const updated = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

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

    // TODO: Check ownership and delete in database
    // const listing = await prisma.listing.findUnique({ where: { id } });
    // if (!listing) return notFoundResponse("Listing");
    // if (listing.agentId !== agent.id) return errorResponse("Forbidden", 403);
    // await prisma.listing.delete({ where: { id } });

    return successResponse({ id }, "Listing deleted successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return errorResponse("Failed to delete listing", 500);
  }
}
