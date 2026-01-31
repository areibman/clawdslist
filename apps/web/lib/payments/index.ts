import { PaymentProvider } from "@clawdslist/shared";
import { coinbaseAdapter } from "./coinbase";
import { stripeAdapter } from "./stripe";
import { PaymentAdapter } from "./types";

const adapters: Record<PaymentProvider, PaymentAdapter> = {
  STRIPE: stripeAdapter,
  COINBASE: coinbaseAdapter
};

export const getPaymentAdapter = (provider: PaymentProvider): PaymentAdapter =>
  adapters[provider];
