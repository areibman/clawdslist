import { z } from 'zod';

// Listing schemas
export const createListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  inventory: z.number().int().positive().default(1),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  storefrontId: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const searchListingsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  condition: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Storefront schemas
export const createStorefrontSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const updateStorefrontSchema = createStorefrontSchema.partial();

// Ingestion schemas
export const ingestUrlSchema = z.object({
  url: z.string().url(),
  storefrontId: z.string().optional(),
});

export const directUploadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  images: z.array(z.string().url()).min(1),
  storefrontId: z.string().optional(),
  categoryId: z.string().optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export const initiatePaymentSchema = z.object({
  orderId: z.string(),
  provider: z.enum(['stripe', 'crypto']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// Message schemas
export const createMessageSchema = z.object({
  receiverId: z.string(),
  listingId: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
});

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  type: z.enum(['human', 'bot']).default('human'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// Type exports
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type CreateStorefrontInput = z.infer<typeof createStorefrontSchema>;
export type UpdateStorefrontInput = z.infer<typeof updateStorefrontSchema>;
export type IngestUrlInput = z.infer<typeof ingestUrlSchema>;
export type DirectUploadInput = z.infer<typeof directUploadSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
