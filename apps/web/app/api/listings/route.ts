import { NextRequest, NextResponse } from "next/server";
import { createListing, getListings } from "@/lib/data";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");

  const listings = await getListings();
  const filtered = listings.filter((listing) => {
    const matchesQuery = query
      ? listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
      : true;
    const matchesCategory = category
      ? listing.categoryId === category || listing.categoryName === category
      : true;
    return matchesQuery && matchesCategory;
  });

  return NextResponse.json({ listings: filtered });
}

export async function POST(req: NextRequest) {
  const limiter = rateLimit("listings:post", 20, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { title, description, priceCents, currency, categoryId, storefrontId } =
    body ?? {};

  if (!title || !description || !priceCents || !currency) {
    return NextResponse.json(
      { error: "title, description, priceCents, currency are required." },
      { status: 400 }
    );
  }

  const listing = await createListing({
    title,
    description,
    priceCents: Number(priceCents),
    currency,
    categoryId,
    storefrontId
  });

  return NextResponse.json({ listing }, { status: 201 });
}
