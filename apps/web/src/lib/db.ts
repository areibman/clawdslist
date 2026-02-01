/**
 * Database access layer using Supabase JS client
 * 
 * This replaces Prisma for all runtime queries to avoid connection pool exhaustion.
 * Supabase JS uses REST API (PostgREST) which doesn't have connection limits.
 * 
 * Prisma is still used for schema migrations only.
 */

import { getSupabaseAdmin } from "./supabase";

// ============================================================================
// TYPES (matching Prisma schema)
// ============================================================================

export type ListingStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "SOLD" | "EXPIRED" | "REMOVED";
export type ListingType = "ITEM" | "SERVICE";
export type OrderStatus = "AWAITING_PAYMENT" | "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "STRIPE" | "CRYPTO";
export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Agent {
  id: string;
  name: string;
  apiKey: string;
  apiKeyHash: string;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  type: ListingType;
  status: ListingStatus;
  quantity: number;
  agentId: string;
  storefrontId: string | null;
  categoryId: string | null;
  locationId: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  listingId: string;
  url: string;
  altText: string | null;
  mimeType: string | null;
  size: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  stripePaymentId: string | null;
  stripeSessionId: string | null;
  cryptoTxHash: string | null;
  cryptoWallet: string | null;
  cryptoNetwork: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  body: string;
  isRead: boolean;
  listingId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DATABASE CLIENT
// ============================================================================

function getDb() {
  return getSupabaseAdmin();
}

// ============================================================================
// AGENT QUERIES
// ============================================================================

export async function getAgentByApiKeyHash(apiKeyHash: string): Promise<Pick<Agent, "id" | "name" | "email"> | null> {
  const { data, error } = await getDb()
    .from("Agent")
    .select("id, name, email")
    .eq("apiKeyHash", apiKeyHash)
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const { data, error } = await getDb()
    .from("Agent")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function getAgentByEmail(email: string): Promise<Agent | null> {
  const { data, error } = await getDb()
    .from("Agent")
    .select("*")
    .eq("email", email)
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function createAgent(data: {
  name: string;
  apiKey: string;
  apiKeyHash: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}): Promise<Agent | null> {
  const { data: agent, error } = await getDb()
    .from("Agent")
    .insert(data)
    .select()
    .single();
  
  if (error) {
    console.error("[DB] createAgent error:", error);
    return null;
  }
  return agent;
}

export async function getAgentWithStats(id: string): Promise<(Agent & { salesCount: number }) | null> {
  const { data: agent, error } = await getDb()
    .from("Agent")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error || !agent) return null;

  // Get sales count separately
  const { count } = await getDb()
    .from("Order")
    .select("*", { count: "exact", head: true })
    .eq("sellerId", id)
    .in("status", ["PENDING", "COMPLETED"]);

  return { ...agent, salesCount: count || 0 };
}

export async function getAllAgents(): Promise<Agent[]> {
  const { data, error } = await getDb()
    .from("Agent")
    .select("*")
    .order("createdAt", { ascending: false });
  
  if (error) {
    console.error("[DB] getAllAgents error:", error);
    return [];
  }
  return data || [];
}

export async function countAgents(): Promise<number> {
  const { count, error } = await getDb()
    .from("Agent")
    .select("*", { count: "exact", head: true });
  
  if (error) return 0;
  return count || 0;
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export async function getCategories(options?: { activeOnly?: boolean }): Promise<Category[]> {
  let query = getDb().from("Category").select("*").order("sortOrder", { ascending: true });
  
  if (options?.activeOnly) {
    query = query.eq("isActive", true);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("[DB] getCategories error:", error);
    return [];
  }
  return data || [];
}

export async function getCategoriesWithListingCounts(): Promise<(Category & { listingCount: number })[]> {
  const { data: categories, error } = await getDb()
    .from("Category")
    .select("*")
    .eq("isActive", true)
    .order("sortOrder", { ascending: true });
  
  if (error || !categories) return [];

  // Get counts for each category
  const results = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await getDb()
        .from("Listing")
        .select("*", { count: "exact", head: true })
        .eq("categoryId", cat.id)
        .eq("status", "ACTIVE");
      return { ...cat, listingCount: count || 0 };
    })
  );

  return results;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await getDb()
    .from("Category")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (error || !data) return null;
  return data;
}

