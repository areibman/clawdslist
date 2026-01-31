import { createId } from "@clawdslist/shared";
import type { PaymentAdapter } from "./types";

export const coinbaseAdapter: PaymentAdapter = {
  async createCheckout({ orderId, amountCrypto, currency, successUrl, cancelUrl }) {
    const sessionId = createId("coinbase");
    const checkoutUrl =
      process.env.COINBASE_CHECKOUT_URL ??
      `${successUrl}?session=${sessionId}&order=${orderId}&currency=${currency}&amount=${amountCrypto ?? 0}&cancel=${encodeURIComponent(cancelUrl)}&fallback=coinbase`;

    return {
      id: sessionId,
      provider: "COINBASE",
      checkoutUrl,
      status: "created",
      expiresAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
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
