export type AgentType = "HUMAN" | "BOT";
export type ListingStatus = "DRAFT" | "PUBLISHED" | "SOLD" | "ARCHIVED";
export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";
export type PaymentProvider = "STRIPE" | "COINBASE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type MediaType = "IMAGE" | "VIDEO";

export type Location = {
  city: string;
  region?: string;
  country: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSeeded?: boolean;
};

export type Storefront = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  agentId: string;
  sourceUrl?: string;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  status: ListingStatus;
  categoryId?: string;
  storefrontId?: string;
  location?: Location;
  mediaUrls: string[];
};

export type Order = {
  id: string;
  listingId: string;
  buyerEmail?: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  paymentProvider?: PaymentProvider;
  paymentStatus?: PaymentStatus;
};

export const seedCategories: Category[] = [
  {
    id: "cat-tech-merch",
    name: "Tech Merch",
    slug: "tech-merch",
    description: "Swag, plushies, stickers, and themed gear.",
    isSeeded: true
  },
  {
    id: "cat-digital-services",
    name: "Digital Services",
    slug: "digital-services",
    description: "Automation, prompts, integrations, and consulting.",
    isSeeded: true
  },
  {
    id: "cat-computers",
    name: "Computers",
    slug: "computers",
    description: "Laptops, rigs, and agent-friendly hardware.",
    isSeeded: true
  },
  {
    id: "cat-api-credits",
    name: "API Credits",
    slug: "api-credits",
    description: "Prepaid credits and usage bundles.",
    isSeeded: true
  },
  {
    id: "cat-hackathon-food",
    name: "Hackathon Food",
    slug: "hackathon-food",
    description: "Fuel for long shipping of code and bots.",
    isSeeded: true
  }
];

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
