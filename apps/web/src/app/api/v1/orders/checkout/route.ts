import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { initiatePayment, type PaymentMethod } from "@/lib/payments";
import {
  getListingWithAgent,
  createOrder,
  createPayment,
  updateOrder,
} from "@/lib/db";

// POST /api/v1/orders/checkout - Create order and initiate payment in one call
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      listingId,
      quantity = 1,
      paymentMethod,
      method, // Accept both 'method' and 'paymentMethod' for consistency with /orders/:id/pay
      returnUrl,
      cancelUrl,
      notes,
    } = body;

    // Accept both parameter names, default to STRIPE
    const resolvedPaymentMethod = (paymentMethod || method || "STRIPE").toUpperCase();

    // Validate required fields
    if (!listingId) {
      return errorResponse("listingId is required");
    }

    // Validate payment method (only STRIPE for now)
    if (resolvedPaymentMethod !== "STRIPE") {
      return errorResponse("Only STRIPE payment method is supported");
    }

    // Fetch and validate listing
    const listing = await getListingWithAgent(listingId);

    if (!listing) {
      return notFoundResponse("Listing");
    }
    if (listing.status !== "ACTIVE") {
      return errorResponse("Listing is not available for purchase");
    }
    if (listing.agentId === agent.id) {
      return errorResponse("Cannot purchase your own listing");
    }
    if (quantity > listing.quantity) {
      return errorResponse(
        `Requested quantity (${quantity}) exceeds available stock (${listing.quantity})`
      );
    }
    if (quantity < 1) {
      return errorResponse("Quantity must be at least 1");
    }

    const totalPrice = Number(listing.price) * quantity;

    // Create order with AWAITING_PAYMENT status
    // Note: We're doing sequential operations here since Supabase REST doesn't support transactions
    // If any step fails, we handle cleanup
    const order = await createOrder({
      listingId,
      buyerId: agent.id,
      sellerId: listing.agentId,
      quantity,
      unitPrice: Number(listing.price),
      totalPrice,
      currency: listing.currency,
      notes,
    });

    if (!order) {
      return errorResponse("Failed to create order", 500);
    }

    try {
      // Initiate Stripe payment
      const paymentResult = await initiatePayment({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          amount: totalPrice,
          currency: order.currency,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          listingId: order.listingId,
          listingTitle: listing.title,
        },
        method: resolvedPaymentMethod as PaymentMethod,
        returnUrl,
        cancelUrl,
      });

      // Create payment record
      const payment = await createPayment({
        orderId: order.id,
        method: resolvedPaymentMethod as "STRIPE" | "CRYPTO",
        amount: totalPrice,
        currency: order.currency,
        stripeSessionId:
          paymentResult.method === "STRIPE" ? paymentResult.sessionId : undefined,
      });

      if (!payment) {
        // Order was created but payment record failed - cancel the order
        await updateOrder(order.id, { status: "CANCELLED" });
        return errorResponse("Failed to create payment record", 500);
      }

      // Return checkout URL for the buyer to complete payment
      return successResponse(
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          checkoutUrl:
            paymentResult.method === "STRIPE" ? paymentResult.checkoutUrl : null,
          expiresAt:
            paymentResult.method === "STRIPE" ? paymentResult.expiresAt : null,
          listing: {
            id: listing.id,
            title: listing.title,
          },
          totalPrice: Number(order.totalPrice),
          currency: order.currency,
        },
        "Order created. Complete payment at the checkout URL."
      );
    } catch (paymentError) {
      // Payment initiation failed - cancel the order
      console.error("Payment initiation failed:", paymentError);
      await updateOrder(order.id, { status: "CANCELLED" });
      
      const message = paymentError instanceof Error ? paymentError.message : "Unknown error";
      
      if (message.includes("STRIPE_SECRET_KEY")) {
        return errorResponse("Payment system not configured. Please contact support.", 503);
      }
      if (message.includes("Invalid API Key")) {
        return errorResponse("Payment system configuration error. Please contact support.", 503);
      }
      
      return errorResponse(`Payment initiation failed: ${message}`, 500);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Checkout failed: ${message}`, 500);
  }
}
