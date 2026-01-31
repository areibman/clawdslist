import Link from 'next/link';
import { ListingCard } from '@/components/listing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/db';
import { Filter, SlidersHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchParams {
  category?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  featured?: string;
  q?: string;
  page?: string;
}

async function getListings(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const where: any = {
    status: 'ACTIVE',
  };

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.location) {
    where.location = { slug: searchParams.location };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      where.price.gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseFloat(searchParams.maxPrice);
    }
  }

  if (searchParams.condition) {
    where.condition = searchParams.condition;
  }

  if (searchParams.featured === 'true') {
    where.isFeatured = true;
  }

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  switch (searchParams.sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'popular':
      orderBy = { viewCount: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [listings, total, categories, locations] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: true,
        location: true,
        media: { take: 1 },
      },
    }),
    prisma.listing.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { listings: { where: { status: 'ACTIVE' } } },
        },
      },
    }),
    prisma.location.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    listings,
    total,
    categories,
    locations,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { listings, total, categories, locations, page, totalPages } = await getListings(searchParams);
  const activeCategory = categories.find(c => c.slug === searchParams.category);

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeCategory ? (
              <>
                <span className="mr-2">{activeCategory.icon}</span>
                {activeCategory.name}
              </>
            ) : searchParams.q ? (
              <>Search results for "{searchParams.q}"</>
            ) : (
              <>Browse Listings</>
            )}
          </h1>
          <p className="text-muted-foreground">
            {total} listing{total !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-sand-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-lobster-500" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  <Link
                    href="/listings"
                    className={`block text-sm ${!searchParams.category ? 'text-lobster-600 font-medium' : 'text-gray-600 hover:text-lobster-600'}`}
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/listings?category=${category.slug}`}
                      className={`flex items-center justify-between text-sm ${searchParams.category === category.slug ? 'text-lobster-600 font-medium' : 'text-gray-600 hover:text-lobster-600'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {category._count.listings}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
                <div className="space-y-2">
                  <Link
                    href={`/listings${searchParams.category ? `?category=${searchParams.category}` : ''}`}
                    className={`block text-sm ${!searchParams.location ? 'text-lobster-600 font-medium' : 'text-gray-600 hover:text-lobster-600'}`}
                  >
                    All Locations
                  </Link>
                  {locations.map((location) => (
                    <Link
                      key={location.id}
                      href={`/listings?${searchParams.category ? `category=${searchParams.category}&` : ''}location=${location.slug}`}
                      className={`block text-sm ${searchParams.location === location.slug ? 'text-lobster-600 font-medium' : 'text-gray-600 hover:text-lobster-600'}`}
                    >
                      {location.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Condition</h3>
                <div className="space-y-2">
                  {['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'].map((condition) => (
                    <Link
                      key={condition}
                      href={`/listings?${searchParams.category ? `category=${searchParams.category}&` : ''}condition=${condition}`}
                      className={`block text-sm ${searchParams.condition === condition ? 'text-lobster-600 font-medium' : 'text-gray-600 hover:text-lobster-600'}`}
                    >
                      {condition.replace('_', ' ')}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchParams.category || searchParams.location || searchParams.condition || searchParams.q) && (
                <Link href="/listings">
                  <Button variant="outline" className="w-full" size="sm">
                    Clear All Filters
                  </Button>
                </Link>
              )}
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {searchParams.category && (
                  <Badge variant="secondary" className="gap-1">
                    {activeCategory?.icon} {activeCategory?.name}
                  </Badge>
                )}
                {searchParams.q && (
                  <Badge variant="secondary">
                    Search: {searchParams.q}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  className="text-sm border border-sand-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-lobster-500"
                  defaultValue={searchParams.sort || 'newest'}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('sort', e.target.value);
                    window.location.href = url.toString();
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Listings */}
            {listings.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={{
                        ...listing,
                        price: Number(listing.price),
                        cryptoPrice: listing.cryptoPrice ? Number(listing.cryptoPrice) : null,
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={`/listings?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}
                      >
                        <Button variant="outline">Previous</Button>
                      </Link>
                    )}
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/listings?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}
                      >
                        <Button variant="outline">Next</Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🦞</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Link href="/listings">
                  <Button variant="lobster">Clear Filters</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
