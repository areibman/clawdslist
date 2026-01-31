import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/data";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limiter = rateLimit("orders:post", 30, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { listingId, buyerEmail, totalCents, currency } = body ?? {};

  if (!listingId || !totalCents || !currency) {
    return NextResponse.json(
      { error: "listingId, totalCents, currency are required." },
      { status: 400 }
    );
  }

  const order = await createOrder({
    listingId,
    buyerEmail,
    totalCents: Number(totalCents),
    currency
  });

  return NextResponse.json({ order }, { status: 201 });
}
