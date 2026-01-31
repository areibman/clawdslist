import { PaymentProvider } from "@clawdslist/shared";

export type CheckoutSession = {
  provider: PaymentProvider;
  checkoutUrl: string;
  externalId: string;
};

export type PaymentAdapter = {
  provider: PaymentProvider;
  createCheckout: (input: {
    orderId: string;
    amountCents: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<CheckoutSession>;
};
