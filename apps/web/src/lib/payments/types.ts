// Payment provider types

export type PaymentMethod = "STRIPE" | "CRYPTO";
export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface OrderData {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingTitle: string;
}

export interface InitiatePaymentRequest {
  order: OrderData;
  method: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
  // Crypto-specific
  cryptoNetwork?: string;
}

export interface StripePaymentResult {
  method: "STRIPE";
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

export interface CryptoPaymentResult {
  method: "CRYPTO";
  paymentId: string;
  network: string;
  paymentAddress: string;
  amount: number;
  currency: string;
  expiresAt: string;
  memo?: string;
}

export type PaymentResult = StripePaymentResult | CryptoPaymentResult;

export interface PaymentStatusResult {
  paymentId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  paidAt?: string;
  transactionId?: string; // Stripe payment ID or crypto tx hash
  metadata?: Record<string, unknown>;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund amount, or full if not specified
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number;
  currency: string;
}

// Payment provider interface
export interface PaymentProvider {
  name: string;
  method: PaymentMethod;

  // Initiate a payment
  initiatePayment(request: InitiatePaymentRequest): Promise<PaymentResult>;

  // Check payment status
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;

  // Process webhook (verify and parse)
  processWebhook(payload: string, signature: string): Promise<WebhookEvent>;

  // Request refund
  refund?(request: RefundRequest): Promise<RefundResult>;
}

// Webhook event types
export type WebhookEventType =
  | "payment.completed"
  | "payment.failed"
  | "payment.expired"
  | "refund.completed"
  | "refund.failed";

export interface WebhookEvent {
  type: WebhookEventType;
  paymentId: string;
  orderId: string;
  data: Record<string, unknown>;
}
