/**
 * Payment Provider Interface
 * Allows for multiple payment methods (Stripe, Crypto, etc.)
 */

export interface PaymentInitResult {
  success: boolean;
  paymentId: string;
  paymentUrl?: string;
  cryptoAddress?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PaymentStatusResult {
  success: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  initPayment(orderId: string, amount: number, currency: string, metadata?: Record<string, unknown>): Promise<PaymentInitResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;
  refundPayment(paymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string }>;
  handleWebhook(payload: unknown, signature: string): Promise<{ event: string; orderId?: string; status?: string }>;
}

// Export payment adapters
export { StripeAdapter } from './stripe';
export { CryptoAdapter } from './crypto';
