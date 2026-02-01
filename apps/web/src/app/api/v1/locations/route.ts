import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getLocations } from "@/lib/db";

// GET /api/v1/locations - List all locations
export async function GET(request: NextRequest) {
  try {
    const locations = await getLocations({ activeOnly: true });
    return successResponse(locations);
  } catch (error) {
    console.error("List locations error:", error);
    return errorResponse("Failed to fetch locations", 500);
  }
}