// ============================================================================
// LOCATION QUERIES
// ============================================================================

export async function getLocations(options?: { activeOnly?: boolean }): Promise<Location[]> {
  let query = getDb().from("Location").select("*").order("name", { ascending: true });
  
  if (options?.activeOnly) {
    query = query.eq("isActive", true);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("[DB] getLocations error:", error);
    return [];
  }
  return data || [];
}

// ============================================================================
// LISTING QUERIES
// ============================================================================

export interface ListingWithRelations extends Listing {
  agent: Pick<Agent, "id" | "name" | "avatarUrl">;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  location: Pick<Location, "id" | "name" | "slug"> | null;
  assets: Pick<MediaAsset, "url" | "altText">[];
}

export async function getListings(options?: {
  status?: ListingStatus;
  categoryId?: string;
  locationId?: string;
  type?: ListingType;
  agentId?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}): Promise<{ listings: ListingWithRelations[]; total: number }> {
  const page = options?.page || 1;
  const limit = Math.min(options?.limit || 20, 100);
  const offset = (page - 1) * limit;

  let query = getDb()
    .from("Listing")
    .select(`
      *,
      agent:Agent!inner(id, name, avatarUrl),
      category:Category(id, name, slug),
      location:Location(id, name, slug),
      assets:MediaAsset(url, altText)
    `, { count: "exact" });

  // Apply filters
  if (options?.status) query = query.eq("status", options.status);
  if (options?.categoryId) query = query.eq("categoryId", options.categoryId);
  if (options?.locationId) query = query.eq("locationId", options.locationId);
  if (options?.type) query = query.eq("type", options.type);
  if (options?.agentId) query = query.eq("agentId", options.agentId);
  if (options?.q) query = query.ilike("title", `%${options.q}%`);
  if (options?.minPrice) query = query.gte("price", options.minPrice);
  if (options?.maxPrice) query = query.lte("price", options.maxPrice);

  // Pagination and ordering
  query = query
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[DB] getListings error:", error);
    return { listings: [], total: 0 };
  }

  return { listings: (data || []) as ListingWithRelations[], total: count || 0 };
}

export async function getRecentListings(limit: number = 8): Promise<ListingWithRelations[]> {
  const { data, error } = await getDb()
    .from("Listing")
    .select(`
      *,
      agent:Agent!inner(id, name, avatarUrl),
      category:Category(id, name, slug),
      location:Location(id, name, slug),
      assets:MediaAsset(url, altText)
    `)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[DB] getRecentListings error:", error);
    return [];
  }

  return (data || []) as ListingWithRelations[];
}

export async function getListingByIdOrSlug(idOrSlug: string): Promise<(Listing & {
  agent: Agent & { salesCount: number };
  category: Category | null;
  location: Location | null;
  assets: MediaAsset[];
}) | null> {
  // Try by ID first, then by slug
  let query = getDb()
    .from("Listing")
    .select(`
      *,
      agent:Agent(*),
      category:Category(*),
      location:Location(*),
      assets:MediaAsset(*)
    `)
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .single();

  const { data, error } = await query;

  if (error || !data) return null;

  // Get agent's sales count
  const { count } = await getDb()
    .from("Order")
    .select("*", { count: "exact", head: true })
    .eq("sellerId", data.agent.id)
    .in("status", ["PENDING", "COMPLETED"]);

  return {
    ...data,
    agent: { ...data.agent, salesCount: count || 0 },
  } as Listing & {
    agent: Agent & { salesCount: number };
    category: Category | null;
    location: Location | null;
    assets: MediaAsset[];
  };
}

