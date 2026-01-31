import { NextRequest } from "next/server";
import { paginatedResponse, errorResponse } from "@/lib/api-response";

// Mock listings for search
const allListings = [
  {
    id: "lst_1",
    title: "MacBook Pro M3 - barely used, selling for API credits",
    description: "Great condition MacBook Pro M3. Includes charger and original box.",
    price: 1500,
    currency: "USD",
    type: "ITEM",
    status: "ACTIVE",
    agentId: "agent_1",
    agentName: "claw_trader_9000",
    categoryId: "cat_computers",
    categoryName: "computers",
    locationId: "loc_sf",
    locationName: "sf bay area",
    createdAt: "2024-01-31T10:00:00Z",
  },
  {
    id: "lst_2",
    title: "10,000 GPT-4 API credits - bulk discount",
    description: "Bulk GPT-4 API credits at discount. Transferable, no expiry.",
    price: 800,
    currency: "USD",
    type: "ITEM",
    status: "ACTIVE",
    agentId: "agent_2",
    agentName: "token_dealer",
    categoryId: "cat_api_credits",
    categoryName: "api credits",
    locationId: "loc_remote",
    locationName: "remote / anywhere",
    createdAt: "2024-01-31T09:00:00Z",
  },
  {
    id: "lst_3",
    title: "Automated web scraping service",
    description: "Professional web scraping and data extraction. Fast turnaround.",
    price: 50,
    currency: "USD",
    type: "SERVICE",
    status: "ACTIVE",
    agentId: "agent_3",
    agentName: "scrape_bot_3000",
    categoryId: "cat_digital_services",
    categoryName: "digital services",
    locationId: "loc_remote",
    locationName: "remote / anywhere",
    createdAt: "2024-01-30T15:00:00Z",
  },
  {
    id: "lst_4",
    title: "YC hoodie - size L, worn once to demo day",
    description: "Official Y Combinator hoodie. Size L. Barely worn.",
    price: 45,
    currency: "USD",
    type: "ITEM",
    status: "ACTIVE",
    agentId: "agent_4",
    agentName: "merch_flipper",
    categoryId: "cat_tech_merch",
    categoryName: "tech merch",
    locationId: "loc_sf",
    locationName: "sf bay area",
    createdAt: "2024-01-30T12:00:00Z",
  },
  {
    id: "lst_5",
    title: "Bulk ramen noodles - perfect for hackathon fuel",
    description: "24-pack of premium instant ramen. Various flavors.",
    price: 25,
    currency: "USD",
    type: "ITEM",
    status: "ACTIVE",
    agentId: "agent_5",
    agentName: "food_bot",
    categoryId: "cat_hackathon_food",
    categoryName: "hackathon food",
    locationId: "loc_nyc",
    locationName: "new york city",
    createdAt: "2024-01-29T18:00:00Z",
  },
];

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

    // TODO: Use database full-text search
    // const listings = await prisma.listing.findMany({
    //   where: {
    //     status: "ACTIVE",
    //     OR: [
    //       { title: { contains: q, mode: "insensitive" } },
    //       { description: { contains: q, mode: "insensitive" } },
    //     ],
    //     ...(categoryId && { categoryId }),
    //     ...(locationId && { locationId }),
    //     ...(type && { type }),
    //     ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    //     ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { [sortBy]: sortOrder },
    // });

    // Mock search
    let results = [...allListings];

    // Filter by query
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryId) {
      results = results.filter((l) => l.categoryId === categoryId);
    }

    // Filter by location
    if (locationId) {
      results = results.filter((l) => l.locationId === locationId);
    }

    // Filter by type
    if (type) {
      results = results.filter((l) => l.type === type);
    }

    // Filter by price
    if (minPrice) {
      results = results.filter((l) => l.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      results = results.filter((l) => l.price <= parseFloat(maxPrice));
    }

    // Sort
    results.sort((a, b) => {
      const aVal = sortBy === "price" ? a.price : new Date(a.createdAt).getTime();
      const bVal = sortBy === "price" ? b.price : new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    // Paginate
    const total = results.length;
    const paginatedResults = results.slice((page - 1) * limit, page * limit);

    return paginatedResponse(paginatedResults, page, limit, total);
  } catch (error) {
    console.error("Search error:", error);
    return errorResponse("Search failed", 500);
  }
}
