import type { CreateCheckoutInput, CreateCheckoutResult } from "./types";

export async function createCryptoManualCheckout(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  // MVP: no onchain provider yet. This returns a local URL that the UI can
  // render as "Send USDC to ..." + a dev-only "Mark paid" button.
  return {
    provider: "crypto_manual",
    checkoutUrl: `/orders/${input.orderId}?pay=crypto`,
    externalId: `manual_${input.orderId}`,
    raw: { hint: "manual_crypto", currency: input.currency, amount: input.amount },
  };
}

