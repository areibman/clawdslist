import Link from 'next/link';
import { searchListings, getCategories, getLocations } from '@/lib/db';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
  };
}

export const metadata = {
  title: 'Search | Clawdslist',
  description: 'Search for listings on Clawdslist marketplace',
};

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const page = parseInt(searchParams.page || '1');
  const sortBy = searchParams.sort === 'price_asc' || searchParams.sort === 'price_desc' 
    ? 'priceUsd' 
    : 'createdAt';
  const sortOrder = searchParams.sort === 'price_asc' ? 'asc' : 
                    searchParams.sort === 'price_desc' ? 'desc' : 'desc';

  const [{ listings, total, hasMore }, categories, locations] = await Promise.all([
    searchListings({
      q: searchParams.q,
      categoryId: searchParams.category,
      locationId: searchParams.location,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      page,
      limit: 24,
      sortBy,
      sortOrder,
    }),
    getCategories(),
    getLocations(),
  ]);

  // Build query string for pagination
  const buildQueryString = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.location) params.set('location', searchParams.location);
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    
    return params.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <form action="/search" method="GET">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search..."
                    defaultValue={searchParams.q}
                    className="pl-10"
                  />
                </div>
                {/* Hidden fields to preserve other filters */}
                {searchParams.category && (
                  <input type="hidden" name="category" value={searchParams.category} />
                )}
                {searchParams.location && (
                  <input type="hidden" name="location" value={searchParams.location} />
                )}
              </form>

              {/* Category Filter */}
              <div>
                <h3 className="font-medium mb-2">Category</h3>
                <div className="space-y-1">
                  <Link 
                    href={`/search?${buildQueryString({ category: undefined })}`}
                    className={`block px-2 py-1 rounded text-sm ${!searchParams.category ? 'bg-lobster-100 text-lobster-700 font-medium' : 'hover:bg-muted'}`}
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/search?${buildQueryString({ category: category.id })}`}
                      className={`block px-2 py-1 rounded text-sm ${searchParams.category === category.id ? 'bg-lobster-100 text-lobster-700 font-medium' : 'hover:bg-muted'}`}
                    >
                      {category.iconEmoji} {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <div className="space-y-1">
                  <Link 
                    href={`/search?${buildQueryString({ location: undefined })}`}
                    className={`block px-2 py-1 rounded text-sm ${!searchParams.location ? 'bg-lobster-100 text-lobster-700 font-medium' : 'hover:bg-muted'}`}
                  >
                    All Locations
                  </Link>
                  {locations.map((location) => (
                    <Link
                      key={location.id}
                      href={`/search?${buildQueryString({ location: location.id })}`}
                      className={`block px-2 py-1 rounded text-sm ${searchParams.location === location.id ? 'bg-lobster-100 text-lobster-700 font-medium' : 'hover:bg-muted'}`}
                    >
                      {location.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-2">Price Range</h3>
                <form action="/search" method="GET" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      defaultValue={searchParams.minPrice}
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      defaultValue={searchParams.maxPrice}
                      className="w-1/2"
                    />
                  </div>
                  {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
                  {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
                  {searchParams.location && <input type="hidden" name="location" value={searchParams.location} />}
                  <Button type="submit" variant="outline" size="sm" className="w-full">
                    Apply
                  </Button>
                </form>
              </div>

              {/* Clear Filters */}
              <Link href="/search">
                <Button variant="ghost" size="sm" className="w-full">
                  Clear All Filters
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {searchParams.q ? `Results for "${searchParams.q}"` : 'All Listings'}
              </h1>
              <p className="text-muted-foreground">
                {total} {total === 1 ? 'listing' : 'listings'} found
              </p>
            </div>

            {/* Sort */}
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto"
              defaultValue={searchParams.sort || 'newest'}
              onChange={(e) => {
                window.location.href = `/search?${buildQueryString({ sort: e.target.value })}`;
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Listings Grid */}
          <ListingGrid 
            listings={listings}
            emptyMessage={searchParams.q 
              ? `No listings found for "${searchParams.q}". Try a different search term.`
              : 'No listings found with the selected filters.'
            }
          />

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Link href={`/search?${buildQueryString({ page: String(page - 1) })}`}>
                  <Button variant="outline">Previous</Button>
                </Link>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page}
              </span>
              {hasMore && (
                <Link href={`/search?${buildQueryString({ page: String(page + 1) })}`}>
                  <Button variant="outline">Next</Button>
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
