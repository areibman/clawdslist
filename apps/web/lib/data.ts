import { prisma } from "@clawdslist/db";
import {
  Category,
  Listing,
  ListingStatus,
  Order,
  OrderStatus,
  Storefront,
  slugify
} from "@clawdslist/shared";
import { store } from "./store";

export type ListingSummary = Listing & {
  storefrontName?: string;
  categoryName?: string;
};

const safeDb = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  label: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn(`[db-fallback] ${label}`, error);
    return fallback;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  return safeDb(
    async () =>
      prisma.category.findMany().then((categories) =>
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
          isSeeded: category.isSeeded
        }))
      ),
    store.getCategories(),
    "getCategories"
  );
};

export const createCategory = async (input: {
  name: string;
  description?: string;
}): Promise<Category> => {
  const slug = slugify(input.name);
  const category: Category = {
    id: `cat-${Date.now()}`,
    name: input.name,
    slug,
    description: input.description,
    isSeeded: false
  };

  return safeDb(
    async () => {
      const created = await prisma.category.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          isSeeded: false
        }
      });
      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description ?? undefined,
        isSeeded: created.isSeeded
      };
    },
    store.addCategory(category),
    "createCategory"
  );
};

export const getListings = async (): Promise<ListingSummary[]> => {
  const fallback = store.getListings().map((listing) => ({
    ...listing,
    storefrontName: listing.storefrontId
      ? store.getStorefrontById(listing.storefrontId)?.name
      : undefined,
    categoryName: store
      .getCategories()
      .find((category) => category.id === listing.categoryId)?.name
  }));

  return safeDb(
    async () =>
      prisma.listing
        .findMany({
          include: {
            storefront: true,
            category: true,
            location: true,
            media: true
          },
          orderBy: {
            createdAt: "desc"
          }
        })
        .then((listings) =>
          listings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            priceCents: listing.priceCents,
            currency: listing.currency,
            status: listing.status as ListingStatus,
            categoryId: listing.categoryId ?? undefined,
            storefrontId: listing.storefrontId ?? undefined,
            location: listing.location
              ? {
                  city: listing.location.city,
                  region: listing.location.region ?? undefined,
                  country: listing.location.country
                }
              : undefined,
            mediaUrls: listing.media.map((media) => media.url),
            storefrontName: listing.storefront?.name,
            categoryName: listing.category?.name
          }))
        ),
    fallback,
    "getListings"
  );
};

export const getListingDetail = async (
  id: string
): Promise<{
  listing: Listing | null;
  storefront?: Storefront;
  category?: Category;
}> => {
  const fallbackListing = store.getListing(id);
  const fallback = {
    listing: fallbackListing ?? null,
    storefront: fallbackListing?.storefrontId
      ? store
          .getStorefronts()
          .find((storefront) => storefront.id === fallbackListing.storefrontId)
      : undefined,
    category: fallbackListing?.categoryId
      ? store
          .getCategories()
          .find((category) => category.id === fallbackListing.categoryId)
      : undefined
  };

  return safeDb(
    async () => {
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          storefront: true,
          category: true,
          location: true,
          media: true
        }
      });

      if (!listing) {
        return { listing: null };
      }

      return {
        listing: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          priceCents: listing.priceCents,
          currency: listing.currency,
          status: listing.status as ListingStatus,
          categoryId: listing.categoryId ?? undefined,
          storefrontId: listing.storefrontId ?? undefined,
          location: listing.location
            ? {
                city: listing.location.city,
                region: listing.location.region ?? undefined,
                country: listing.location.country
              }
            : undefined,
          mediaUrls: listing.media.map((media) => media.url)
        },
        storefront: listing.storefront
          ? {
              id: listing.storefront.id,
              name: listing.storefront.name,
              slug: listing.storefront.slug,
              description: listing.storefront.description ?? undefined,
              agentId: listing.storefront.agentId,
              sourceUrl: listing.storefront.sourceUrl ?? undefined
            }
          : undefined,
        category: listing.category
          ? {
              id: listing.category.id,
              name: listing.category.name,
              slug: listing.category.slug,
              description: listing.category.description ?? undefined,
              isSeeded: listing.category.isSeeded
            }
          : undefined
      };
    },
    fallback,
    "getListingDetail"
  );
};

export const getStorefronts = async (): Promise<Storefront[]> => {
  return safeDb(
    async () =>
      prisma.storefront.findMany().then((storefronts) =>
        storefronts.map((storefront) => ({
          id: storefront.id,
          name: storefront.name,
          slug: storefront.slug,
          description: storefront.description ?? undefined,
          agentId: storefront.agentId,
          sourceUrl: storefront.sourceUrl ?? undefined
        }))
      ),
    store.getStorefronts(),
    "getStorefronts"
  );
};

