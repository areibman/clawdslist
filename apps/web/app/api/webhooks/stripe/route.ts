import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db';
import { PaymentStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Find payment by provider ID
          const payment = await prisma.payment.findFirst({
            where: { providerPaymentId: session.id },
          });

          if (payment) {
            const paymentIntentId = typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id || null;

            // Update payment status
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.COMPLETED,
                paidAt: new Date(),
                providerData: {
                  sessionId: session.id,
                  paymentIntent: paymentIntentId,
                  customerEmail: session.customer_email,
                },
              },
            });

            // Update order status
            await prisma.order.update({
              where: { id: orderId },
              data: { status: 'PAID' },
            });

            // Log the webhook event
            await prisma.auditLog.create({
              data: {
                action: 'STRIPE_WEBHOOK_PAYMENT_COMPLETED',
                entityType: 'Payment',
                entityId: payment.id,
                metadata: {
                  eventId: event.id,
                  sessionId: session.id,
                  orderId,
                },
              },
            });
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const payment = await prisma.payment.findFirst({
          where: { providerPaymentId: session.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.CANCELLED,
              failedAt: new Date(),
            },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
        
        if (paymentIntentId) {
          // Find payment by payment intent - search all payments and filter
          const payments = await prisma.payment.findMany({
            where: { provider: 'STRIPE' },
          });

          const payment = payments.find((p) => {
            const data = p.providerData as { paymentIntent?: string } | null;
            return data?.paymentIntent === paymentIntentId;
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.REFUNDED,
                refundedAt: new Date(),
              },
            });

            await prisma.order.update({
              where: { id: payment.orderId },
              data: { status: 'REFUNDED' },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
