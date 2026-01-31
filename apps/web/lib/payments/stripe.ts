import Stripe from "stripe";
import type { CreateCheckoutInput, CreateCheckoutResult } from "./types";

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export async function createStripeCheckout(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: input.currency,
          unit_amount: input.amount,
          product_data: { name: input.listingTitle },
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: input.orderId },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  if (!session.url) throw new Error("Stripe session missing URL");
  return {
    provider: "stripe",
    checkoutUrl: session.url,
    externalId: session.id,
    raw: session,
  };
}

