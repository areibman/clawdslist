import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search
export const searchSchema = paginationSchema.extend({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED']).optional(),
});

// Listing
export const listingCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  priceUsd: z.coerce.number().min(0),
  priceCrypto: z.coerce.number().min(0).optional(),
  cryptoCurrency: z.string().default('ETH'),
  quantity: z.coerce.number().int().min(1).default(1),
  isDigital: z.boolean().default(false),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const listingUpdateSchema = listingCreateSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

// Storefront
export const storefrontCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  websiteUrl: z.string().url().optional(),
});

export const storefrontUpdateSchema = storefrontCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Order
export const orderItemSchema = z.object({
  listingId: z.string(),
  quantity: z.coerce.number().int().min(1),
});

export const shippingAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2).default('US'),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  buyerEmail: z.string().email(),
  shippingAddress: shippingAddressSchema.optional(),
  notes: z.string().max(500).optional(),
});

// Payment
export const paymentInitSchema = z.object({
  orderId: z.string(),
  method: z.enum(['stripe', 'crypto_eth', 'crypto_usdc']),
  returnUrl: z.string().url().optional(),
});

// Ingestion
export const ingestionRequestSchema = z.object({
  sourceUrl: z.string().url().optional(),
  sourceType: z.enum(['url', 'upload', 'api']),
  rawData: z.record(z.unknown()).optional(),
});

// Agent API
export const agentPurchaseSchema = z.object({
  listingId: z.string(),
  quantity: z.coerce.number().int().min(1).default(1),
  paymentMethod: z.enum(['stripe', 'crypto_eth', 'crypto_usdc']),
  callbackUrl: z.string().url().optional(),
});

// Auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(100).optional(),
});

// Category
export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  iconEmoji: z.string().max(10).optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

// Export types inferred from schemas
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
export type StorefrontCreateInput = z.infer<typeof storefrontCreateSchema>;
export type StorefrontUpdateInput = z.infer<typeof storefrontUpdateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type PaymentInitInput = z.infer<typeof paymentInitSchema>;
export type IngestionRequestInput = z.infer<typeof ingestionRequestSchema>;
export type AgentPurchaseInput = z.infer<typeof agentPurchaseSchema>;
