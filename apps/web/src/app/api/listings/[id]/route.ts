import { NextRequest, NextResponse } from "next/server";
import type { Listing } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { store, updateListing } from "@/lib/mock-store";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const listing = store.listings.find((item) => item.id === params.id);
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: listing });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const actor = requireAuth(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const patch = (await request.json()) as Partial<Listing>;
  const updated = updateListing(params.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: updated });
}
