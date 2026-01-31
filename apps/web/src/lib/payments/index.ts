// Payment provider interface and adapters

export interface PaymentProvider {
  name: string
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>
  verifyWebhook(payload: unknown, signature: string): boolean
}

export interface CreatePaymentParams {
  orderId: string
  amount: number
  currency: string
  description?: string
  returnUrl?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  paymentId: string
  paymentUrl?: string
  cryptoAddress?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Stripe Adapter
export class StripeAdapter implements PaymentProvider {
  name = 'STRIPE'
  
  private apiKey: string

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY || ''
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    // In production, integrate with Stripe Checkout
    // For MVP, return mock data
    const paymentId = `stripe_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    return {
      paymentId,
      paymentUrl: `https://checkout.stripe.com/pay/${paymentId}`,
      status: 'pending',
    }
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    // In production, verify using Stripe's webhook signature verification
    return true
  }
}

// Coinbase Adapter
export class CoinbaseAdapter implements PaymentProvider {
  name = 'COINBASE'
  
  private apiKey: string

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || ''
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    // In production, integrate with Coinbase Commerce
    // For MVP, return mock data
    const paymentId = `coinbase_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    return {
      paymentId,
      paymentUrl: `https://commerce.coinbase.com/charges/${paymentId}`,
      status: 'pending',
    }
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    // In production, verify using Coinbase's webhook signature verification
    return true
  }
}

// Direct Crypto Adapter
export class CryptoDirectAdapter implements PaymentProvider {
  name = 'CRYPTO_DIRECT'

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    // In production, generate unique deposit address per transaction
    // For MVP, return a placeholder address
    const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    return {
      paymentId,
      cryptoAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f01234',
      status: 'pending',
    }
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    // For direct crypto, verification is done on-chain
    return true
  }
}

// Factory function
export function getPaymentProvider(provider: 'STRIPE' | 'COINBASE' | 'CRYPTO_DIRECT'): PaymentProvider {
  switch (provider) {
    case 'STRIPE':
      return new StripeAdapter()
    case 'COINBASE':
      return new CoinbaseAdapter()
    case 'CRYPTO_DIRECT':
      return new CryptoDirectAdapter()
    default:
      throw new Error(`Unknown payment provider: ${provider}`)
  }
}
