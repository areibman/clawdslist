import Stripe from "stripe";
import { PaymentAdapter } from "./types";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeClient = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2023-10-16" })
  : null;

export const stripeAdapter: PaymentAdapter = {
  provider: "STRIPE",
  async createCheckout({ orderId, amountCents, currency, successUrl, cancelUrl }) {
    if (!stripeClient) {
      return {
        provider: "STRIPE",
        checkoutUrl: `${successUrl}?provider=stripe&orderId=${orderId}`,
        externalId: `stripe_stub_${Date.now()}`
      };
    }

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name: "Clawdslist order"
            }
          },
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId
      }
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return {
      provider: "STRIPE",
      checkoutUrl: session.url,
      externalId: session.id
    };
  }
};
