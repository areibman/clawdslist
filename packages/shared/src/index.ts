// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// LISTING TYPES
// ============================================

export interface ListingSearchParams {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  locationId?: string;
  locationSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  isDigital?: boolean;
  status?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  locationId?: string;
  storefrontId?: string;
  condition?: string;
  isDigital?: boolean;
  cryptoPrice?: number;
  cryptoCurrency?: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  status?: string;
}

// ============================================
// ORDER TYPES
// ============================================

export interface CreateOrderInput {
  listingId: string;
  quantity?: number;
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  notes?: string;
}

export interface AddressInput {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface InitiatePaymentInput {
  orderId: string;
  provider: 'stripe' | 'coinbase' | 'crypto_direct';
  returnUrl?: string;
  cryptoWalletAddress?: string;
}

export interface PaymentResult {
  paymentId: string;
  provider: string;
  status: string;
  checkoutUrl?: string;
  cryptoAddress?: string;
  amount: number;
  currency: string;
}

// ============================================
// STOREFRONT TYPES
// ============================================

export interface CreateStorefrontInput {
  name: string;
  description?: string;
  website?: string;
  locationId?: string;
}

export interface IngestStorefrontInput {
  sourceUrl: string;
  storefrontId?: string;
}

// ============================================
// INGESTION TYPES
// ============================================

export interface IngestionJobPayload {
  type: 'url_crawl' | 'direct_upload' | 'bulk_import';
  sourceId: string;
  sourceUrl?: string;
  storefrontId?: string;
  listingId?: string;
  rawData?: Record<string, unknown>;
}

export interface NormalizedListingData {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  images: string[];
  category?: string;
  condition?: string;
  attributes?: Record<string, unknown>;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface SendMessageInput {
  receiverId: string;
  listingId?: string;
  content: string;
}

export interface MessageThread {
  participantId: string;
  participantName: string;
  listingId?: string;
  listingTitle?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AgentAuthPayload {
  agentId: string;
  email: string;
  name: string;
  isHuman: boolean;
  isAdmin: boolean;
}

export interface ApiKeyValidation {
  valid: boolean;
  agent?: AgentAuthPayload;
}

// ============================================
// CONSTANTS
// ============================================

export const LISTING_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as const;

export const LISTING_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED'] as const;

export const ORDER_STATUSES = [
  'PENDING',
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'FULFILLED',
  'CANCELLED',
  'REFUNDED',
] as const;

export const PAYMENT_PROVIDERS = ['STRIPE', 'COINBASE', 'CRYPTO_DIRECT'] as const;

export const PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'EXPIRED'] as const;

// ============================================
// UTILITY TYPES
// ============================================

export type ListingCondition = typeof LISTING_CONDITIONS[number];
export type ListingStatus = typeof LISTING_STATUSES[number];
export type OrderStatus = typeof ORDER_STATUSES[number];
export type PaymentProvider = typeof PAYMENT_PROVIDERS[number];
export type PaymentStatus = typeof PAYMENT_STATUSES[number];
