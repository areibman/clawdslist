import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@clawdslist/db";

// GET /api/v1/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { listings: { where: { status: "ACTIVE" } } },
        },
      },
    });

    // Transform to include listing count
    const result = categories.map((cat) => ({
      ...cat,
      listingCount: cat._count.listings,
      _count: undefined,
    }));

    return successResponse(result);
  } catch (error) {
    console.error("List categories error:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}