export async function createListing(data: {
  title: string;
  slug: string;
  description: string;
  price: number;
  currency?: string;
  type?: ListingType;
  status?: ListingStatus;
  quantity?: number;
  agentId: string;
  categoryId?: string;
  locationId?: string;
  storefrontId?: string;
}): Promise<Listing | null> {
  const { data: listing, error } = await getDb()
    .from("Listing")
    .insert({
      ...data,
      currency: data.currency || "USD",
      type: data.type || "ITEM",
      status: data.status || "ACTIVE",
      quantity: data.quantity || 1,
    })
    .select()
    .single();

  if (error) {
    console.error("[DB] createListing error:", error);
    return null;
  }

  return listing;
}

export async function updateListing(id: string, data: Partial<Listing>): Promise<Listing | null> {
  const { data: listing, error } = await getDb()
    .from("Listing")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[DB] updateListing error:", error);
    return null;
  }

  return listing;
}

export async function countListings(options?: { status?: ListingStatus }): Promise<number> {
  let query = getDb().from("Listing").select("*", { count: "exact", head: true });
  if (options?.status) query = query.eq("status", options.status);
  
  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}

export async function getAllListingSlugs(): Promise<string[]> {
  const { data, error } = await getDb()
    .from("Listing")
    .select("slug")
    .eq("status", "ACTIVE");

  if (error) return [];
  return (data || []).map((l) => l.slug);
}

// ============================================================================
// MEDIA ASSET QUERIES
// ============================================================================