export const getStorefrontBySlug = async (
  slug: string
): Promise<Storefront | null> => {
  const fallback = store.getStorefrontBySlug(slug) ?? null;
  return safeDb(
    async () => {
      const storefront = await prisma.storefront.findUnique({ where: { slug } });
      if (!storefront) {
        return null;
      }
      return {
        id: storefront.id,
        name: storefront.name,
        slug: storefront.slug,
        description: storefront.description ?? undefined,
        agentId: storefront.agentId,
        sourceUrl: storefront.sourceUrl ?? undefined
      };
    },
    fallback,
    "getStorefrontBySlug"
  );
};

export const createStorefrontFromUrl = async (
  name: string,
  sourceUrl: string,
  agentId: string
): Promise<Storefront> => {
  const slug = slugify(name);
  const storefront: Storefront = {
    id: `sf-${Date.now()}`,
    name,
    slug,
    description: "New storefront awaiting ingestion.",
    agentId,
    sourceUrl
  };

  return safeDb(
    async () => {
      const created = await prisma.storefront.create({
        data: {
          name,
          slug,
          description: storefront.description,
          sourceUrl,
          agentId
        }
      });
      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description ?? undefined,
        agentId: created.agentId,
        sourceUrl: created.sourceUrl ?? undefined
      };
    },
    store.addStorefront(storefront),
    "createStorefrontFromUrl"
  );
};

export const createStorefront = async (input: {
  name: string;
  description?: string;
  agentId: string;
}): Promise<Storefront> => {
  const slug = slugify(input.name);
  const storefront: Storefront = {
    id: `sf-${Date.now()}`,
    name: input.name,
    slug,
    description: input.description,
    agentId: input.agentId
  };

  return safeDb(
    async () => {
      const created = await prisma.storefront.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          agentId: input.agentId
        }
      });
      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description ?? undefined,
        agentId: created.agentId,
        sourceUrl: created.sourceUrl ?? undefined
      };
    },
    store.addStorefront(storefront),
    "createStorefront"
  );
};

export const createListing = async (input: {
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  categoryId?: string;
  storefrontId?: string;
  mediaUrls?: string[];
}): Promise<Listing> => {
  const listing: Listing = {
    id: `listing-${Date.now()}`,
    title: input.title,
    description: input.description,
    priceCents: input.priceCents,
    currency: input.currency,
    status: "PUBLISHED",
    categoryId: input.categoryId,
    storefrontId: input.storefrontId,
    mediaUrls: input.mediaUrls ?? []
  };

  return safeDb(
    async () => {
      const created = await prisma.listing.create({
        data: {
          title: input.title,
          description: input.description,
          priceCents: input.priceCents,
          currency: input.currency,
          status: "PUBLISHED",
          categoryId: input.categoryId,
          storefrontId: input.storefrontId
        }
      });
      if (input.mediaUrls?.length) {
        await prisma.mediaAsset.createMany({
          data: input.mediaUrls.map((url, index) => ({
            listingId: created.id,
            url,
            position: index
          }))
        });
      }
      return {
        ...listing,
        id: created.id
      };
    },
    store.addListing(listing),
    "createListing"
  );
};

export const createOrder = async (input: {
  listingId: string;
  buyerEmail?: string;
  totalCents: number;
  currency: string;
}): Promise<Order> => {
  const order: Order = {
    id: `order-${Date.now()}`,
    listingId: input.listingId,
    buyerEmail: input.buyerEmail,
    status: "PENDING",
    totalCents: input.totalCents,
    currency: input.currency
  };

  return safeDb(
    async () => {
      const created = await prisma.order.create({
        data: {
          listingId: input.listingId,
          buyerEmail: input.buyerEmail,
          status: "PENDING",
          totalCents: input.totalCents,
          currency: input.currency
        }
      });
      return {
        ...order,
        id: created.id
      };
    },
    store.addOrder(order),
    "createOrder"
  );
};

export const getOrder = async (id: string): Promise<Order | null> => {
  const fallback = store.getOrder(id) ?? null;
  return safeDb(
    async () => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { payment: true }
      });
      if (!order) {
        return null;
      }
      return {
        id: order.id,
        listingId: order.listingId,
        buyerEmail: order.buyerEmail ?? undefined,
        status: order.status as OrderStatus,
        totalCents: order.totalCents,
        currency: order.currency,
        paymentProvider: order.payment?.provider,
        paymentStatus: order.payment?.status
      };
    },
    fallback,
    "getOrder"
  );
};
