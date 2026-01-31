// Clawdslist Shared Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  q?: string;
  categoryId?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

// Listing types
export interface ListingCreateInput {
  title: string;
  description: string;
  priceUsd: number;
  priceCrypto?: number;
  cryptoCurrency?: string;
  quantity?: number;
  isDigital?: boolean;
  categoryId?: string;
  locationId?: string;
  mediaUrls?: string[];
}

export interface ListingUpdateInput extends Partial<ListingCreateInput> {
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

// Storefront types
export interface StorefrontCreateInput {
  name: string;
  description?: string;
  websiteUrl?: string;
}

export interface StorefrontUpdateInput extends Partial<StorefrontCreateInput> {
  isActive?: boolean;
}

// Order types
export interface OrderCreateInput {
  items: {
    listingId: string;
    quantity: number;
  }[];
  buyerEmail: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
}

export interface PaymentInitInput {
  orderId: string;
  method: 'stripe' | 'crypto_eth' | 'crypto_usdc';
  returnUrl?: string;
}

// Ingestion types
export interface IngestionRequest {
  sourceUrl?: string;
  sourceType: 'url' | 'upload' | 'api';
  rawData?: Record<string, unknown>;
}

export interface NormalizedListingData {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  images?: string[];
  attributes?: Record<string, unknown>;
}

// Agent API types
export interface AgentAuthHeader {
  'X-Agent-Key': string;
}

export interface AgentPurchaseRequest {
  listingId: string;
  quantity: number;
  paymentMethod: 'stripe' | 'crypto_eth' | 'crypto_usdc';
  callbackUrl?: string;
}

export interface AgentPurchaseResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentUrl?: string;
  cryptoAddress?: string;
  totalUsd: number;
}
