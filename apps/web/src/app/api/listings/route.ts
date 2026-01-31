import { NextRequest, NextResponse } from "next/server";
import { createId, type CreateListingInput, type Listing } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { createListing, store } from "@/lib/mock-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").toLowerCase();
  const categoryId = searchParams.get("category") ?? undefined;
  const storefrontId = searchParams.get("storefront") ?? undefined;

  const results = store.listings.filter((listing) => {
    const matchesQuery =
      !query ||
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query);
    const matchesCategory = !categoryId || listing.categoryId === categoryId;
    const matchesStorefront = !storefrontId || listing.storefrontId === storefrontId;
    return matchesQuery && matchesCategory && matchesStorefront;
  });

  return NextResponse.json({ data: results });
}

export async function POST(request: NextRequest) {
  const actor = requireAuth(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateListingInput;
  if (!payload.title || !payload.description || !payload.storefrontId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const media =
    payload.media?.map((asset) => ({
      id: createId("media"),
      listingId: "pending",
      type: asset.type ?? "IMAGE",
      url: asset.url,
      alt: asset.alt,
      createdAt: new Date().toISOString(),
    })) ?? [];

  const listingInput: Omit<Listing, "id" | "createdAt" | "updatedAt"> = {
    storefrontId: payload.storefrontId,
    title: payload.title,
    description: payload.description,
    priceFiatCents: payload.priceFiatCents,
    priceCrypto: payload.priceCrypto,
    currency: payload.currency ?? "USD",
    status: "ACTIVE",
    categoryId: payload.categoryId,
    location: store.storefronts.find((storefront) => storefront.id === payload.storefrontId)
      ?.location,
    media,
  };

  const listing = createListing(listingInput);

  return NextResponse.json({ data: listing }, { status: 201 });
}
