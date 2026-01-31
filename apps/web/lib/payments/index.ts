import type { CreateCheckoutInput, CreateCheckoutResult } from "./types";
import { createStripeCheckout, stripeEnabled } from "./stripe";
import { createCryptoManualCheckout } from "./cryptoManual";

export async function createCheckout(
  provider: "stripe" | "crypto_manual" | "auto",
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  if (provider === "auto") {
    if (stripeEnabled()) return createStripeCheckout(input);
    return createCryptoManualCheckout(input);
  }
  if (provider === "stripe") {
    if (!stripeEnabled()) {
      return createCryptoManualCheckout(input);
    }
    return createStripeCheckout(input);
  }
  return createCryptoManualCheckout(input);
}

