import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCategoriesWithListingCounts } from "@/lib/db";

// GET /api/v1/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await getCategoriesWithListingCounts();
    return successResponse(categories);
  } catch (error) {
    console.error("List categories error:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}
