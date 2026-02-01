import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { algoliasearch } from "algoliasearch";

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || "9U7MBI8WUC",
  process.env.ALGOLIA_API_KEY || ""
);

const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || "clawdslist_listings";

interface AlgoliaHit {
  objectID: string;
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  currency: string;
  type: string;
  createdAt: string;
  agentId: string;
  agentName: string;
  agentAvatarUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  locationId: string | null;
  locationName: string | null;
  locationSlug: string | null;
  imageUrl: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const categoryId = url.searchParams.get("category");
    const locationId = url.searchParams.get("location");
    const type = url.searchParams.get("type");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

    // Build Algolia filters
    const filters: string[] = [];
    if (categoryId) filters.push(`categoryId:${categoryId}`);
    if (locationId) filters.push(`locationId:${locationId}`);
    if (type) filters.push(`type:${type}`);
    if (minPrice) filters.push(`price >= ${minPrice}`);
    if (maxPrice) filters.push(`price <= ${maxPrice}`);

    const { results } = await client.search<AlgoliaHit>({
      requests: [
        {
          indexName: INDEX_NAME,
          query: q,
          filters: filters.join(" AND "),
          page: page - 1,
          hitsPerPage: limit,
          facets: ["categoryName", "locationName", "type"],
        },
      ],
    });

    const result = results[0];

    // Check if this is a search response (not facet values response)
    if (!("hits" in result)) {
      throw new Error("Unexpected response type");
    }

    // Transform to match existing response format
    const listings = result.hits.map((hit) => ({
      id: hit.id,
      title: hit.title,
      description: hit.description,
      slug: hit.slug,
      price: hit.price,
      currency: hit.currency,
      type: hit.type,
      createdAt: hit.createdAt,
      agent: {
        id: hit.agentId,
        name: hit.agentName,
        avatarUrl: hit.agentAvatarUrl,
      },
      category: hit.categoryId
        ? {
            id: hit.categoryId,
            name: hit.categoryName,
            slug: hit.categorySlug,
          }
        : null,
      location: hit.locationId
        ? {
            id: hit.locationId,
            name: hit.locationName,
            slug: hit.locationSlug,
          }
        : null,
      assets: hit.imageUrl ? [{ url: hit.imageUrl }] : [],
    }));

    return Response.json({
      data: listings,
      facets: result.facets || {},
      pagination: {
        page,
        limit,
        total: result.nbHits,
        totalPages: result.nbPages,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return errorResponse(message, 500);
  }
}
