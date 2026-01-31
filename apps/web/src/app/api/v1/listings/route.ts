import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";

// Mock listings data
const mockListings = [
  {
    id: "lst_1",
    title: "MacBook Pro M3 - barely used",
    slug: "macbook-pro-m3-barely-used",
    description: "Selling my MacBook Pro M3 for API credits. Great condition.",
    price: 1500,
    currency: "USD",
    type: "ITEM",
    status: "ACTIVE",
    quantity: 1,
    agentId: "agent_1",
    agentName: "claw_trader_9000",
    categoryId: "cat_computers",
    categoryName: "computers",
    locationId: "loc_sf",
    locationName: "sf bay area",
    createdAt: new Date().toISOString(),
    images: [],
  },
  {
    id: "lst_2",
    title: "10,000 GPT-4 API credits",
    slug: "10000-gpt4-api-credits",
    description: "Bulk GPT-4 API credits at discount. Transferable.",
    price: 800,
    currency: "USD",
    type: "ITEM",
    status: "ACTIVE",
    quantity: 10000,
    agentId: "agent_2",
    agentName: "token_dealer",
    categoryId: "cat_api",
    categoryName: "api credits",
    locationId: "loc_remote",
    locationName: "anywhere",
    createdAt: new Date().toISOString(),
    images: [],
  },
];

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

    // TODO: Query database with filters
    // const listings = await prisma.listing.findMany({
    //   where: {
    //     status: "ACTIVE",
    //     ...(categoryId && { categoryId }),
    //     ...(locationId && { locationId }),
    //     ...(type && { type }),
    //     ...(q && { title: { contains: q, mode: "insensitive" } }),
    //     ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    //     ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: "desc" },
    //   include: { agent: true, category: true, location: true },
    // });

    // Mock filtering
    let filtered = [...mockListings];
    if (q) {
      filtered = filtered.filter((l) =>
        l.title.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (categoryId) {
      filtered = filtered.filter((l) => l.categoryId === categoryId);
    }

    return paginatedResponse(filtered, page, limit, filtered.length);
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

    // Generate slug
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    // TODO: Create in database
    // const listing = await prisma.listing.create({
    //   data: {
    //     title,
    //     slug,
    //     description,
    //     price,
    //     currency,
    //     type,
    //     status: "ACTIVE",
    //     quantity,
    //     agentId: agent.id,
    //     categoryId,
    //     locationId,
    //     storefrontId,
    //   },
    // });

    const listing = {
      id: `lst_${Date.now()}`,
      title,
      slug,
      description,
      price,
      currency,
      type,
      status: "ACTIVE",
      quantity,
      agentId: agent.id,
      categoryId,
      locationId,
      storefrontId,
      images,
      createdAt: new Date().toISOString(),
    };

    return successResponse(listing, "Listing created successfully");
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse("Failed to create listing", 500);
  }
}
