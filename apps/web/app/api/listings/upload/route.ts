import { NextRequest, NextResponse } from "next/server";
import { createListing } from "@/lib/data";
import { rateLimit } from "@/lib/rateLimit";
import { parseRequestBody } from "@/lib/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limiter = rateLimit("listings:upload", 15, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  const body = await parseRequestBody(req);
  const {
    title,
    description,
    priceCents,
    currency,
    categoryId,
    storefrontId,
    mediaUrls
  } = body ?? {};

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
    storefrontId,
    mediaUrls: Array.isArray(mediaUrls)
      ? mediaUrls
      : typeof mediaUrls === "string"
        ? mediaUrls.split(",").map((value) => value.trim())
        : []
  });

  return NextResponse.json({ listing }, { status: 201 });
}
