import { Order, PaymentProvider, PaymentStatus } from '@prisma/client';
import type { PaymentAdapter, CreatePaymentOptions, PaymentResult, PaymentVerification, RefundResult } from './index';

// Coinbase Commerce API client
// In production, use the official @coinbase/coinbase-sdk or coinbase-commerce-node package

const COINBASE_API_URL = 'https://api.commerce.coinbase.com';

async function coinbaseRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY || '',
      'X-CC-Version': '2018-03-22',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Coinbase API error');
  }

  return response.json();
}

export const CoinbaseAdapter: PaymentAdapter = {
  name: PaymentProvider.COINBASE,

  async createPayment(order: Order, options: CreatePaymentOptions): Promise<PaymentResult> {
    try {
      const charge = await coinbaseRequest('/charges', {
        method: 'POST',
        body: JSON.stringify({
          name: `Order ${order.orderNumber}`,
          description: `Clawdslist order #${order.orderNumber}`,
          pricing_type: 'fixed_price',
          local_price: {
            amount: Number(order.total).toFixed(2),
            currency: order.currency,
          },
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            ...options.metadata,
          },
          redirect_url: options.returnUrl,
          cancel_url: options.cancelUrl || options.returnUrl,
        }),
      });

      return {
        success: true,
        providerPaymentId: charge.data.id,
        checkoutUrl: charge.data.hosted_url,
      };
    } catch (error) {
      console.error('Coinbase payment creation error:', error);
      return {
        success: false,
        providerPaymentId: '',
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  },

  async verifyPayment(chargeId: string): Promise<PaymentVerification> {
    try {
      const charge = await coinbaseRequest(`/charges/${chargeId}`);
      
      const timeline = charge.data.timeline || [];
      const latestStatus = timeline[timeline.length - 1]?.status;

      let status: PaymentStatus;
      let paidAt: Date | undefined;

      switch (latestStatus) {
        case 'COMPLETED':
          status = PaymentStatus.COMPLETED;
          paidAt = new Date(timeline[timeline.length - 1].time);
          break;
        case 'PENDING':
        case 'NEW':
          status = PaymentStatus.PENDING;
          break;
        case 'UNRESOLVED':
          status = PaymentStatus.PROCESSING;
          break;
        case 'EXPIRED':
        case 'CANCELED':
          status = PaymentStatus.CANCELLED;
          break;
        default:
          status = PaymentStatus.FAILED;
      }

      return {
        status,
        paidAt,
        providerData: {
          chargeId: charge.data.id,
          code: charge.data.code,
          timeline,
          payments: charge.data.payments,
        },
      };
    } catch (error) {
      console.error('Coinbase payment verification error:', error);
      return {
        status: PaymentStatus.FAILED,
      };
    }
  },

  async refundPayment(_chargeId: string, _amount?: number): Promise<RefundResult> {
    // Coinbase Commerce doesn't support automatic refunds
    // Refunds must be handled manually by the merchant
    return {
      success: false,
      error: 'Crypto refunds must be processed manually. Please contact the seller.',
    };
  },
};
