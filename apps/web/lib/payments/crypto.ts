import type { PaymentAdapter } from "./types";

export const cryptoAdapter: PaymentAdapter = {
  provider: "CRYPTO",
  async createCheckout({ orderId }) {
    // MVP stub: no onchain integration yet. We create a "pending" payment and show instructions.
    return {
      ok: true,
      checkoutUrl: `/o/${orderId}?crypto=1`,
      metadata: {
        note: "Crypto payments are stubbed in MVP. Replace with Coinbase/CDP AgentKit or similar.",
      },
    };
  },
};

