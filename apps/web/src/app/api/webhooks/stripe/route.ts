import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { StripeAdapter } from '@/lib/payments/stripe';

const stripeAdapter = new StripeAdapter();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const result = await stripeAdapter.handleWebhook(JSON.parse(body), signature);

    if (result.orderId && result.status) {
      // Update order status
      await prisma.order.update({
        where: { id: result.orderId },
        data: {
          status: result.status as any,
          ...(result.status === 'PAID' && { paidAt: new Date() }),
        },
      });

      // Update payment record
      await prisma.payment.updateMany({
        where: { orderId: result.orderId },
        data: {
          status: result.status === 'PAID' ? 'COMPLETED' : 'FAILED',
          ...(result.status === 'PAID' && { completedAt: new Date() }),
        },
      });

      // If paid, update listing quantities
      if (result.status === 'PAID') {
        const order = await prisma.order.findUnique({
          where: { id: result.orderId },
          include: { items: true },
        });

        if (order) {
          for (const item of order.items) {
            await prisma.listing.update({
              where: { id: item.listingId },
              data: {
                quantity: { decrement: item.quantity },
              },
            });
          }
        }
      }

      // Log the event
      await prisma.auditLog.create({
        data: {
          action: 'PAYMENT_WEBHOOK',
          entityType: 'Order',
          entityId: result.orderId,
          metadata: { event: result.event, status: result.status },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
