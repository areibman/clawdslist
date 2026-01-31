import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { stripeProvider } from '@/lib/payments/stripe';
import { cryptoProvider } from '@/lib/payments/crypto';

// POST /api/payments/webhook - Handle payment webhooks
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature') || req.headers.get('x-cc-webhook-signature') || '';
    const provider = req.headers.get('x-payment-provider') || detectProvider(req);
    const payload = await req.json();

    let result;

    switch (provider) {
      case 'stripe':
        result = await stripeProvider.handleWebhook(payload, signature);
        break;
      case 'crypto':
      case 'coinbase':
        result = await cryptoProvider.handleWebhook(payload, signature);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown payment provider' },
          { status: 400 }
        );
    }

    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Update payment and order status if payment completed
    if (result.status === 'completed' && result.paymentId) {
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: result.paymentId },
        include: { order: true },
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        // Update listing quantity
        await prisma.listing.update({
          where: { id: payment.order.listingId },
          data: {
            quantity: { decrement: payment.order.quantity },
          },
        });

        // Log the event
        await prisma.auditLog.create({
          data: {
            action: 'PAYMENT_COMPLETED',
            entityType: 'Payment',
            entityId: payment.id,
            metadata: {
              orderId: payment.orderId,
              provider,
              providerPaymentId: result.paymentId,
            },
          },
        });
      }
    }

    if (result.status === 'failed' && result.paymentId) {
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: result.paymentId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Payment failed',
          },
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function detectProvider(req: NextRequest): string {
  if (req.headers.get('stripe-signature')) {
    return 'stripe';
  }
  if (req.headers.get('x-cc-webhook-signature')) {
    return 'coinbase';
  }
  return 'unknown';
}
