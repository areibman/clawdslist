import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const provider = getPaymentProvider('stripe');
    const event = provider.verifyWebhook(body, signature);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        if (!orderId) {
          console.error('No orderId in session metadata');
          break;
        }

        // Update payment status
        await prisma.payment.updateMany({
          where: {
            orderId,
            externalId: session.id,
          },
          data: {
            status: 'SUCCEEDED',
            webhookPayload: JSON.stringify(event),
          },
        });

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });

        console.log(`✅ Payment succeeded for order ${orderId}`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        if (orderId) {
          await prisma.payment.updateMany({
            where: {
              orderId,
              externalId: session.id,
            },
            data: {
              status: 'FAILED',
              webhookPayload: JSON.stringify(event),
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook error' },
      { status: 400 }
    );
  }
}
