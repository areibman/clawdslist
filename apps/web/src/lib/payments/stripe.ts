import Stripe from 'stripe';
import type { PaymentProvider, PaymentInitResult, PaymentStatusResult } from './index';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo', {
  apiVersion: '2023-10-16',
});

export class StripeAdapter implements PaymentProvider {
  name = 'stripe';

  async initPayment(
    orderId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>
  ): Promise<PaymentInitResult> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Clawdslist Order #${orderId}`,
                description: 'Marketplace purchase',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?canceled=true`,
        metadata: {
          orderId,
          ...metadata,
        },
      });

      return {
        success: true,
        paymentId: session.id,
        paymentUrl: session.url || undefined,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
        metadata: { sessionId: session.id },
      };
    } catch (error) {
      console.error('Stripe initPayment error:', error);
      return {
        success: false,
        paymentId: '',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    try {
      const session = await stripe.checkout.sessions.retrieve(paymentId);

      let status: PaymentStatusResult['status'] = 'pending';
      if (session.payment_status === 'paid') {
        status = 'completed';
      } else if (session.status === 'expired') {
        status = 'failed';
      }

      return {
        success: true,
        status,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        paidAt: session.payment_status === 'paid' ? new Date() : undefined,
      };
    } catch (error) {
      console.error('Stripe getPaymentStatus error:', error);
      return {
        success: false,
        status: 'pending',
        amount: 0,
        currency: 'USD',
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const session = await stripe.checkout.sessions.retrieve(paymentId);
      if (!session.payment_intent) {
        return { success: false };
      }

      const refund = await stripe.refunds.create({
        payment_intent: session.payment_intent as string,
        ...(amount && { amount: Math.round(amount * 100) }),
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return { success: false };
    }
  }

  async handleWebhook(payload: unknown, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = stripe.webhooks.constructEvent(
        JSON.stringify(payload),
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          return {
            event: 'payment_completed',
            orderId: session.metadata?.orderId,
            status: 'PAID',
          };
        }
        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          return {
            event: 'payment_expired',
            orderId: session.metadata?.orderId,
            status: 'CANCELLED',
          };
        }
        default:
          return { event: event.type };
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }
}
