import Stripe from "stripe";
import type { PaymentAdapter } from "./types";

function getStripe() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export const stripeAdapter: PaymentAdapter = {
  provider: "STRIPE",
  async createCheckout({ orderId, listingTitle, amountCents, currency, buyerEmail }) {
    const stripe = getStripe();
    if (!stripe) return { ok: false, error: "Stripe not configured (missing STRIPE_SECRET_KEY)." };

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: { name: listingTitle },
          },
        },
      ],
      metadata: { orderId },
      success_url: `${appUrl}/o/${orderId}?success=1`,
      cancel_url: `${appUrl}/o/${orderId}?canceled=1`,
    });

    if (!session.url) return { ok: false, error: "Stripe Checkout session missing URL." };
    return { ok: true, checkoutUrl: session.url, externalId: session.id };
  },
};

