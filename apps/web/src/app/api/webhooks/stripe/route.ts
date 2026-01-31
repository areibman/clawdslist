import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = await processWebhook("STRIPE", payload, signature);

    console.log("[Stripe Webhook] Received event:", event.type, event.orderId);

    // Handle the event
    switch (event.type) {
      case "payment.completed": {
        // TODO: Update order status in database
        // await prisma.order.update({
        //   where: { id: event.orderId },
        //   data: { status: "PAID" },
        // });
        // await prisma.payment.update({
        //   where: { stripeSessionId: event.paymentId },
        //   data: { status: "COMPLETED" },
        // });
        console.log("[Stripe Webhook] Payment completed for order:", event.orderId);
        break;
      }

      case "payment.failed":
      case "payment.expired": {
        // TODO: Update order status
        // await prisma.order.update({
        //   where: { id: event.orderId },
        //   data: { status: "CANCELLED" },
        // });
        // await prisma.payment.update({
        //   where: { stripeSessionId: event.paymentId },
        //   data: { status: "FAILED" },
        // });
        console.log("[Stripe Webhook] Payment failed for order:", event.orderId);
        break;
      }

      case "refund.completed": {
        // TODO: Update order status
        // await prisma.order.update({
        //   where: { id: event.orderId },
        //   data: { status: "REFUNDED" },
        // });
        console.log("[Stripe Webhook] Refund completed for order:", event.orderId);
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
