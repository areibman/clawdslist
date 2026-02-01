import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/payments";
import { sendSaleNotification, sendPurchaseConfirmation } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase";

// Helper to get db client
function getDb() {
  return getSupabaseAdmin();
}

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
        const { data: order, error: orderError } = await getDb()
          .from("Order")
          .update({ status: "PENDING" })
          .eq("id", event.orderId)
          .select(`
            *,
            listing:Listing(*),
            seller:Agent!Order_sellerId_fkey(*),
            buyer:Agent!Order_buyerId_fkey(*)
          `)
          .single();

        if (orderError || !order) {
          console.error("[Stripe Webhook] Failed to update order:", orderError);
          throw new Error("Failed to update order");
        }

        // 2. Update payment record
        await getDb()
          .from("Payment")
          .update({
            status: "COMPLETED",
            stripePaymentId: event.paymentId,
          })
          .eq("orderId", event.orderId)
          .eq("status", "PENDING");

        // 3. Decrement listing quantity (or mark SOLD if qty=0)
        const newQty = order.listing.quantity - order.quantity;
        await getDb()
          .from("Listing")
          .update({
            quantity: newQty,
            status: newQty <= 0 ? "SOLD" : "ACTIVE",
          })
          .eq("id", order.listingId);

        // 4. Notify seller via in-app message
        await getDb()
          .from("Message")
          .insert({
            senderId: order.buyerId,
            receiverId: order.sellerId,
            subject: `Your listing sold! Order ${order.orderNumber}`,
            body: `Congratulations! "${order.listing.title}" was purchased for $${order.totalPrice}. Order #${order.orderNumber}. Payment is in escrow - please fulfill the order and mark it complete.`,
            listingId: order.listingId,
          });

        // 5. Send email to seller
        if (order.seller.email) {
          await sendSaleNotification({
            sellerEmail: order.seller.email,
            sellerName: order.seller.name,
            buyerName: order.buyer.name,
            listingTitle: order.listing.title,
            orderNumber: order.orderNumber,
            totalPrice: Number(order.totalPrice),
            currency: order.currency,
          });
        }

        // 6. Send email to buyer
        if (order.buyer.email) {
          await sendPurchaseConfirmation({
            buyerEmail: order.buyer.email,
            buyerName: order.buyer.name,
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
        await getDb()
          .from("Order")
          .update({ status: "CANCELLED" })
          .eq("id", event.orderId);

        // Update payment record
        await getDb()
          .from("Payment")
          .update({ status: "FAILED" })
          .eq("orderId", event.orderId)
          .eq("status", "PENDING");

        console.log("[Stripe Webhook] Payment failed/expired for order:", event.orderId);
        break;
      }

      case "refund.completed": {
        await getDb()
          .from("Order")
          .update({ status: "REFUNDED" })
          .eq("id", event.orderId);

        await getDb()
          .from("Payment")
          .update({ status: "REFUNDED" })
          .eq("orderId", event.orderId);

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
