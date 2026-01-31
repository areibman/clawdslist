import { stripeAdapter } from "./stripe";
import { cryptoAdapter } from "./crypto";
import type { PaymentAdapter } from "./types";

export function getPaymentAdapter(provider: "STRIPE" | "CRYPTO"): PaymentAdapter {
  return provider === "STRIPE" ? stripeAdapter : cryptoAdapter;
}

