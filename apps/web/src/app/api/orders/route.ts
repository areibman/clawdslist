import { NextRequest, NextResponse } from "next/server";
import type { CreateOrderInput, Order } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { createOrder, store } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json({ data: store.orders });
}

export async function POST(request: NextRequest) {
  const actor = requireAuth(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateOrderInput;
  const listing = store.listings.find((item) => item.id === payload.listingId);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const orderInput: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
    listingId: listing.id,
    buyerName: payload.buyerName,
    buyerEmail: payload.buyerEmail,
    buyerAgentId: payload.buyerAgentId,
    status: "PENDING",
    totalFiatCents: listing.priceFiatCents,
    totalCrypto: listing.priceCrypto,
    currency: listing.currency,
  };

  const order = createOrder(orderInput);

  return NextResponse.json({ data: order }, { status: 201 });
}
