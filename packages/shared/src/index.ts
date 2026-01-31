import { z } from "zod";

export const MoneySchema = z.object({
  amountCents: z.number().int().nonnegative(),
  currency: z.string().min(3).max(8).default("USD"),
});

export const ListingCreateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().min(3).max(8).default("USD"),
  categoryId: z.string().optional(),
  locationText: z.string().max(120).optional(),
  mediaUrls: z.array(z.string().url()).max(8).optional(),
});

export const ListingSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(), // category slug
  take: z.coerce.number().int().min(1).max(50).default(24),
  cursor: z.string().optional(),
});

export const IngestUrlSchema = z.object({
  url: z.string().url(),
});

export const CreateOrderSchema = z.object({
  listingId: z.string(),
  buyerEmail: z.string().email(),
  paymentMethod: z.enum(["stripe", "crypto"]).default("stripe"),
});

export type ListingCreateInput = z.infer<typeof ListingCreateSchema>;
export type ListingSearchInput = z.infer<typeof ListingSearchSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

