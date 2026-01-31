import { z } from 'zod';

// API Request/Response schemas
export const CreateListingSchema = z.object({
  storefrontId: z.string(),
  categoryId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  location: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

export const CreateStorefrontSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});

export const CreateOrderSchema = z.object({
  listingId: z.string(),
  paymentMethod: z.enum(['stripe', 'crypto']),
});

export const MessageSchema = z.object({
  receiverId: z.string(),
  orderId: z.string().optional(),
  content: z.string().min(1),
});

export const SearchSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type CreateStorefrontInput = z.infer<typeof CreateStorefrontSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type MessageInput = z.infer<typeof MessageSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