export async function createMediaAssets(assets: {
  listingId: string;
  url: string;
  altText?: string;
  sortOrder?: number;
}[]): Promise<MediaAsset[]> {
  if (assets.length === 0) return [];

  const { data, error } = await getDb()
    .from("MediaAsset")
    .insert(assets)
    .select();

  if (error) {
    console.error("[DB] createMediaAssets error:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// ORDER QUERIES
// ============================================================================

export interface OrderWithRelations extends Order {
  listing: Pick<Listing, "id" | "title" | "slug">;
  buyer: Pick<Agent, "id" | "name" | "avatarUrl">;
  seller: Pick<Agent, "id" | "name" | "avatarUrl">;
  payments?: Payment[];
}

export async function getOrders(options?: {
  buyerId?: string;
  sellerId?: string;
  status?: OrderStatus | OrderStatus[];
  page?: number;
  limit?: number;
}): Promise<{ orders: OrderWithRelations[]; total: number }> {
  const page = options?.page || 1;
  const limit = Math.min(options?.limit || 20, 100);
  const offset = (page - 1) * limit;

  let query = getDb()
    .from("Order")
    .select(`
      *,
      listing:Listing!inner(id, title, slug),
      buyer:Agent!Order_buyerId_fkey(id, name, avatarUrl),
      seller:Agent!Order_sellerId_fkey(id, name, avatarUrl),
      payments:Payment(*)
    `, { count: "exact" });

  if (options?.buyerId) query = query.eq("buyerId", options.buyerId);
  if (options?.sellerId) query = query.eq("sellerId", options.sellerId);
  if (options?.status) {
    if (Array.isArray(options.status)) {
      query = query.in("status", options.status);
    } else {
      query = query.eq("status", options.status);
    }
  }

  query = query
    .order("updatedAt", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[DB] getOrders error:", error);
    return { orders: [], total: 0 };
  }

  return { orders: (data || []) as OrderWithRelations[], total: count || 0 };
}

export async function getRecentlySoldOrders(limit: number = 5): Promise<OrderWithRelations[]> {
  const { data, error } = await getDb()
    .from("Order")
    .select(`
      *,
      listing:Listing!inner(id, title, slug),
      buyer:Agent!Order_buyerId_fkey(id, name, avatarUrl),
      seller:Agent!Order_sellerId_fkey(id, name, avatarUrl)
    `)
    .in("status", ["PENDING", "COMPLETED"])
    .order("updatedAt", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[DB] getRecentlySoldOrders error:", error);
    return [];
  }

  return (data || []) as OrderWithRelations[];
}

export async function getOrderById(id: string): Promise<OrderWithRelations | null> {
  const { data, error } = await getDb()
    .from("Order")
    .select(`
      *,
      listing:Listing!inner(id, title, slug, price, currency),
      buyer:Agent!Order_buyerId_fkey(id, name, avatarUrl, email),
      seller:Agent!Order_sellerId_fkey(id, name, avatarUrl, email),
      payments:Payment(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as OrderWithRelations;
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithRelations | null> {
  const { data, error } = await getDb()
    .from("Order")
    .select(`
      *,
      listing:Listing!inner(id, title, slug, price, currency),
      buyer:Agent!Order_buyerId_fkey(id, name, avatarUrl, email),
      seller:Agent!Order_sellerId_fkey(id, name, avatarUrl, email),
      payments:Payment(*)
    `)
    .eq("orderNumber", orderNumber)
    .single();

  if (error || !data) return null;
  return data as OrderWithRelations;
}

// Generate a unique order number (like cuid but simpler)
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ord_${timestamp}${random}`;
}

export async function createOrder(data: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity?: number;
  unitPrice: number;
  totalPrice: number;
  currency?: string;
  notes?: string;
}): Promise<Order | null> {
  const { data: order, error } = await getDb()
    .from("Order")
    .insert({
      ...data,
      orderNumber: generateOrderNumber(),
      quantity: data.quantity || 1,
      currency: data.currency || "USD",
      status: "AWAITING_PAYMENT",
    })
    .select()
    .single();

  if (error) {
    console.error("[DB] createOrder error:", error);
    return null;
  }

  return order;
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
  const { data: order, error } = await getDb()
    .from("Order")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[DB] updateOrder error:", error);
    return null;
  }

  return order;
}

export async function countOrders(options?: { status?: OrderStatus | OrderStatus[] }): Promise<number> {
  let query = getDb().from("Order").select("*", { count: "exact", head: true });
  
  if (options?.status) {
    if (Array.isArray(options.status)) {
      query = query.in("status", options.status);
    } else {
      query = query.eq("status", options.status);
    }
  }
  
  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}

// ============================================================================
// PAYMENT QUERIES
// ============================================================================

export async function createPayment(data: {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  currency?: string;
  stripePaymentId?: string;
  stripeSessionId?: string;
  cryptoTxHash?: string;
  cryptoWallet?: string;
  cryptoNetwork?: string;
  metadata?: Record<string, unknown>;
}): Promise<Payment | null> {
  const { data: payment, error } = await getDb()
    .from("Payment")
    .insert({
      ...data,
      currency: data.currency || "USD",
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    console.error("[DB] createPayment error:", error);
    return null;
  }

  return payment;
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
  const { data: payment, error } = await getDb()
    .from("Payment")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[DB] updatePayment error:", error);
    return null;
  }

  return payment;
}

export async function getPaymentByStripeSessionId(sessionId: string): Promise<Payment | null> {
  const { data, error } = await getDb()
    .from("Payment")
    .select("*")
    .eq("stripeSessionId", sessionId)
    .single();

  if (error || !data) return null;
  return data;
}

// ============================================================================
// MESSAGE QUERIES  
// ============================================================================

export async function getMessages(options: {
  agentId: string;
  type?: "sent" | "received" | "all";
  page?: number;
  limit?: number;
}): Promise<{ messages: (Message & { sender: Pick<Agent, "id" | "name">; receiver: Pick<Agent, "id" | "name"> })[]; total: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  let query = getDb()
    .from("Message")
    .select(`
      *,
      sender:Agent!Message_senderId_fkey(id, name),
      receiver:Agent!Message_receiverId_fkey(id, name)
    `, { count: "exact" });

  if (options.type === "sent") {
    query = query.eq("senderId", options.agentId);
  } else if (options.type === "received") {
    query = query.eq("receiverId", options.agentId);
  } else {
    query = query.or(`senderId.eq.${options.agentId},receiverId.eq.${options.agentId}`);
  }

  query = query
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[DB] getMessages error:", error);
    return { messages: [], total: 0 };
  }

  return { messages: data || [], total: count || 0 };
}

export async function createMessage(data: {
  senderId: string;
  receiverId: string;
  subject?: string;
  body: string;
  listingId?: string;
}): Promise<Message | null> {
  const { data: message, error } = await getDb()
    .from("Message")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("[DB] createMessage error:", error);
    return null;
  }

  return message;
}

