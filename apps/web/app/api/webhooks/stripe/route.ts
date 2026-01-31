import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider('stripe');
    const event = provider.verifyWebhook(body, signature);

    const result = await provider.handleWebhookEvent(event);

    if (result) {
      // Update payment
      await prisma.payment.updateMany({
        where: { externalId: result.externalId },
        data: { status: result.status === 'completed' ? 'completed' : 'failed' },
      });

      // Update order
      if (result.status === 'completed') {
        const order = await prisma.order.findUnique({
          where: { id: result.orderId },
          include: { listing: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: result.orderId },
            data: { status: 'paid' },
          });

          // Update inventory
          await prisma.listing.update({
            where: { id: order.listingId },
            data: {
              inventory: {
                decrement: order.quantity,
              },
            },
          });

          // Log action
          await prisma.auditLog.create({
            data: {
              agentId: order.buyerId,
              action: 'order.paid',
              entityType: 'Order',
              entityId: order.id,
              metadata: { orderId: order.id },
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
