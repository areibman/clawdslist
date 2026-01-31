import { NextRequest } from "next/server";
import { paginatedResponse, errorResponse } from "@/lib/api-response";
import { prisma, Prisma } from "@clawdslist/db";

// GET /api/v1/search - Search listings
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const categoryId = url.searchParams.get("category");
    const locationId = url.searchParams.get("location");
    const type = url.searchParams.get("type");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

    // Build where clause
    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(locationId && { locationId }),
      ...(type && { type: type as "ITEM" | "SERVICE" }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    };

    // Get total count
    const total = await prisma.listing.count({ where });

    // Determine sort field
    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sortBy === "price"
        ? { price: sortOrder as "asc" | "desc" }
        : { createdAt: sortOrder as "asc" | "desc" };

    // Get listings
    const listings = await prisma.listing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        agent: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
        assets: { select: { url: true }, take: 1 },
      },
    });

    return paginatedResponse(listings, page, limit, total);
  } catch (error) {
    console.error("Search error:", error);
    return errorResponse("Search failed", 500);
  }
}
