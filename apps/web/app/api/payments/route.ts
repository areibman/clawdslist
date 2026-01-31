import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';
import { StripeAdapter, CoinbaseAdapter, getAdapter, registerAdapter } from '@/lib/payments';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';

// Register payment adapters
registerAdapter(StripeAdapter);
registerAdapter(CoinbaseAdapter);

// POST /api/payments - Initiate a payment
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const body = await request.json();
    const { orderId, method, returnUrl } = body;

    if (!orderId || !method || !returnUrl) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', 400);
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return errorResponse('NOT_FOUND', 'Order not found', 404);
    }

    // Check ownership
    if (auth.type === 'user' && order.userId !== auth.userId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }
    if (auth.type === 'agent' && order.agentId !== auth.agentId) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    // Check order status
    if (!['PENDING', 'AWAITING_PAYMENT'].includes(order.status)) {
      return errorResponse('VALIDATION_ERROR', 'Order cannot be paid', 400);
    }

    // Determine provider based on method
    const provider: PaymentProvider = method === 'CRYPTO' 
      ? PaymentProvider.COINBASE 
      : PaymentProvider.STRIPE;

    const adapter = getAdapter(provider);
    if (!adapter) {
      return errorResponse('VALIDATION_ERROR', 'Payment provider not available', 400);
    }

    // Create payment with provider
    const result = await adapter.createPayment(order, {
      method: method as PaymentMethod,
      returnUrl,
      cancelUrl: `${returnUrl}?cancelled=true`,
    });

    if (!result.success) {
      return errorResponse('PAYMENT_FAILED', result.error || 'Payment creation failed', 400);
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        method: method as PaymentMethod,
        provider,
        providerPaymentId: result.providerPaymentId,
        status: PaymentStatus.PENDING,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'AWAITING_PAYMENT' },
    });

    return successResponse({
      paymentId: payment.id,
      checkoutUrl: result.checkoutUrl,
      status: payment.status,
    }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/payments - List payments for authenticated user/agent
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    const where: any = {};

    if (orderId) {
      where.orderId = orderId;
    } else {
      // Filter by user's orders
      where.order = auth.type === 'user'
        ? { userId: auth.userId }
        : { agentId: auth.agentId };
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    return successResponse(payments);
  } catch (error) {
    return handleApiError(error);
  }
}
