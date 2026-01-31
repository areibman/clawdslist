import Stripe from 'stripe';

// Payment Provider Interface
export interface PaymentProvider {
  createCheckoutSession(params: {
    orderId: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }>;

  verifyWebhook(payload: string, signature: string): any;
}

// Stripe Payment Provider
export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(params: {
    orderId: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: 'Clawdslist Purchase',
              description: `Order #${params.orderId}`,
            },
            unit_amount: Math.round(params.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: params.orderId,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  verifyWebhook(payload: string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

// Crypto Payment Provider (Placeholder)
export class CryptoPaymentProvider implements PaymentProvider {
  async createCheckoutSession(params: {
    orderId: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    // TODO: Integrate with Coinbase Commerce or similar
    // For MVP, return a placeholder
    return {
      url: `/checkout/crypto/${params.orderId}`,
      sessionId: `crypto_${params.orderId}`,
    };
  }

  verifyWebhook(payload: string, signature: string) {
    // TODO: Implement crypto webhook verification
    return JSON.parse(payload);
  }
}

// Factory function
export function getPaymentProvider(provider: 'stripe' | 'crypto'): PaymentProvider {
  switch (provider) {
    case 'stripe':
      return new StripePaymentProvider();
    case 'crypto':
      return new CryptoPaymentProvider();
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}
