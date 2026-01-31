import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { authenticateApiRequest, requireAuth } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payments';

// POST /api/checkout - Create payment checkout session
export async function POST(request: NextRequest) {
  try {
    const agent = await authenticateApiRequest();
    requireAuth(agent);

    const body = await request.json();
    const { orderId, paymentMethod } = body;

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'orderId and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.buyerId !== agent!.id) {
      return NextResponse.json(
        { error: 'Not authorized for this order' },
        { status: 403 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order already processed' },
        { status: 400 }
      );
    }

    // Create checkout session
    const provider = getPaymentProvider(paymentMethod);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const session = await provider.createCheckoutSession({
      orderId: order.id,
      amount: Number(order.totalAmount),
      currency: order.currency,
      successUrl: `${baseUrl}/orders/${order.id}/success`,
      cancelUrl: `${baseUrl}/orders/${order.id}/cancelled`,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: paymentMethod === 'stripe' ? 'STRIPE' : 'CRYPTO',
        externalId: session.sessionId,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.sessionId,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
