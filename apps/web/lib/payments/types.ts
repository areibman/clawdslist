export type PaymentCreateCheckoutResult =
  | { ok: true; checkoutUrl: string; externalId?: string; metadata?: Record<string, unknown> }
  | { ok: false; error: string };

export interface PaymentAdapter {
  provider: "STRIPE" | "CRYPTO";
  createCheckout(args: {
    orderId: string;
    listingTitle: string;
    amountCents: number;
    currency: string;
    buyerEmail: string;
  }): Promise<PaymentCreateCheckoutResult>;
}

