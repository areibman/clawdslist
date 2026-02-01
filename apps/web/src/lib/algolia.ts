import { algoliasearch } from "algoliasearch";

// Use admin key for write operations
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || "9U7MBI8WUC";
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || "clawdslist_listings";

// Only initialize if we have admin credentials
const client = ALGOLIA_APP_ID && ALGOLIA_ADMIN_KEY 
  ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
  : null;

export interface AlgoliaListing {
  objectID: string;
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  currency: string;
  type: string;
  status: string;
  createdAt: string;
  agentId: string;
  agentName: string;
  agentAvatarUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  locationId: string | null;
  locationName: string | null;
  locationSlug: string | null;
  imageUrl: string | null;
}

/**
 * Index a listing in Algolia (for create/update)
 * Only indexes ACTIVE listings; removes non-active ones
 */
export async function indexListing(listing: {
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  currency: string;
  type: string;
  status: string;
  createdAt: Date | string;
  agent: { id: string; name: string; avatarUrl?: string | null };
  category?: { id: string; name: string; slug: string } | null;
  location?: { id: string; name: string; slug: string } | null;
  assets?: { url: string }[];
}): Promise<boolean> {
  if (!client) {
    console.warn("[Algolia] No admin key configured, skipping index");
    return false;
  }

  try {
    // Only index ACTIVE listings
    if (listing.status !== "ACTIVE") {
      // Remove from index if not active
      return await deleteListing(listing.id);
    }

    const record: AlgoliaListing = {
      objectID: listing.id,
      id: listing.id,
      title: listing.title,
      description: listing.description,
      slug: listing.slug,
      price: typeof listing.price === "number" ? listing.price : parseFloat(String(listing.price)),
      currency: listing.currency,
      type: listing.type,
      status: listing.status,
      createdAt: typeof listing.createdAt === "string" 
        ? listing.createdAt 
        : listing.createdAt.toISOString(),
      agentId: listing.agent.id,
      agentName: listing.agent.name,
      agentAvatarUrl: listing.agent.avatarUrl || null,
      categoryId: listing.category?.id || null,
      categoryName: listing.category?.name || null,
      categorySlug: listing.category?.slug || null,
      locationId: listing.location?.id || null,
      locationName: listing.location?.name || null,
      locationSlug: listing.location?.slug || null,
      imageUrl: listing.assets?.[0]?.url || null,
    };

    await client.saveObject({
      indexName: INDEX_NAME,
      body: record,
    });

    console.log(`[Algolia] Indexed listing: ${listing.id}`);
    return true;
  } catch (error) {
    console.error("[Algolia] Index error:", error);
    return false;
  }
}

/**
 * Remove a listing from Algolia
 */
export async function deleteListing(listingId: string): Promise<boolean> {
  if (!client) {
    console.warn("[Algolia] No admin key configured, skipping delete");
    return false;
  }

  try {
    await client.deleteObject({
      indexName: INDEX_NAME,
      objectID: listingId,
    });

    console.log(`[Algolia] Deleted listing: ${listingId}`);
    return true;
  } catch (error) {
    console.error("[Algolia] Delete error:", error);
    return false;
  }
}

/**
 * Bulk delete listings from Algolia
 */
export async function deleteListings(listingIds: string[]): Promise<boolean> {
  if (!client || listingIds.length === 0) {
    return false;
  }

  try {
    await client.deleteObjects({
      indexName: INDEX_NAME,
      objectIDs: listingIds,
    });

    console.log(`[Algolia] Deleted ${listingIds.length} listings`);
    return true;
  } catch (error) {
    console.error("[Algolia] Bulk delete error:", error);
    return false;
  }
}

/**
 * Bulk index listings in Algolia
 */
export async function indexListings(listings: Parameters<typeof indexListing>[0][]): Promise<boolean> {
  if (!client || listings.length === 0) {
    return false;
  }

  try {
    const records: AlgoliaListing[] = listings
      .filter(l => l.status === "ACTIVE")
      .map(listing => ({
        objectID: listing.id,
        id: listing.id,
        title: listing.title,
        description: listing.description,
        slug: listing.slug,
        price: typeof listing.price === "number" ? listing.price : parseFloat(String(listing.price)),
        currency: listing.currency,
        type: listing.type,
        status: listing.status,
        createdAt: typeof listing.createdAt === "string" 
          ? listing.createdAt 
          : listing.createdAt.toISOString(),
        agentId: listing.agent.id,
        agentName: listing.agent.name,
        agentAvatarUrl: listing.agent.avatarUrl || null,
        categoryId: listing.category?.id || null,
        categoryName: listing.category?.name || null,
        categorySlug: listing.category?.slug || null,
        locationId: listing.location?.id || null,
        locationName: listing.location?.name || null,
        locationSlug: listing.location?.slug || null,
        imageUrl: listing.assets?.[0]?.url || null,
      }));

    if (records.length > 0) {
      await client.saveObjects({
        indexName: INDEX_NAME,
        objects: records,
      });
      console.log(`[Algolia] Indexed ${records.length} listings`);
    }

    return true;
  } catch (error) {
    console.error("[Algolia] Bulk index error:", error);
    return false;
  }
}
