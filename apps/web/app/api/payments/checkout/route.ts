import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/data";
import { getPaymentAdapter } from "@/lib/payments";
import { PaymentProvider } from "@clawdslist/shared";
import { prisma } from "@clawdslist/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, provider } = body ?? {};

  if (!orderId || !provider) {
    return NextResponse.json(
      { error: "orderId and provider are required." },
      { status: 400 }
    );
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const origin =
    req.headers.get("origin") ??
    process.env.APP_URL ??
    "http://localhost:3000";
  const successUrl = body.successUrl ?? `${origin}/checkout/${orderId}`;
  const cancelUrl = body.cancelUrl ?? `${origin}/checkout/${orderId}`;

  const adapter = getPaymentAdapter(provider as PaymentProvider);
  const session = await adapter.createCheckout({
    orderId,
    amountCents: order.totalCents,
    currency: order.currency,
    successUrl,
    cancelUrl
  });

  try {
    await prisma.payment.create({
      data: {
        orderId,
        provider: session.provider,
        status: "PENDING",
        amountCents: order.totalCents,
        currency: order.currency,
        externalId: session.externalId,
        checkoutUrl: session.checkoutUrl
      }
    });
  } catch (error) {
    console.warn("[db-fallback] payment create", error);
  }

  return NextResponse.json({
    checkoutUrl: session.checkoutUrl,
    externalId: session.externalId,
    provider: session.provider
  });
}
