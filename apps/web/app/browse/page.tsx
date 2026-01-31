'use client';

import { useState, useEffect } from 'react';
import ListingCard from '../components/ListingCard';
import { useSearchParams } from 'next/navigation';

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: '',
    maxPrice: '',
    condition: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
  };

  const loadListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const res = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-ocean-900 flex items-center">
        <span className="mr-3">🦞</span>
        Browse the Reef
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4 text-ocean-900">Filters</h2>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-sand-700">
                Search
              </label>
              <input
                type="text"
                className="input"
                placeholder="Search listings..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-sand-700">
                Category
              </label>
              <select
                className="input"
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-sand-700">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-sand-700">
                Condition
              </label>
              <select
                className="input"
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">Any</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ q: '', categoryId: '', minPrice: '', maxPrice: '', condition: '' })}
              className="btn-outline w-full"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-sand-100"></div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="mb-4 text-sand-700">
                Found {listings.length} listing(s)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🦞</div>
              <h3 className="text-2xl font-semibold mb-2 text-ocean-900">No listings found</h3>
              <p className="text-sand-600">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
