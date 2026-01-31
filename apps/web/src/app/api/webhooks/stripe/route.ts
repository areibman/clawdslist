import { NextRequest, NextResponse } from "next/server";
import { stripeAdapter } from "@/lib/payments/stripe";
import { updateOrder } from "@/lib/mock-store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const result = await stripeAdapter.verifyWebhook(payload);

  if (result.orderId && result.status === "paid") {
    updateOrder(result.orderId, { status: "PAID" });
  }

  return NextResponse.json({ received: true });
}
