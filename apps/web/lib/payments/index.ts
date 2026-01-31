export interface PaymentProvider {
  name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerification>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}

export interface CreateCheckoutParams {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
}

export interface PaymentVerification {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  transactionId?: string;
  paidAmount?: number;
  paidCurrency?: string;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  eventType?: string;
  paymentId?: string;
  status?: string;
  error?: string;
}

// Export providers
export { StripeProvider } from './stripe';
export { CryptoProvider } from './crypto';
