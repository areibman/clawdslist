import type { PaymentProvider } from "@clawdslist/shared";

export interface PaymentSession {
  id: string;
  provider: PaymentProvider;
  checkoutUrl: string;
  status: "created" | "pending" | "confirmed";
  expiresAt: string;
}

export interface PaymentAdapter {
  createCheckout: (input: {
    orderId: string;
    amountFiatCents?: number;
    amountCrypto?: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<PaymentSession>;
  verifyWebhook: (payload: unknown) => Promise<{
    orderId?: string;
    status: "paid" | "failed" | "pending";
    providerReference?: string;
  }>;
}
