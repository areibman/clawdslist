import { prisma } from '@clawdslist/db';

// Re-export prisma client
export { prisma };

// Helper function to convert Decimal to number for JSON serialization
export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(serializeDecimal) as T;
    }
    
    // Handle Decimal objects (they have a toNumber method)
    const maybeDecimal = obj as unknown as { toNumber?: () => number };
    if (maybeDecimal.toNumber && typeof maybeDecimal.toNumber === 'function') {
      return maybeDecimal.toNumber() as T;
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString() as T;
    }
    
    // Handle plain objects
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDecimal(value);
    }
    return result as T;
  }
  
  return obj;
}

// Listing queries
export async function getFeaturedListings(limit = 8) {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      isFeatured: true,
    },
    include: {
      category: true,
      location: true,
      media: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
      storefront: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return serializeDecimal(listings);
}

export async function getRecentListings(limit = 12) {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      category: true,
      location: true,
      media: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
      storefront: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return serializeDecimal(listings);
}

export async function getListingBySlug(slug: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      category: true,
      location: true,
      media: {
        orderBy: { sortOrder: 'asc' },
      },
      storefront: {
        include: {
          agent: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });
  
  // Increment view count
  if (listing) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });
  }
  
  return listing ? serializeDecimal(listing) : null;
}

export async function searchListings({
  q,
  categoryId,
  locationId,
  minPrice,
  maxPrice,
  page = 1,
  limit = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: {
  q?: string;
  categoryId?: string;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'ACTIVE' as const,
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(locationId && { locationId }),
    ...(minPrice !== undefined || maxPrice !== undefined) && {
      priceUsd: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    },
  };
  
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        category: true,
        location: true,
        media: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
        storefront: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);
  
  return {
    listings: serializeDecimal(listings),
    total,
    page,
    limit,
    hasMore: skip + listings.length < total,
  };
}

// Category queries
export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: {
          listings: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });
  
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          listings: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });
  
  return category;
}

// Location queries
export async function getLocations() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          listings: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });
  
  return locations;
}

// Storefront queries
export async function getStorefrontBySlug(slug: string) {
  const storefront = await prisma.storefront.findUnique({
    where: { slug },
    include: {
      agent: {
        select: {
          name: true,
          description: true,
        },
      },
      listings: {
        where: { status: 'ACTIVE' },
        include: {
          category: true,
          location: true,
          media: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  return storefront ? serializeDecimal(storefront) : null;
}
