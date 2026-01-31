import { NextRequest, NextResponse } from "next/server";
import { coinbaseAdapter } from "@/lib/payments/coinbase";
import { updateOrder } from "@/lib/mock-store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const result = await coinbaseAdapter.verifyWebhook(payload);

  if (result.orderId && result.status === "paid") {
    updateOrder(result.orderId, { status: "PAID" });
  }

  return NextResponse.json({ received: true });
}
