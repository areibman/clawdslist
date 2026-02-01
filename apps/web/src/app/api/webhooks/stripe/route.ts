import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/payments";
import { prisma } from "@clawdslist/db";
import { sendSaleNotification } from "@/lib/email";

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
        // 1. Update order status to PENDING (paid, awaiting seller fulfillment)
        const order = await prisma.order.update({
          where: { id: event.orderId },
          data: { status: "PENDING" },
          include: {
            listing: true,
            seller: true,
            buyer: { select: { id: true, name: true } },
          },
        });

        // 2. Update payment record
        await prisma.payment.updateMany({
          where: { orderId: event.orderId, status: "PENDING" },
          data: {
            status: "COMPLETED",
            stripePaymentId: event.paymentId,
          },
        });

        // 3. Decrement listing quantity (or mark SOLD if qty=0)
        const newQty = order.listing.quantity - order.quantity;
        await prisma.listing.update({
          where: { id: order.listingId },
          data: {
            quantity: newQty,
            status: newQty <= 0 ? "SOLD" : "ACTIVE",
          },
        });

        // 4. Notify seller via in-app message
        await prisma.message.create({
          data: {
            senderId: order.buyerId,
            receiverId: order.sellerId,
            subject: `Your listing sold! Order ${order.orderNumber}`,
            body: `Congratulations! "${order.listing.title}" was purchased for $${order.totalPrice}. Order #${order.orderNumber}. Payment is in escrow - please fulfill the order and mark it complete.`,
            listingId: order.listingId,
          },
        });

        // 5. If seller has email, send via Resend
        if (order.seller.email) {
          await sendSaleNotification({
            sellerEmail: order.seller.email,
            sellerName: order.seller.name,
            listingTitle: order.listing.title,
            orderNumber: order.orderNumber,
            totalPrice: Number(order.totalPrice),
            currency: order.currency,
          });
        }

        console.log("[Stripe Webhook] Payment completed for order:", event.orderId);
        break;
      }

      case "payment.failed":
      case "payment.expired": {
        // Update order status to CANCELLED
        // Buyer can create a new order if they want to retry
        await prisma.order.update({
          where: { id: event.orderId },
          data: { status: "CANCELLED" },
        });

        // Update payment record
        await prisma.payment.updateMany({
          where: { orderId: event.orderId, status: "PENDING" },
          data: { status: "FAILED" },
        });

        console.log("[Stripe Webhook] Payment failed/expired for order:", event.orderId);
        break;
      }

      case "refund.completed": {
        await prisma.order.update({
          where: { id: event.orderId },
          data: { status: "REFUNDED" },
        });

        await prisma.payment.updateMany({
          where: { orderId: event.orderId },
          data: { status: "REFUNDED" },
        });

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
