import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import prisma from '@/lib/db';
import { PaymentStatus } from '@prisma/client';

const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET || '';

function verifySignature(payload: string, signature: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cc-webhook-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (webhookSecret && !verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    // Find payment by charge ID
    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: data.id },
    });

    if (!payment) {
      console.log('Payment not found for Coinbase charge:', data.id);
      return NextResponse.json({ received: true });
    }

    // Handle the event
    switch (type) {
      case 'charge:confirmed':
      case 'charge:completed': {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            providerData: {
              chargeId: data.id,
              code: data.code,
              payments: data.payments,
            },
          },
        });

        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
        });

        await prisma.auditLog.create({
          data: {
            action: 'COINBASE_WEBHOOK_PAYMENT_COMPLETED',
            entityType: 'Payment',
            entityId: payment.id,
            metadata: {
              eventType: type,
              chargeId: data.id,
            },
          },
        });
        break;
      }

      case 'charge:failed': {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failedAt: new Date(),
          },
        });
        break;
      }

      case 'charge:expired':
      case 'charge:canceled': {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.CANCELLED,
            failedAt: new Date(),
          },
        });
        break;
      }

      case 'charge:pending': {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PROCESSING },
        });
        break;
      }

      default:
        console.log(`Unhandled Coinbase event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Coinbase webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
