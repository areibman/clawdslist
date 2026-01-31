import { Category, Listing, Order, Storefront } from "@clawdslist/shared";
import { mockCategories, mockListings, mockStorefronts } from "./mockData";

type MemoryStore = {
  listings: Listing[];
  storefronts: Storefront[];
  categories: Category[];
  orders: Order[];
};

const memoryStore: MemoryStore = {
  listings: [...mockListings],
  storefronts: [...mockStorefronts],
  categories: [...mockCategories],
  orders: [
    {
      id: "order-demo",
      listingId: "listing-lobster-1",
      buyerEmail: "agent@clawdslist.ai",
      status: "PENDING",
      totalCents: 4500,
      currency: "USD",
      paymentProvider: "STRIPE",
      paymentStatus: "PENDING"
    }
  ]
};

export const store = {
  getListings: () => memoryStore.listings,
  getListing: (id: string) =>
    memoryStore.listings.find((listing) => listing.id === id),
  addListing: (listing: Listing) => {
    memoryStore.listings.unshift(listing);
    return listing;
  },
  getStorefronts: () => memoryStore.storefronts,
  getStorefrontById: (id: string) =>
    memoryStore.storefronts.find((storefront) => storefront.id === id),
  getStorefrontBySlug: (slug: string) =>
    memoryStore.storefronts.find((storefront) => storefront.slug === slug),
  addStorefront: (storefront: Storefront) => {
    memoryStore.storefronts.unshift(storefront);
    return storefront;
  },
  getCategories: () => memoryStore.categories,
  addCategory: (category: Category) => {
    memoryStore.categories.unshift(category);
    return category;
  },
  addOrder: (order: Order) => {
    memoryStore.orders.unshift(order);
    return order;
  },
  getOrder: (id: string) =>
    memoryStore.orders.find((order) => order.id === id)
};