// ============================================================================
// LISTING SOURCE QUERIES
// ============================================================================

export async function createListingSource(data: {
  listingId: string;
  sourceUrl: string;
  rawPayload: Record<string, unknown>;
  provider?: string;
}): Promise<boolean> {
  const { error } = await getDb()
    .from("ListingSource")
    .insert({
      ...data,
      provider: data.provider || "firecrawl",
    });

  if (error) {
    console.error("[DB] createListingSource error:", error);
    return false;
  }

  return true;
}

// ============================================================================
// ADDITIONAL LISTING QUERIES
// ============================================================================

export async function deleteListing(id: string): Promise<boolean> {
  const { error } = await getDb()
    .from("Listing")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DB] deleteListing error:", error);
    return false;
  }

  return true;
}

export async function deleteMediaAssets(listingId: string): Promise<boolean> {
  const { error } = await getDb()
    .from("MediaAsset")
    .delete()
    .eq("listingId", listingId);

  if (error) {
    console.error("[DB] deleteMediaAssets error:", error);
    return false;
  }

  return true;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await getDb()
    .from("Listing")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getListingsByCategory(
  categorySlug: string,
  options?: { page?: number; limit?: number }
): Promise<{ listings: ListingWithRelations[]; total: number; category: Category | null }> {
  // First get category
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return { listings: [], total: 0, category: null };
  }

  const { listings, total } = await getListings({
    categoryId: category.id,
    status: "ACTIVE",
    page: options?.page,
    limit: options?.limit,
  });

  return { listings, total, category };
}

// ============================================================================
// AGENT QUERIES - ADDITIONAL
// ============================================================================

export async function getAgentWithCounts(id: string): Promise<(Agent & {
  listingCount: number;
  purchaseCount: number;
  salesCount: number;
}) | null> {
  const { data: agent, error } = await getDb()
    .from("Agent")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !agent) return null;

  // Get counts in parallel
  const [listingCountResult, purchaseCountResult, salesCountResult] = await Promise.all([
    getDb().from("Listing").select("*", { count: "exact", head: true }).eq("agentId", id),
    getDb().from("Order").select("*", { count: "exact", head: true }).eq("buyerId", id),
    getDb().from("Order").select("*", { count: "exact", head: true }).eq("sellerId", id),
  ]);

  return {
    ...agent,
    listingCount: listingCountResult.count || 0,
    purchaseCount: purchaseCountResult.count || 0,
    salesCount: salesCountResult.count || 0,
  };
}

export async function getAgentsWithListings(): Promise<(Agent & { listings: Listing[] })[]> {
  const { data, error } = await getDb()
    .from("Agent")
    .select(`
      *,
      listings:Listing(*)
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[DB] getAgentsWithListings error:", error);
    return [];
  }

  return (data || []) as (Agent & { listings: Listing[] })[];
}

// ============================================================================
// ORDER QUERIES - ADDITIONAL
// ============================================================================

export async function getOrdersForAgent(options: {
  agentId: string;
  role?: "buyer" | "seller" | "both";
  status?: OrderStatus;
  page?: number;
  limit?: number;
}): Promise<{ orders: OrderWithRelations[]; total: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  // Build the query based on role
  let query = getDb()
    .from("Order")
    .select(`
      *,
      listing:Listing!inner(id, title, slug),
      buyer:Agent!Order_buyerId_fkey(id, name, avatarUrl),
      seller:Agent!Order_sellerId_fkey(id, name, avatarUrl),
      payments:Payment(*)
    `, { count: "exact" });

  // Filter by role
  if (options.role === "buyer") {
    query = query.eq("buyerId", options.agentId);
  } else if (options.role === "seller") {
    query = query.eq("sellerId", options.agentId);
  } else {
    // Both - need to use OR
    query = query.or(`buyerId.eq.${options.agentId},sellerId.eq.${options.agentId}`);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  query = query
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[DB] getOrdersForAgent error:", error);
    return { orders: [], total: 0 };
  }

  return { orders: (data || []) as OrderWithRelations[], total: count || 0 };
}

export async function getListingWithAgent(id: string): Promise<(Listing & { agent: Agent }) | null> {
  const { data, error } = await getDb()
    .from("Listing")
    .select(`
      *,
      agent:Agent(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Listing & { agent: Agent };
}

// ============================================================================
// MESSAGE QUERIES - ADDITIONAL  
// ============================================================================

export async function getMessagesForAgent(options: {
  agentId: string;
  folder?: "inbox" | "sent";
  page?: number;
  limit?: number;
}): Promise<{ messages: (Message & { sender: Pick<Agent, "id" | "name">; receiver: Pick<Agent, "id" | "name"> })[]; total: number }> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const offset = (page - 1) * limit;

  let query = getDb()
    .from("Message")
    .select(`
      *,
      sender:Agent!Message_senderId_fkey(id, name),
      receiver:Agent!Message_receiverId_fkey(id, name)
    `, { count: "exact" });

  if (options.folder === "sent") {
    query = query.eq("senderId", options.agentId);
  } else {
    query = query.eq("receiverId", options.agentId);
  }

  query = query
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[DB] getMessagesForAgent error:", error);
    return { messages: [], total: 0 };
  }

  return { messages: data || [], total: count || 0 };
}

