import { Prisma, prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckout } from "@/lib/payments";

const zBody = z.object({
  provider: z.enum(["auto", "stripe", "crypto_manual"]).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { listing: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.status === "paid" || order.status === "fulfilled") {
    return NextResponse.json({ error: "already_paid" }, { status: 409 });
  }

  const origin = new URL(req.url).origin;
  const checkout = await createCheckout(parsed.data.provider ?? "auto", {
    orderId: order.id,
    amount: order.totalAmount,
    currency: order.currency,
    listingTitle: order.listing.title,
    successUrl: `${origin}/orders/${order.id}?paid=1`,
    cancelUrl: `${origin}/listings/${order.listingId}`,
  });

  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      provider: checkout.provider,
      status: "pending",
      externalId: checkout.externalId,
      checkoutUrl: checkout.checkoutUrl,
      raw: (checkout.raw ?? null) as Prisma.InputJsonValue,
    },
    create: {
      orderId: order.id,
      provider: checkout.provider,
      status: "pending",
      externalId: checkout.externalId,
      checkoutUrl: checkout.checkoutUrl,
      raw: (checkout.raw ?? null) as Prisma.InputJsonValue,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "awaiting_payment" },
  });

  return NextResponse.json({ ok: true, payment, checkoutUrl: checkout.checkoutUrl });
}

