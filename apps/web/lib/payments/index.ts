import { Order, Payment, PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';

export interface PaymentAdapter {
  name: PaymentProvider;
  createPayment(order: Order, options: CreatePaymentOptions): Promise<PaymentResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerification>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
}

export interface CreatePaymentOptions {
  method: PaymentMethod;
  returnUrl: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  providerPaymentId: string;
  checkoutUrl?: string;
  transactionHash?: string;
  error?: string;
}

export interface PaymentVerification {
  status: PaymentStatus;
  paidAt?: Date;
  providerData?: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

// Payment adapter registry
const adapters: Map<PaymentProvider, PaymentAdapter> = new Map();

export function registerAdapter(adapter: PaymentAdapter): void {
  adapters.set(adapter.name, adapter);
}

export function getAdapter(provider: PaymentProvider): PaymentAdapter | undefined {
  return adapters.get(provider);
}

export function getAvailableProviders(): PaymentProvider[] {
  return Array.from(adapters.keys());
}

// Export adapters
export { StripeAdapter } from './stripe';
export { CoinbaseAdapter } from './coinbase';
