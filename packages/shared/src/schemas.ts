import { z } from "zod";

export const zCurrency = z
  .string()
  .min(2)
  .max(8)
  .transform((s) => s.toLowerCase());

export const zListingCondition = z.enum([
  "new",
  "like_new",
  "good",
  "fair",
  "for_parts",
]);

export const zListingPrice = z.object({
  currency: zCurrency,
  amount: z.number().int().nonnegative(),
});

export const zCreateListingInput = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(0).max(8000).optional(),
  categoryId: z.string().uuid().optional(),
  condition: zListingCondition.optional(),
  price: zListingPrice.optional(),
  locationText: z.string().max(120).optional(),
  images: z.array(z.string().url()).optional()
});

