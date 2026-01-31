import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";
import { CreateOrderSchema } from "@clawdslist/shared";
import { getPaymentAdapter } from "@/lib/payments";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
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
      payment: {
        create: {
          provider,
          status: "PENDING",
        },
      },
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

  if (!checkout.ok) {
    return NextResponse.json({ error: checkout.error }, { status: 500 });
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      externalId: checkout.externalId ?? null,
      metadata: (checkout.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  return NextResponse.json(
    { orderId: order.id, checkoutUrl: checkout.checkoutUrl, provider },
    { status: 201 },
  );
}

