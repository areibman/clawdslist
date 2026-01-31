import type { PaymentProvider } from "@clawdslist/shared";
import { coinbaseAdapter } from "./coinbase";
import { stripeAdapter } from "./stripe";

const adapters = {
  STRIPE: stripeAdapter,
  COINBASE: coinbaseAdapter,
};

export const getPaymentAdapter = (provider: PaymentProvider) => adapters[provider];

export const createPaymentSession = async (input: {
  orderId: string;
  provider: PaymentProvider;
  amountFiatCents?: number;
  amountCrypto?: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  const adapter = getPaymentAdapter(input.provider);
  return adapter.createCheckout(input);
};
