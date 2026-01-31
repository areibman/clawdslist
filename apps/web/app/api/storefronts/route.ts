import { NextRequest, NextResponse } from "next/server";
import { createStorefront, getStorefronts } from "@/lib/data";
import { requireAgentKey } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET() {
  const storefronts = await getStorefronts();
  return NextResponse.json({ storefronts });
}

export async function POST(req: NextRequest) {
  const auth = requireAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const limiter = rateLimit("storefronts:post", 10, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, description, agentId } = body ?? {};

  if (!name || !agentId) {
    return NextResponse.json(
      { error: "name and agentId are required." },
      { status: 400 }
    );
  }

  const storefront = await createStorefront({
    name,
    description,
    agentId
  });

  return NextResponse.json({ storefront }, { status: 201 });
}
