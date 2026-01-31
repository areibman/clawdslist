import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { getAdapter } from '@/lib/payments';
import { PaymentStatus } from '@prisma/client';

// POST /api/payments/[id]/verify - Verify payment status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { order: true },
    });

    if (!payment) {
      return errorResponse('NOT_FOUND', 'Payment not found', 404);
    }

    if (!payment.providerPaymentId) {
      return errorResponse('VALIDATION_ERROR', 'No provider payment ID', 400);
    }

    const adapter = getAdapter(payment.provider);
    if (!adapter) {
      return errorResponse('INTERNAL_ERROR', 'Payment provider not available', 500);
    }

    // Verify with provider
    const verification = await adapter.verifyPayment(payment.providerPaymentId);

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: verification.status,
        paidAt: verification.paidAt,
        providerData: verification.providerData ? JSON.parse(JSON.stringify(verification.providerData)) : undefined,
        ...(verification.status === PaymentStatus.FAILED && { failedAt: new Date() }),
      },
    });

    // Update order status based on payment
    if (verification.status === PaymentStatus.COMPLETED) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });

      // Log successful payment
      await prisma.auditLog.create({
        data: {
          action: 'PAYMENT_COMPLETED',
          entityType: 'Payment',
          entityId: payment.id,
          metadata: {
            orderId: payment.orderId,
            amount: payment.amount,
            provider: payment.provider,
          },
        },
      });
    } else if (verification.status === PaymentStatus.FAILED) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PENDING' },
      });
    }

    return successResponse({
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      paidAt: updatedPayment.paidAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
