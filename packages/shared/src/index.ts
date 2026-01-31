export type UUID = string;

export type AgentType = "HUMAN" | "BOT";
export type ListingStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD";
export type IngestionStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
export type PaymentProvider = "STRIPE" | "COINBASE";
export type PaymentStatus = "PENDING" | "REQUIRES_ACTION" | "SUCCEEDED" | "FAILED";
export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELED";
export type MediaType = "IMAGE" | "VIDEO";
export type CurrencyCode = "USD" | "USDC" | "ETH";

export interface AgentProfile {
  id: UUID;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Agent {
  id: UUID;
  type: AgentType;
  name: string;
  email?: string;
  apiKeyLastFour?: string;
  profile?: AgentProfile;
  createdAt: string;
}

export interface Location {
  id: UUID;
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface Storefront {
  id: UUID;
  slug: string;
  name: string;
  headline?: string;
  description?: string;
  agentId: UUID;
  heroImageUrl?: string;
  location?: Location;
  createdAt: string;
}

export interface MediaAsset {
  id: UUID;
  listingId: UUID;
  type: MediaType;
  url: string;
  alt?: string;
  createdAt: string;
}

export interface Listing {
  id: UUID;
  storefrontId: UUID;
  title: string;
  description: string;
  priceFiatCents?: number;
  priceCrypto?: number;
  currency: CurrencyCode;
  status: ListingStatus;
  categoryId?: UUID;
  location?: Location;
  media: MediaAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingSource {
  id: UUID;
  storefrontId: UUID;
  sourceUrl: string;
  status: IngestionStatus;
  rawPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: UUID;
  listingId: UUID;
  buyerName?: string;
  buyerEmail?: string;
  buyerAgentId?: UUID;
  status: OrderStatus;
  totalFiatCents?: number;
  totalCrypto?: number;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: UUID;
  orderId: UUID;
  provider: PaymentProvider;
  providerReference?: string;
  status: PaymentStatus;
  amountFiatCents?: number;
  amountCrypto?: number;
  currency: CurrencyCode;
  createdAt: string;
}

export interface Message {
  id: UUID;
  listingId: UUID;
  fromName: string;
  fromEmail?: string;
  body: string;
  createdAt: string;
}

export interface CreateListingInput {
  storefrontId: UUID;
  title: string;
  description: string;
  priceFiatCents?: number;
  priceCrypto?: number;
  currency: CurrencyCode;
  categoryId?: UUID;
  media?: Array<Pick<MediaAsset, "url" | "type" | "alt">>;
}

export interface CreateOrderInput {
  listingId: UUID;
  buyerName?: string;
  buyerEmail?: string;
  buyerAgentId?: UUID;
  paymentProvider: PaymentProvider;
}

export interface IngestionRequest {
  storefrontId: UUID;
  sourceUrl: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export const createId = (prefix: string): UUID => {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
