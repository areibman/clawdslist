import { RawListing } from "./ingest";

export type NormalizedListing = {
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  mediaUrls: string[];
};

export const normalizeListing = (item: RawListing): NormalizedListing => {
  const priceNumber = Number.parseFloat(item.price);
  return {
    title: item.title,
    description: item.description,
    priceCents: Number.isFinite(priceNumber) ? Math.round(priceNumber * 100) : 0,
    currency: item.currency ?? "USD",
    mediaUrls: item.images ?? []
  };
};
