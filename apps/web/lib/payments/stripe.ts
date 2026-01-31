import Stripe from 'stripe';
import type { PaymentProvider, CreateCheckoutParams, CheckoutResult, PaymentVerification, WebhookResult } from './index';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo', {
  apiVersion: '2023-10-16',
});

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.description,
              },
              unit_amount: Math.round(params.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: params.cancelUrl,
        metadata: {
          orderId: params.orderId,
          ...params.metadata,
        },
      });

      return {
        success: true,
        checkoutUrl: session.url || undefined,
        checkoutId: session.id,
      };
    } catch (error) {
      console.error('Stripe checkout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Stripe checkout',
      };
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        return {
          status: 'completed',
          transactionId: session.payment_intent as string,
          paidAmount: (session.amount_total || 0) / 100,
          paidCurrency: session.currency?.toUpperCase(),
        };
      }

      if (session.status === 'expired') {
        return { status: 'expired' };
      }

      return { status: 'pending' };
    } catch (error) {
      console.error('Stripe verification error:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      };
    }
  }

  async handleWebhook(payload: unknown, signature: string): Promise<WebhookResult> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return { success: false, error: 'Webhook secret not configured' };
      }

      const event = stripe.webhooks.constructEvent(
        JSON.stringify(payload),
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          return {
            success: true,
            eventType: 'payment_completed',
            paymentId: session.id,
            status: 'completed',
          };
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          return {
            success: true,
            eventType: 'payment_expired',
            paymentId: session.id,
            status: 'expired',
          };
        }

        default:
          return {
            success: true,
            eventType: event.type,
          };
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    }
  }
}

export const stripeProvider = new StripeProvider();
