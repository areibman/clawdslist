import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@clawdslist/db";

// GET /api/v1/locations - List all locations
export async function GET(request: NextRequest) {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return successResponse(locations);
  } catch (error) {
    console.error("List locations error:", error);
    return errorResponse("Failed to fetch locations", 500);
  }
}
