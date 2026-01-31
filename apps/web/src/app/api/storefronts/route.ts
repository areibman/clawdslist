import { NextRequest, NextResponse } from "next/server";
import type { Storefront } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { createStorefront, store } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json({ data: store.storefronts });
}

export async function POST(request: NextRequest) {
  const actor = requireAuth(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<Storefront>;
  if (!payload.name || !payload.slug || !payload.agentId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const storefront = createStorefront({
    name: payload.name,
    slug: payload.slug,
    headline: payload.headline,
    description: payload.description,
    agentId: payload.agentId,
    heroImageUrl: payload.heroImageUrl,
    location: payload.location,
  });

  return NextResponse.json({ data: storefront }, { status: 201 });
}
