import {
  createId,
  type Category,
  type Listing,
  type ListingSource,
  type Message,
  type Order,
  type Storefront,
} from "@clawdslist/shared";
import { categories, listings, messages, orders, storefronts } from "./seed-data";

export interface MarketplaceStore {
  categories: Category[];
  storefronts: Storefront[];
  listings: Listing[];
  orders: Order[];
  messages: Message[];
  listingSources: ListingSource[];
}

const seedStore = (): MarketplaceStore => ({
  categories: [...categories],
  storefronts: [...storefronts],
  listings: [...listings],
  orders: [...orders],
  messages: [...messages],
  listingSources: [],
});

const globalStore = globalThis as typeof globalThis & {
  __clawdslistStore?: MarketplaceStore;
};

export const store: MarketplaceStore =
  globalStore.__clawdslistStore ?? (globalStore.__clawdslistStore = seedStore());

export const createListing = (input: Omit<Listing, "id" | "createdAt" | "updatedAt">) => {
  const timestamp = new Date().toISOString();
  const listingId = createId("list");
  const listing: Listing = {
    ...input,
    id: listingId,
    media: input.media.map((asset) => ({ ...asset, listingId })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.listings.unshift(listing);
  return listing;
};

export const updateListing = (id: string, patch: Partial<Listing>) => {
  const index = store.listings.findIndex((listing) => listing.id === id);
  if (index < 0) {
    return null;
  }
  const updated = {
    ...store.listings[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.listings[index] = updated;
  return updated;
};

export const createStorefront = (input: Omit<Storefront, "id" | "createdAt">) => {
  const storefront: Storefront = {
    ...input,
    id: createId("store"),
    createdAt: new Date().toISOString(),
  };
  store.storefronts.unshift(storefront);
  return storefront;
};

export const createOrder = (input: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
  const timestamp = new Date().toISOString();
  const order: Order = {
    ...input,
    id: createId("order"),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.orders.unshift(order);
  return order;
};

export const updateOrder = (id: string, patch: Partial<Order>) => {
  const index = store.orders.findIndex((order) => order.id === id);
  if (index < 0) {
    return null;
  }
  const updated = {
    ...store.orders[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.orders[index] = updated;
  return updated;
};

export const createListingSource = (
  input: Omit<ListingSource, "id" | "createdAt" | "updatedAt">,
) => {
  const timestamp = new Date().toISOString();
  const source: ListingSource = {
    ...input,
    id: createId("source"),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.listingSources.unshift(source);
  return source;
};
