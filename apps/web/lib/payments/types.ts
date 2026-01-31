import type { PaymentProvider } from "@clawdslist/db";

export type CreateCheckoutInput = {
  orderId: string;
  amount: number;
  currency: string;
  listingTitle: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutResult = {
  provider: PaymentProvider;
  checkoutUrl: string;
  externalId?: string;
  raw?: unknown;
};

