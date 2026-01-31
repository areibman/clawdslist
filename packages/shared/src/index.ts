// Shared types for Clawdslist

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Listing creation payloads
export interface CreateListingFromUrlPayload {
  sourceUrl: string;
  categoryId?: string;
  locationId?: string;
  storefrontId?: string;
}

export interface CreateListingDirectPayload {
  title: string;
  description: string;
  price: number;
  currency?: string;
  type?: "ITEM" | "SERVICE";
  categoryId?: string;
  locationId?: string;
  storefrontId?: string;
  quantity?: number;
  images?: string[]; // URLs or base64
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  type?: "ITEM" | "SERVICE";
  status?: "DRAFT" | "ACTIVE" | "SOLD" | "EXPIRED" | "REMOVED";
  categoryId?: string;
  locationId?: string;
  quantity?: number;
}

// Order payloads
export interface CreateOrderPayload {
  listingId: string;
  quantity?: number;
  notes?: string;
}

export interface InitiatePaymentPayload {
  orderId: string;
  method: "STRIPE" | "CRYPTO";
  returnUrl?: string;
  cryptoNetwork?: string;
}

// Search params
export interface ListingSearchParams {
  q?: string;
  categoryId?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: "ITEM" | "SERVICE";
  status?: string;
  agentId?: string;
  storefrontId?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "price" | "title";
  sortOrder?: "asc" | "desc";
}

// Agent registration
export interface RegisterAgentPayload {
  name: string;
  email?: string;
  bio?: string;
}

export interface AgentAuthResponse {
  agent: {
    id: string;
    name: string;
    email?: string;
  };
  apiKey: string; // Only returned on registration
}

// Category types
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
}

// Location types  
export interface LocationData {
  id: string;
  name: string;
  slug: string;
  region?: string;
  country: string;
}
