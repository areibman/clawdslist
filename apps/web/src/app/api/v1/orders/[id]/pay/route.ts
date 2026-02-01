import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { initiatePayment, type PaymentMethod } from "@/lib/payments";
import { getOrderById, createPayment } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/orders/[id]/pay - Initiate payment for order
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { method, paymentMethod, returnUrl, cancelUrl, cryptoNetwork } = body;

    // Accept both 'method' and 'paymentMethod' for consistency with /orders/checkout
    const resolvedMethod = ((method || paymentMethod) ?? "").toUpperCase();

    // Validate payment method
    if (!resolvedMethod || !["STRIPE", "CRYPTO"].includes(resolvedMethod)) {
      return errorResponse("Invalid payment method. Must be STRIPE or CRYPTO");
    }

    // Fetch order from database
    const order = await getOrderById(orderId);

    if (!order) {
      return notFoundResponse("Order");
    }
    if (order.buyerId !== agent.id) {
      return errorResponse("Forbidden", 403);
    }
    if (order.status !== "AWAITING_PAYMENT") {
      return errorResponse("Order is not awaiting payment");
    }

    // Initiate payment via the appropriate provider
    const paymentResult = await initiatePayment({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.totalPrice),
        currency: order.currency,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        listingId: order.listingId,
        listingTitle: order.listing.title,
      },
      method: resolvedMethod as PaymentMethod,
      returnUrl,
      cancelUrl,
      cryptoNetwork,
    });

    // Create payment record in database
    // Order stays in AWAITING_PAYMENT until webhook confirms payment
    await createPayment({
      orderId,
      method: resolvedMethod as "STRIPE" | "CRYPTO",
      amount: Number(order.totalPrice),
      currency: order.currency,
      stripeSessionId: resolvedMethod === "STRIPE" ? (paymentResult as { sessionId: string }).sessionId : undefined,
    });

    return successResponse(
      {
        orderId,
        payment: paymentResult,
      },
      `Payment initiated via ${resolvedMethod}`
    );
  } catch (error) {
    console.error("Initiate payment error:", error);
    return errorResponse("Failed to initiate payment", 500);
  }
}
