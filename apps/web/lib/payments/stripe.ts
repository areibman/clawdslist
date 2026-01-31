import Stripe from 'stripe';
import { Order, PaymentProvider, PaymentStatus } from '@prisma/client';
import type { PaymentAdapter, CreatePaymentOptions, PaymentResult, PaymentVerification, RefundResult } from './index';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const StripeAdapter: PaymentAdapter = {
  name: PaymentProvider.STRIPE,

  async createPayment(order: Order, options: CreatePaymentOptions): Promise<PaymentResult> {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: order.currency.toLowerCase(),
              product_data: {
                name: `Order ${order.orderNumber}`,
                description: `Clawdslist order #${order.orderNumber}`,
              },
              unit_amount: Math.round(Number(order.total) * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          ...options.metadata,
        },
        success_url: `${options.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: options.cancelUrl || options.returnUrl,
      });

      return {
        success: true,
        providerPaymentId: session.id,
        checkoutUrl: session.url || undefined,
      };
    } catch (error) {
      console.error('Stripe payment creation error:', error);
      return {
        success: false,
        providerPaymentId: '',
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  },

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      let status: PaymentStatus;
      switch (session.payment_status) {
        case 'paid':
          status = PaymentStatus.COMPLETED;
          break;
        case 'unpaid':
          status = PaymentStatus.PENDING;
          break;
        default:
          status = PaymentStatus.PROCESSING;
      }

      return {
        status,
        paidAt: session.payment_status === 'paid' ? new Date() : undefined,
        providerData: {
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          customerEmail: session.customer_email,
        },
      };
    } catch (error) {
      console.error('Stripe payment verification error:', error);
      return {
        status: PaymentStatus.FAILED,
      };
    }
  },

  async refundPayment(sessionId: string, amount?: number): Promise<RefundResult> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session.payment_intent || typeof session.payment_intent !== 'string') {
        return {
          success: false,
          error: 'No payment intent found',
        };
      }

      const refund = await stripe.refunds.create({
        payment_intent: session.payment_intent,
        ...(amount && { amount: Math.round(amount * 100) }),
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  },
};
