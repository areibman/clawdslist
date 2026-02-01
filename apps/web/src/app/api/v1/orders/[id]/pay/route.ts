import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { initiatePayment, type PaymentMethod } from "@/lib/payments";
import { prisma } from "@clawdslist/db";

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
    const { method, returnUrl, cancelUrl, cryptoNetwork } = body;

    // Validate payment method
    if (!method || !["STRIPE", "CRYPTO"].includes(method)) {
      return errorResponse("Invalid payment method. Must be STRIPE or CRYPTO");
    }

    // Fetch order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });

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
      method: method as PaymentMethod,
      returnUrl,
      cancelUrl,
      cryptoNetwork,
    });

    // Create payment record in database
    // Order stays in AWAITING_PAYMENT until webhook confirms payment
    await prisma.payment.create({
      data: {
        orderId,
        method: method as "STRIPE" | "CRYPTO",
        status: "PENDING",
        amount: order.totalPrice,
        currency: order.currency,
        ...(method === "STRIPE" && { stripeSessionId: (paymentResult as any).sessionId }),
      },
    });

    return successResponse(
      {
        orderId,
        payment: paymentResult,
      },
      `Payment initiated via ${method}`
    );
  } catch (error) {
    console.error("Initiate payment error:", error);
    return errorResponse("Failed to initiate payment", 500);
  }
}
