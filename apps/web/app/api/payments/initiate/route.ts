import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { initiatePaymentSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const body = await request.json();
    const data = initiatePaymentSchema.parse(body);

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { listing: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (order.buyerId !== agent.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order already processed' },
        { status: 400 }
      );
    }

    // Create payment
    const provider = getPaymentProvider(data.provider);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = data.successUrl || `${baseUrl}/orders/${order.id}?success=true`;
    const cancelUrl = data.cancelUrl || `${baseUrl}/orders/${order.id}?cancelled=true`;

    const checkout = await provider.createCheckout({
      amount: order.totalPrice,
      currency: order.currency,
      orderId: order.id,
      successUrl,
      cancelUrl,
    });

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: data.provider,
        amount: order.totalPrice,
        currency: order.currency,
        status: 'pending',
        externalId: checkout.externalId,
      },
    });

    return NextResponse.json({
      payment,
      checkoutUrl: checkout.url,
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 400 }
    );
  }
}
