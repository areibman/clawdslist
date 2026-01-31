import type {
  PaymentMethod,
  PaymentProvider,
  InitiatePaymentRequest,
  PaymentResult,
  PaymentStatusResult,
  WebhookEvent,
} from "./types";
import { stripeProvider } from "./stripe";
import { cryptoProvider } from "./crypto";

export * from "./types";

// Payment provider registry
const providers: Record<PaymentMethod, PaymentProvider> = {
  STRIPE: stripeProvider,
  CRYPTO: cryptoProvider,
};

// Get provider by method
export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method];
  if (!provider) {
    throw new Error(`Unknown payment method: ${method}`);
  }
  return provider;
}

// Convenience functions that route to the appropriate provider

export async function initiatePayment(
  request: InitiatePaymentRequest
): Promise<PaymentResult> {
  const provider = getPaymentProvider(request.method);
  return provider.initiatePayment(request);
}

export async function getPaymentStatus(
  method: PaymentMethod,
  paymentId: string
): Promise<PaymentStatusResult> {
  const provider = getPaymentProvider(method);
  return provider.getPaymentStatus(paymentId);
}

export async function processWebhook(
  method: PaymentMethod,
  payload: string,
  signature: string
): Promise<WebhookEvent> {
  const provider = getPaymentProvider(method);
  return provider.processWebhook(payload, signature);
}
