import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { prisma, Prisma } from "@clawdslist/db";

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

    // Build where clause
    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",
      ...(categoryId && { categoryId }),
      ...(locationId && { locationId }),
      ...(type && { type: type as "ITEM" | "SERVICE" }),
      ...(q && { title: { contains: q, mode: "insensitive" as const } }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    };

    // Get total count
    const total = await prisma.listing.count({ where });

    // Get listings
    const listings = await prisma.listing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        agent: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
        assets: { select: { url: true, altText: true }, take: 1 },
      },
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
    const listing = await prisma.listing.create({
      data: {
        title,
        slug,
        description,
        price,
        currency,
        type: type as "ITEM" | "SERVICE",
        status: "ACTIVE",
        quantity,
        agentId: agent.id,
        categoryId: categoryId || undefined,
        locationId: locationId || undefined,
        storefrontId: storefrontId || undefined,
        // Create media assets if images provided
        ...(images.length > 0 && {
          assets: {
            create: images.map((url: string, index: number) => ({
              url,
              sortOrder: index,
            })),
          },
        }),
      },
      include: {
        agent: { select: { id: true, name: true } },
        category: true,
        location: true,
        assets: true,
      },
    });

    return successResponse(listing, "Listing created successfully");
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse("Failed to create listing", 500);
  }
}
