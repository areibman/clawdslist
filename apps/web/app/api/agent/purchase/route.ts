import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { requireAgentType } from '@/lib/auth';
import { StripeAdapter, CoinbaseAdapter, registerAdapter } from '@/lib/payments';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';

// Register adapters
registerAdapter(StripeAdapter);
registerAdapter(CoinbaseAdapter);

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CL-${timestamp}-${random}`;
}

/**
 * POST /api/agent/purchase
 * 
 * All-in-one endpoint for buyer agents to:
 * 1. Create an order
 * 2. Initiate payment
 * 
 * Returns everything needed to complete the purchase
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAgentType(request, ['BUYER', 'ADMIN']);

    const body = await request.json();
    const {
      items,
      paymentMethod = 'CARD',
      returnUrl,
      shippingAddress,
      notes,
    } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Order must have at least one item', 400);
    }

    if (!returnUrl) {
      return errorResponse('VALIDATION_ERROR', 'Return URL is required', 400);
    }

    // Validate listings and check availability
    const listingIds = items.map((item: any) => item.listingId);
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        status: 'ACTIVE',
      },
    });

    if (listings.length !== listingIds.length) {
      const foundIds = new Set(listings.map((l) => l.id));
      const missingIds = listingIds.filter((id: string) => !foundIds.has(id));
      return errorResponse(
        'NOT_FOUND',
        `Listings not found or unavailable: ${missingIds.join(', ')}`,
        400
      );
    }

    // Check quantities
    const listingMap = new Map(listings.map((l) => [l.id, l]));
    for (const item of items) {
      const listing = listingMap.get(item.listingId);
      if (!listing) continue;
      if (item.quantity > listing.quantity) {
        return errorResponse(
          'INSUFFICIENT_QUANTITY',
          `Not enough quantity for "${listing.title}". Available: ${listing.quantity}, Requested: ${item.quantity}`,
          400
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const listing = listingMap.get(item.listingId)!;
      const unitPrice = Number(listing.price);
      const total = unitPrice * item.quantity;
      subtotal += total;
      return {
        listingId: item.listingId,
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    const tax = subtotal * 0.0875;
    const total = subtotal + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        subtotal,
        tax,
        total,
        currency: 'USD',
        shippingAddress,
        notes,
        agentId: auth.agentId,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                isDigital: true,
              },
            },
          },
        },
      },
    });

    // Reserve inventory
    for (const item of items) {
      await prisma.listing.update({
        where: { id: item.listingId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Determine payment provider
    const provider: PaymentProvider =
      paymentMethod === 'CRYPTO' ? PaymentProvider.COINBASE : PaymentProvider.STRIPE;

    // Get adapter
    const adapter = provider === PaymentProvider.STRIPE ? StripeAdapter : CoinbaseAdapter;

    // Create payment with provider
    const paymentResult = await adapter.createPayment(order, {
      method: paymentMethod as PaymentMethod,
      returnUrl,
      cancelUrl: `${returnUrl}?cancelled=true`,
      metadata: {
        agentId: auth.agentId!,
        orderNumber: order.orderNumber,
      },
    });

    if (!paymentResult.success) {
      // Rollback inventory reservation
      for (const item of items) {
        await prisma.listing.update({
          where: { id: item.listingId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      // Delete order
      await prisma.order.delete({ where: { id: order.id } });

      return errorResponse('PAYMENT_FAILED', paymentResult.error || 'Payment creation failed', 400);
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        method: paymentMethod as PaymentMethod,
        provider,
        providerPaymentId: paymentResult.providerPaymentId,
        status: PaymentStatus.PENDING,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'AWAITING_PAYMENT' },
    });

    // Log the purchase
    await prisma.auditLog.create({
      data: {
        action: 'AGENT_PURCHASE_INITIATED',
        entityType: 'Order',
        entityId: order.id,
        agentId: auth.agentId,
        metadata: {
          orderNumber: order.orderNumber,
          total,
          paymentMethod,
          itemCount: items.length,
        },
      },
    });

    return successResponse({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'AWAITING_PAYMENT',
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        currency: order.currency,
        items: order.items,
      },
      payment: {
        id: payment.id,
        status: payment.status,
        method: payment.method,
        provider: payment.provider,
        checkoutUrl: paymentResult.checkoutUrl,
      },
      _links: {
        verifyPayment: `/api/payments/${payment.id}/verify`,
        orderStatus: `/api/orders/${order.id}`,
      },
    }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
