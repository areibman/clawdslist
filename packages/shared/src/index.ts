// Shared types and utilities for Clawdslist

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams extends PaginationParams {
  q?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  location?: string
}

export interface ListingCreateInput {
  title: string
  description: string
  price: number
  currency?: string
  cryptoPrice?: number
  cryptoCurrency?: string
  categoryId?: string
  quantity?: number
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  locationCity?: string
  locationState?: string
  locationCountry?: string
  tags?: string[]
}

export interface ListingUpdateInput extends Partial<ListingCreateInput> {
  status?: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SOLD' | 'ARCHIVED'
}

export interface OrderCreateInput {
  listingId: string
  quantity?: number
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  notes?: string
}

export interface PaymentInitInput {
  orderId: string
  provider: 'STRIPE' | 'COINBASE' | 'CRYPTO_DIRECT'
  returnUrl?: string
}

export interface StorefrontCreateInput {
  name: string
  description?: string
  sourceUrl?: string
}

export interface IngestionJobInput {
  sourceUrl: string
  storefrontId?: string
  userId: string
}

// Agent API types
export interface AgentAuthHeader {
  'X-API-Key': string
}

export interface AgentPurchaseRequest {
  listingId: string
  quantity?: number
  paymentProvider: 'STRIPE' | 'COINBASE' | 'CRYPTO_DIRECT'
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface AgentPurchaseResponse {
  orderId: string
  paymentUrl?: string
  cryptoAddress?: string
  status: string
  total: number
  currency: string
}

// Utility functions
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatCryptoPrice(amount: number, currency: string = 'ETH'): string {
  return `${amount.toFixed(6)} ${currency}`
}

export const LISTING_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
] as const

export const PAYMENT_PROVIDERS = [
  { value: 'STRIPE', label: 'Credit Card (Stripe)' },
  { value: 'COINBASE', label: 'Crypto (Coinbase)' },
  { value: 'CRYPTO_DIRECT', label: 'Direct Crypto Transfer' },
] as const
