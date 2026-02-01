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
    const signature = request.headers.get("x-webhook-signature") || "";

    // In production, verify the webhook signature from your blockchain indexer
    // For now, we'll process without strict verification

    const event = await processWebhook("CRYPTO", payload, signature);

    console.log("[Crypto Webhook] Received event:", event.type, event.orderId);

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
          console.error("[Crypto Webhook] Failed to update order:", orderError);
          throw new Error("Failed to update order");
        }

        // 2. Update payment record
        await getDb()
          .from("Payment")
          .update({
            status: "COMPLETED",
            cryptoTxHash: event.data.txHash as string,
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
            body: `Congratulations! "${order.listing.title}" was purchased for $${order.totalPrice} (crypto). Order #${order.orderNumber}. Payment received - please fulfill the order and mark it complete.`,
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

        console.log(
          "[Crypto Webhook] Payment completed for order:",
          event.orderId,
          "TX:",
          event.data.txHash
        );
        break;
      }

      case "payment.failed":
      case "payment.expired": {
        // Update order status to CANCELLED
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

        console.log("[Crypto Webhook] Payment failed/expired for order:", event.orderId);
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
