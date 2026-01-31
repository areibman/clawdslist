import { listings } from "../../../lib/mock-data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category")?.toLowerCase();

  const filtered = listings.filter((listing) => {
    const matchesQuery = query
      ? listing.title.toLowerCase().includes(query) ||
        listing.summary.toLowerCase().includes(query)
      : true;
    const matchesCategory = category
      ? listing.category.toLowerCase() === category
      : true;
    return matchesQuery && matchesCategory;
  });

  return Response.json({
    data: filtered,
    count: filtered.length,
  });
}
