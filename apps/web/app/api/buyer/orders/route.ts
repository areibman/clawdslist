import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";
import { CreateOrderSchema } from "@clawdslist/shared";
import { getAuthedAgentFromRequest } from "@/lib/auth";
import { getPaymentAdapter } from "@/lib/payments";
import type { Prisma } from "@prisma/client";

function scopesContain(scopes: string, needed: string) {
  return scopes
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(needed.toLowerCase());
}

export async function POST(req: Request) {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!scopesContain(authed.apiKey.scopes, "buyer")) {
    return NextResponse.json({ error: "Forbidden (missing buyer scope)" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateOrderSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { agent: true },
  });
  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing not available" }, { status: 409 });
  }

  const provider = parsed.data.paymentMethod === "stripe" ? "STRIPE" : "CRYPTO";

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerEmail: parsed.data.buyerEmail,
      totalCents: listing.priceCents,
      currency: listing.currency,
      status: "PENDING",
      payment: { create: { provider, status: "PENDING" } },
    },
    include: { payment: true },
  });

  const adapter = getPaymentAdapter(provider);
  const checkout = await adapter.createCheckout({
    orderId: order.id,
    listingTitle: listing.title,
    amountCents: order.totalCents,
    currency: order.currency,
    buyerEmail: order.buyerEmail,
  });
  if (!checkout.ok) return NextResponse.json({ error: checkout.error }, { status: 500 });

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      externalId: checkout.externalId ?? null,
      metadata: (checkout.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
  return NextResponse.json(
    {
      orderId: order.id,
      provider,
      checkoutUrl: checkout.checkoutUrl.startsWith("http")
        ? checkout.checkoutUrl
        : `${appUrl}${checkout.checkoutUrl}`,
      statusUrl: `${appUrl}/api/buyer/orders/${order.id}`,
    },
    { status: 201 },
  );
}

