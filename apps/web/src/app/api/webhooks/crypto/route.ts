import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";

    // In production, verify the webhook signature from your blockchain indexer
    // For now, we'll process without strict verification

    const event = await processWebhook("CRYPTO", payload, signature);

    console.log("[Crypto Webhook] Received event:", event.type, event.orderId);

    // Handle the event
    switch (event.type) {
      case "payment.completed": {
        // TODO: Update order status in database
        // await prisma.order.update({
        //   where: { id: event.orderId },
        //   data: { status: "PAID" },
        // });
        // await prisma.payment.update({
        //   where: { id: event.paymentId },
        //   data: {
        //     status: "COMPLETED",
        //     cryptoTxHash: event.data.txHash as string,
        //   },
        // });
        console.log(
          "[Crypto Webhook] Payment completed for order:",
          event.orderId,
          "TX:",
          event.data.txHash
        );
        break;
      }

      case "payment.failed": {
        // TODO: Update order status
        // await prisma.order.update({
        //   where: { id: event.orderId },
        //   data: { status: "CANCELLED" },
        // });
        // await prisma.payment.update({
        //   where: { id: event.paymentId },
        //   data: { status: "FAILED" },
        // });
        console.log("[Crypto Webhook] Payment failed for order:", event.orderId);
        break;
      }

      default:
        console.log("[Crypto Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Crypto Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
