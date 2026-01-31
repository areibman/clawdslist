import Stripe from "stripe";
import type {
  PaymentProvider,
  InitiatePaymentRequest,
  PaymentResult,
  PaymentStatusResult,
  WebhookEvent,
  RefundRequest,
  RefundResult,
} from "./types";

// Initialize Stripe client
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-01-27.acacia",
  });
};

export const stripeProvider: PaymentProvider = {
  name: "Stripe",
  method: "STRIPE",

  async initiatePayment(request: InitiatePaymentRequest): Promise<PaymentResult> {
    const stripe = getStripeClient();
    const { order, returnUrl, cancelUrl } = request;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: order.listingTitle,
              description: `Order ${order.orderNumber} on clawdslist`,
              metadata: {
                orderId: order.id,
                listingId: order.listingId,
                buyerId: order.buyerId,
                sellerId: order.sellerId,
              },
            },
            unit_amount: Math.round(order.amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: returnUrl || `${appUrl}/orders/${order.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${appUrl}/orders/${order.id}?cancelled=true`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return {
      method: "STRIPE",
      sessionId: session.id,
      checkoutUrl: session.url!,
      expiresAt: new Date((session.expires_at || 0) * 1000).toISOString(),
    };
  },

  async getPaymentStatus(sessionId: string): Promise<PaymentStatusResult> {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    let status: PaymentStatusResult["status"] = "PENDING";
    let transactionId: string | undefined;

    if (session.payment_status === "paid") {
      status = "COMPLETED";
      if (session.payment_intent && typeof session.payment_intent !== "string") {
        transactionId = session.payment_intent.id;
      }
    } else if (session.status === "expired") {
      status = "FAILED";
    }

    return {
      paymentId: session.id,
      status,
      method: "STRIPE",
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || "USD",
      paidAt: status === "COMPLETED" ? new Date().toISOString() : undefined,
      transactionId,
      metadata: session.metadata || {},
    };
  },

  async processWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    let eventType: WebhookEvent["type"];
    let paymentId: string;
    let orderId: string;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        eventType = "payment.completed";
        paymentId = session.id;
        orderId = session.metadata?.orderId || "";
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        eventType = "payment.expired";
        paymentId = session.id;
        orderId = session.metadata?.orderId || "";
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        eventType = "payment.failed";
        paymentId = paymentIntent.id;
        orderId = paymentIntent.metadata?.orderId || "";
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        eventType = "refund.completed";
        paymentId = charge.payment_intent as string;
        orderId = charge.metadata?.orderId || "";
        break;
      }
      default:
        throw new Error(`Unhandled event type: ${event.type}`);
    }

    return {
      type: eventType,
      paymentId,
      orderId,
      data: event.data.object as Record<string, unknown>,
    };
  },

  async refund(request: RefundRequest): Promise<RefundResult> {
    const stripe = getStripeClient();

    // Get the session to find the payment intent
    const session = await stripe.checkout.sessions.retrieve(request.paymentId);

    if (!session.payment_intent) {
      throw new Error("No payment intent found for this session");
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: request.amount ? Math.round(request.amount * 100) : undefined,
      reason: "requested_by_customer",
      metadata: {
        reason: request.reason || "Customer requested refund",
      },
    });

    return {
      refundId: refund.id,
      status: refund.status === "succeeded" ? "COMPLETED" : "PENDING",
      amount: refund.amount / 100,
      currency: refund.currency.toUpperCase(),
    };
  },
};
