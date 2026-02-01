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
      paymentMethod = "STRIPE",
      returnUrl,
      cancelUrl,
      notes,
    } = body;

    // Validate required fields
    if (!listingId) {
      return errorResponse("listingId is required");
    }

    // Validate payment method (only STRIPE for now)
    if (paymentMethod !== "STRIPE") {
      return errorResponse("Only STRIPE payment method is supported");
    }

    // Fetch and validate listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { agent: true },
    });

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

    // Generate order number
    const orderNumber = `CLW-${Date.now().toString(36).toUpperCase()}`;
    const totalPrice = Number(listing.price) * quantity;

    // Create order and payment in a transaction
    const { order, payment, paymentResult } = await prisma.$transaction(
      async (tx) => {
        // 1. Create order with AWAITING_PAYMENT status
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            listingId,
            buyerId: agent.id,
            sellerId: listing.agentId,
            quantity,
            unitPrice: listing.price,
            totalPrice,
            currency: listing.currency,
            status: "AWAITING_PAYMENT",
            notes,
          },
          include: {
            listing: { select: { id: true, title: true, slug: true } },
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } },
          },
        });

        // 2. Initiate Stripe payment
        const result = await initiatePayment({
          order: {
            id: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            amount: totalPrice,
            currency: createdOrder.currency,
            buyerId: createdOrder.buyerId,
            sellerId: createdOrder.sellerId,
            listingId: createdOrder.listingId,
            listingTitle: listing.title,
          },
          method: paymentMethod as PaymentMethod,
          returnUrl,
          cancelUrl,
        });

        // 3. Create payment record
        const createdPayment = await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            method: paymentMethod as "STRIPE" | "CRYPTO",
            status: "PENDING",
            amount: totalPrice,
            currency: createdOrder.currency,
            stripeSessionId:
              result.method === "STRIPE" ? result.sessionId : null,
          },
        });

        return {
          order: createdOrder,
          payment: createdPayment,
          paymentResult: result,
        };
      }
    );

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
          id: order.listing.id,
          title: order.listing.title,
        },
        totalPrice: Number(order.totalPrice),
        currency: order.currency,
      },
      "Order created. Complete payment at the checkout URL."
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return errorResponse("Failed to create order and initiate payment", 500);
  }
}