export async function getListingBasic(id: string): Promise<Pick<Listing, "id" | "title" | "slug"> | null> {
  const { data, error } = await getDb()
    .from("Listing")
    .select("id, title, slug")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

// ============================================================================
// AGENT QUERIES - EXTENDED FOR PAGES
// ============================================================================

export interface AgentWithListingsAndStats extends Agent {
  listings: (Listing & {
    category: Pick<Category, "name" | "slug"> | null;
    location: Pick<Location, "name"> | null;
    assets: Pick<MediaAsset, "url">[];
  })[];
  listingCount: number;
  salesCount: number;
  purchaseCount: number;
}

export async function getAgentWithListingsAndStats(id: string): Promise<AgentWithListingsAndStats | null> {
  const { data: agent, error } = await getDb()
    .from("Agent")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !agent) return null;

  // Get active listings
  const { data: listings } = await getDb()
    .from("Listing")
    .select(`
      *,
      category:Category(name, slug),
      location:Location(name),
      assets:MediaAsset(url)
    `)
    .eq("agentId", id)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false });

  // Get counts
  const [listingCountResult, salesCountResult, purchaseCountResult] = await Promise.all([
    getDb().from("Listing").select("*", { count: "exact", head: true }).eq("agentId", id).eq("status", "ACTIVE"),
    getDb().from("Order").select("*", { count: "exact", head: true }).eq("sellerId", id).in("status", ["PENDING", "COMPLETED"]),
    getDb().from("Order").select("*", { count: "exact", head: true }).eq("buyerId", id).in("status", ["PENDING", "COMPLETED"]),
  ]);

  return {
    ...agent,
    listings: (listings || []) as AgentWithListingsAndStats["listings"],
    listingCount: listingCountResult.count || 0,
    salesCount: salesCountResult.count || 0,
    purchaseCount: purchaseCountResult.count || 0,
  };
}

export interface AgentForList {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  listings: Pick<Listing, "id" | "title" | "slug" | "price" | "currency" | "type">[];
  listingCount: number;
  salesCount: number;
  purchaseCount: number;
}

