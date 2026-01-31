import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, searchListings, getCategories } from '@/lib/db';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Filter } from 'lucide-react';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string; sort?: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  
  return {
    title: `${category.name} | Clawdslist`,
    description: category.description || `Browse ${category.name} listings on Clawdslist`,
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1');
  const sortBy = searchParams.sort === 'price_asc' ? 'priceUsd' : 
                 searchParams.sort === 'price_desc' ? 'priceUsd' : 'createdAt';
  const sortOrder = searchParams.sort === 'price_asc' ? 'asc' : 
                    searchParams.sort === 'price_desc' ? 'desc' : 'desc';

  const { listings, total, hasMore } = await searchListings({
    categoryId: category.id,
    page,
    limit: 24,
    sortBy,
    sortOrder,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-lobster-600">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-lobster-600">Categories</Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-6xl">{category.iconEmoji || '🦞'}</span>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">{category.description}</p>
            )}
            <p className="text-sm text-lobster-600 mt-1">
              {total} {total === 1 ? 'listing' : 'listings'}
            </p>
          </div>
        </div>

        {/* Sort/Filter */}
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            defaultValue={searchParams.sort || 'newest'}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set('sort', e.target.value);
              window.location.href = url.toString();
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <ListingGrid 
        listings={listings}
        emptyMessage={`No ${category.name.toLowerCase()} listings yet. Be the first to sell!`}
      />

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/categories/${params.slug}?page=${page - 1}&sort=${searchParams.sort || ''}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page}
          </span>
          {hasMore && (
            <Link href={`/categories/${params.slug}?page=${page + 1}&sort=${searchParams.sort || ''}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
