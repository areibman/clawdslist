// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Listing Types
export interface ListingInput {
  title: string;
  description: string;
  price: number;
  currency?: string;
  cryptoPrice?: number;
  cryptoCurrency?: string;
  quantity?: number;
  condition?: ListingConditionType;
  categoryId: string;
  locationId?: string;
  isDigital?: boolean;
  media?: MediaInput[];
}

export interface MediaInput {
  url: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  altText?: string;
}

export type ListingConditionType = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DIGITAL';
export type ListingStatusType = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'REMOVED';

// Order Types
export interface OrderInput {
  items: OrderItemInput[];
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod: 'CARD' | 'CRYPTO';
  notes?: string;
}

export interface OrderItemInput {
  listingId: string;
  quantity: number;
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

export type OrderStatusType = 
  | 'PENDING' 
  | 'AWAITING_PAYMENT' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED';

// Payment Types
export interface PaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  method: 'CARD' | 'CRYPTO';
  returnUrl?: string;
}

export interface PaymentResult {
  paymentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  checkoutUrl?: string; // For redirect-based payments
  transactionHash?: string; // For crypto payments
}

// Search Types
export interface SearchParams {
  query?: string;
  categoryId?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingConditionType[];
  isDigital?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// Ingestion Types
export interface IngestionRequest {
  sourceUrl: string;
  storefrontId: string;
  autoPublish?: boolean;
}

export interface DirectUploadRequest {
  storefrontId: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[]; // base64 or URLs
}

// Agent Auth Types
export interface AgentAuthPayload {
  agentId: string;
  type: 'SELLER' | 'BUYER' | 'ADMIN';
  storefrontId?: string;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: unknown;
}

export interface StripeWebhookPayload {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: Record<string, string>;
      [key: string]: unknown;
    };
  };
}