export async function getAgentsForList(): Promise<AgentForList[]> {
  const { data: agents, error } = await getDb()
    .from("Agent")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error || !agents) return [];

  // Get listings and counts for each agent
  const results = await Promise.all(
    agents.map(async (agent) => {
      // Get top 5 listings
      const { data: listings } = await getDb()
        .from("Listing")
        .select("id, title, slug, price, currency, type")
        .eq("agentId", agent.id)
        .eq("status", "ACTIVE")
        .order("createdAt", { ascending: false })
        .limit(5);

      // Get counts
      const [listingCountResult, salesCountResult, purchaseCountResult] = await Promise.all([
        getDb().from("Listing").select("*", { count: "exact", head: true }).eq("agentId", agent.id).eq("status", "ACTIVE"),
        getDb().from("Order").select("*", { count: "exact", head: true }).eq("sellerId", agent.id).in("status", ["PENDING", "COMPLETED"]),
        getDb().from("Order").select("*", { count: "exact", head: true }).eq("buyerId", agent.id).in("status", ["PENDING", "COMPLETED"]),
      ]);

      return {
        id: agent.id,
        name: agent.name,
        bio: agent.bio,
        avatarUrl: agent.avatarUrl,
        isVerified: agent.isVerified,
        createdAt: agent.createdAt,
        listings: (listings || []) as Pick<Listing, "id" | "title" | "slug" | "price" | "currency" | "type">[],
        listingCount: listingCountResult.count || 0,
        salesCount: salesCountResult.count || 0,
        purchaseCount: purchaseCountResult.count || 0,
      };
    })
  );

  return results;
}

// ============================================================================
// SOLD ORDERS QUERIES
// ============================================================================

export interface SoldOrderWithRelations {
  id: string;
  orderNumber: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  listing: Pick<Listing, "id" | "title" | "slug" | "type">;
  buyer: Pick<Agent, "id" | "name" | "isVerified">;
  seller: Pick<Agent, "id" | "name" | "isVerified">;
}

export async function getSoldOrdersWithStats(options?: {
  page?: number;
  limit?: number;
}): Promise<{
  orders: SoldOrderWithRelations[];
  total: number;
  stats: { count: number; totalVolume: number };
}> {
  const page = options?.page || 1;
  const limit = Math.min(options?.limit || 25, 100);
  const offset = (page - 1) * limit;

  // Get orders
  const { data: rawOrders, count, error } = await getDb()
    .from("Order")
    .select(`
      id,
      orderNumber,
      quantity,
      totalPrice,
      currency,
      status,
      createdAt,
      updatedAt,
      listing:Listing!inner(id, title, slug, type),
      buyer:Agent!Order_buyerId_fkey(id, name, isVerified),
      seller:Agent!Order_sellerId_fkey(id, name, isVerified)
    `, { count: "exact" })
    .in("status", ["PENDING", "COMPLETED"])
    .order("updatedAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[DB] getSoldOrdersWithStats error:", error);
    return { orders: [], total: 0, stats: { count: 0, totalVolume: 0 } };
  }

  // Transform orders to handle Supabase's nested object format
  // Supabase returns single objects for foreign keys, not arrays
  const orders: SoldOrderWithRelations[] = (rawOrders || []).map((order: Record<string, unknown>) => ({
    id: order.id as string,
    orderNumber: order.orderNumber as string,
    quantity: order.quantity as number,
    totalPrice: order.totalPrice as number,
    currency: order.currency as string,
    status: order.status as OrderStatus,
    createdAt: order.createdAt as string,
    updatedAt: order.updatedAt as string,
    listing: order.listing as Pick<Listing, "id" | "title" | "slug" | "type">,
    buyer: order.buyer as Pick<Agent, "id" | "name" | "isVerified">,
    seller: order.seller as Pick<Agent, "id" | "name" | "isVerified">,
  }));

  // Get total volume (we need to sum all orders, not just the page)
  const { data: allOrders } = await getDb()
    .from("Order")
    .select("totalPrice")
    .in("status", ["PENDING", "COMPLETED"]);

  const totalVolume = (allOrders || []).reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0
  );

  return {
    orders,
    total: count || 0,
    stats: {
      count: count || 0,
      totalVolume,
    },
  };
}

// ============================================================================
// SITEMAP QUERIES
// ============================================================================

export async function getCategorySlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const { data, error } = await getDb()
    .from("Category")
    .select("slug, updatedAt");

  if (error) return [];
  return data || [];
}

export async function getListingSlugsForSitemap(): Promise<{ slug: string; id: string; updatedAt: string }[]> {
  const { data, error } = await getDb()
    .from("Listing")
    .select("slug, id, updatedAt")
    .eq("status", "ACTIVE")
    .order("updatedAt", { ascending: false })
    .limit(1000);

  if (error) return [];
  return data || [];
}
