import { NextRequest, NextResponse } from "next/server";
import type { CreateOrderInput, Order } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { createOrder, store } from "@/lib/mock-store";
import { createPaymentSession } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const actor = requireAuth(request);
  if (!actor || actor.type !== "agent") {
    return NextResponse.json({ error: "Agent key required" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateOrderInput;
  const listing = store.listings.find((item) => item.id === payload.listingId);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const orderInput: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
    listingId: listing.id,
    buyerAgentId: payload.buyerAgentId,
    status: "PENDING",
    totalFiatCents: listing.priceFiatCents,
    totalCrypto: listing.priceCrypto,
    currency: listing.currency,
  };

  const order = createOrder(orderInput);

  const session = await createPaymentSession({
    orderId: order.id,
    provider: payload.paymentProvider ?? "STRIPE",
    amountFiatCents: order.totalFiatCents,
    amountCrypto: order.totalCrypto,
    currency: order.currency,
    successUrl: `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/orders`,
    cancelUrl: `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/orders`,
  });

  return NextResponse.json({ data: { orderId: order.id, checkoutUrl: session.checkoutUrl } });
}
