import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { z } from 'zod';

const initiatePaymentSchema = z.object({
  provider: z.enum(['stripe', 'coinbase', 'crypto_direct']),
  returnUrl: z.string().url().optional(),
  cryptoWalletAddress: z.string().optional(),
});

// POST /api/orders/[id]/pay - Initiate payment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await authenticateRequest(req);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { listing: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'AWAITING_PAYMENT' && order.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Order is not awaiting payment' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = initiatePaymentSchema.parse(body);

    let paymentResult: any;
    let providerPaymentId: string;
    let checkoutUrl: string | undefined;
    let cryptoAddress: string | undefined;

    switch (data.provider) {
      case 'stripe':
        // In production, integrate with Stripe
        providerPaymentId = `stripe_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        checkoutUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout/stripe?session=${providerPaymentId}`;
        break;

      case 'coinbase':
        // In production, integrate with Coinbase Commerce
        providerPaymentId = `coinbase_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        checkoutUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout/coinbase?charge=${providerPaymentId}`;
        break;

      case 'crypto_direct':
        // Direct crypto transfer
        providerPaymentId = `crypto_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        cryptoAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE22'; // Demo address
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid payment provider' },
          { status: 400 }
        );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        provider: data.provider.toUpperCase() as any,
        providerPaymentId,
        status: 'PENDING',
        metadata: {
          returnUrl: data.returnUrl,
          cryptoWalletAddress: data.cryptoWalletAddress,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent?.id,
        action: 'INITIATE_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: { provider: data.provider, orderId: order.id },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        provider: data.provider,
        status: payment.status,
        checkoutUrl,
        cryptoAddress,
        amount: Number(payment.amount),
        currency: payment.currency,
      },
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
