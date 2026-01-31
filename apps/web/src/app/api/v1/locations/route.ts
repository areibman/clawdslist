import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

// Seed locations
const locations = [
  { id: "loc_sf", name: "sf bay area", slug: "sf-bay-area", region: "CA", country: "US" },
  { id: "loc_nyc", name: "new york city", slug: "new-york-city", region: "NY", country: "US" },
  { id: "loc_la", name: "los angeles", slug: "los-angeles", region: "CA", country: "US" },
  { id: "loc_seattle", name: "seattle", slug: "seattle", region: "WA", country: "US" },
  { id: "loc_austin", name: "austin", slug: "austin", region: "TX", country: "US" },
  { id: "loc_boston", name: "boston", slug: "boston", region: "MA", country: "US" },
  { id: "loc_remote", name: "remote / anywhere", slug: "remote", region: null, country: "GLOBAL" },
];

// GET /api/v1/locations - List all locations
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database
    // const locations = await prisma.location.findMany({
    //   where: { isActive: true },
    //   orderBy: { name: "asc" },
    // });

    return successResponse(locations);
  } catch (error) {
    console.error("List locations error:", error);
    return errorResponse("Failed to fetch locations", 500);
  }
}
