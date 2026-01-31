import { createId } from "@clawdslist/shared";
import type { PaymentAdapter } from "./types";

export const stripeAdapter: PaymentAdapter = {
  async createCheckout({ orderId, amountFiatCents, currency, successUrl, cancelUrl }) {
    const sessionId = createId("stripe");
    const checkoutUrl =
      process.env.STRIPE_CHECKOUT_URL ??
      `${successUrl}?session=${sessionId}&order=${orderId}&currency=${currency}&amount=${amountFiatCents ?? 0}&cancel=${encodeURIComponent(cancelUrl)}&fallback=stripe`;

    return {
      id: sessionId,
      provider: "STRIPE",
      checkoutUrl,
      status: "created",
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    };
  },
  async verifyWebhook(payload) {
    const data = payload as { orderId?: string; status?: string; reference?: string };
    return {
      orderId: data.orderId,
      status: data.status === "paid" ? "paid" : "pending",
      providerReference: data.reference,
    };
  },
};
