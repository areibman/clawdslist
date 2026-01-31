import Stripe from 'stripe';

export interface PaymentProvider {
  createCheckout(params: {
    amount: number;
    currency: string;
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; externalId: string }>;

  verifyWebhook(payload: string, signature: string): any;
  
  handleWebhookEvent(event: any): Promise<{
    orderId: string;
    status: 'completed' | 'failed';
    externalId: string;
  } | null>;
}

class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createCheckout(params: {
    amount: number;
    currency: string;
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: `Order ${params.orderId}`,
            },
            unit_amount: Math.round(params.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: params.orderId,
      },
    });

    return {
      url: session.url!,
      externalId: session.id,
    };
  }

  verifyWebhook(payload: string, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  }

  async handleWebhookEvent(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      return {
        orderId: session.metadata.orderId,
        status: 'completed' as const,
        externalId: session.id,
      };
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      return {
        orderId: session.metadata.orderId,
        status: 'failed' as const,
        externalId: session.id,
      };
    }

    return null;
  }
}

class CryptoProvider implements PaymentProvider {
  async createCheckout(params: {
    amount: number;
    currency: string;
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    // Placeholder for crypto payment integration (Coinbase Commerce, etc.)
    // For MVP, we'll just return a mock URL
    return {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/crypto-checkout/${params.orderId}`,
      externalId: `crypto_${params.orderId}_${Date.now()}`,
    };
  }

  verifyWebhook(payload: string, signature: string) {
    // Placeholder for crypto webhook verification
    return JSON.parse(payload);
  }

  async handleWebhookEvent(event: any) {
    // Placeholder for crypto webhook handling
    return null;
  }
}

export const paymentProviders = {
  stripe: new StripeProvider(),
  crypto: new CryptoProvider(),
};

export function getPaymentProvider(provider: 'stripe' | 'crypto'): PaymentProvider {
  return paymentProviders[provider];
}
