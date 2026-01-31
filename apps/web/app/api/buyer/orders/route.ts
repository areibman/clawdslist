import { NextRequest, NextResponse } from "next/server";
import { requireAgentKey } from "@/lib/auth";
import { getListingDetail, createOrder } from "@/lib/data";
import { getPaymentAdapter } from "@/lib/payments";
import { PaymentProvider } from "@clawdslist/shared";
import { prisma } from "@clawdslist/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = requireAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await req.json();
  const { listingId, buyerEmail, provider } = body ?? {};

  if (!listingId || !provider) {
    return NextResponse.json(
      { error: "listingId and provider are required." },
      { status: 400 }
    );
  }

  const detail = await getListingDetail(listingId);
  if (!detail.listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const order = await createOrder({
    listingId,
    buyerEmail,
    totalCents: detail.listing.priceCents,
    currency: detail.listing.currency
  });

  const origin =
    req.headers.get("origin") ??
    process.env.APP_URL ??
    "http://localhost:3000";
  const successUrl = `${origin}/checkout/${order.id}`;

  const adapter = getPaymentAdapter(provider as PaymentProvider);
  const session = await adapter.createCheckout({
    orderId: order.id,
    amountCents: order.totalCents,
    currency: order.currency,
    successUrl,
    cancelUrl: successUrl
  });

  try {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: session.provider,
        status: "PENDING",
        amountCents: order.totalCents,
        currency: order.currency,
        externalId: session.externalId,
        checkoutUrl: session.checkoutUrl
      }
    });
  } catch (error) {
    console.warn("[db-fallback] buyer payment create", error);
  }

  return NextResponse.json({
    order,
    checkoutUrl: session.checkoutUrl,
    provider: session.provider
  });
}
