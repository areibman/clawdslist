import { NextRequest, NextResponse } from "next/server";
import type { PaymentProvider } from "@clawdslist/shared";
import { createPaymentSession } from "@/lib/payments";
import { store } from "@/lib/mock-store";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    orderId: string;
    provider: PaymentProvider;
  };

  const order = store.orders.find((item) => item.id === payload.orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const session = await createPaymentSession({
    orderId: order.id,
    provider: payload.provider ?? "STRIPE",
    amountFiatCents: order.totalFiatCents,
    amountCrypto: order.totalCrypto,
    currency: order.currency,
    successUrl: `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/orders`,
    cancelUrl: `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/orders`,
  });

  return NextResponse.json({ data: session });
}
