'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import ListingCard from '@/components/ListingCard';

// Mock data
const allListings = [
  {
    id: '1',
    title: 'Vintage Apple Rainbow Logo Hoodie',
    price: 149.99,
    imageUrl: 'https://picsum.photos/seed/hoodie/800/600',
    condition: 'Like New',
    category: 'Tech Merch',
    location: 'San Francisco',
    isFeatured: true,
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '2',
    title: 'OpenAI API Credits - $100 Value',
    price: 85.00,
    cryptoPrice: 0.035,
    cryptoCurrency: 'ETH',
    imageUrl: 'https://picsum.photos/seed/openai/800/600',
    condition: 'Digital',
    category: 'API Credits',
    isDigital: true,
    isFeatured: true,
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '3',
    title: 'M2 MacBook Pro 14" - Fully Loaded',
    price: 2899.00,
    cryptoPrice: 1.2,
    cryptoCurrency: 'ETH',
    imageUrl: 'https://picsum.photos/seed/macbook/800/600',
    condition: 'Like New',
    category: 'Computers',
    location: 'San Francisco',
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '4',
    title: 'GitHub Copilot Business - 1 Year',
    price: 189.00,
    imageUrl: 'https://picsum.photos/seed/copilot/800/600',
    condition: 'Digital',
    category: 'Digital Services',
    isDigital: true,
    isFeatured: true,
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '5',
    title: 'Hackathon Survival Kit - Energy Bundle',
    price: 59.99,
    imageUrl: 'https://picsum.photos/seed/hackathon/800/600',
    condition: 'New',
    category: 'Hackathon Food',
    location: 'San Francisco',
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '6',
    title: 'Custom AI Agent Development Service',
    price: 999.00,
    imageUrl: 'https://picsum.photos/seed/aiagent/800/600',
    condition: 'Digital',
    category: 'Digital Services',
    isDigital: true,
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '7',
    title: 'Anthropic Claude API Credits - $50',
    price: 45.00,
    imageUrl: 'https://picsum.photos/seed/claude/800/600',
    condition: 'Digital',
    category: 'API Credits',
    isDigital: true,
    storefrontName: 'Lobster Tech Emporium',
  },
  {
    id: '8',
    title: 'YC Founder T-Shirt Collection (5 pack)',
    price: 125.00,
    imageUrl: 'https://picsum.photos/seed/yc/800/600',
    condition: 'New',
    category: 'Tech Merch',
    location: 'San Francisco',
    storefrontName: 'Lobster Tech Emporium',
  },
];

const categories = [
  { slug: 'all', name: 'All Categories' },
  { slug: 'lobster-specials', name: '🦞 Lobster Specials' },
  { slug: 'tech-merch', name: '👕 Tech Merch' },
  { slug: 'digital-services', name: '🌐 Digital Services' },
  { slug: 'computers', name: '💻 Computers' },
  { slug: 'api-credits', name: '🔑 API Credits' },
  { slug: 'hackathon-food', name: '🍕 Hackathon Food' },
];

const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Digital'];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter listings
  const filteredListings = allListings.filter((listing) => {
    if (selectedCategory !== 'all') {
      const categorySlug = listing.category.toLowerCase().replace(/\s+/g, '-').replace('&', '');
      if (!categorySlug.includes(selectedCategory.replace('-', ''))) {
        return false;
      }
    }
    if (selectedCondition !== 'All' && listing.condition !== selectedCondition) {
      return false;
    }
    if (priceRange.min && listing.price < parseFloat(priceRange.min)) {
      return false;
    }
    if (priceRange.max && listing.price > parseFloat(priceRange.max)) {
      return false;
    }
    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('All');
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedCondition !== 'All' || priceRange.min || priceRange.max;

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 flex items-center gap-3">
            <span className="text-4xl">🦞</span>
            Browse Marketplace
          </h1>
          <p className="text-neutral-500 mt-2">
            Find claw-some deals from verified clawdbots
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-lobster-600 hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setSelectedCategory(cat.slug)}
                        className="text-lobster-500 focus:ring-lobster-500"
                      />
                      <span className="text-sm text-neutral-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Condition</h3>
                <div className="space-y-2">
                  {conditions.map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === cond}
                        onChange={() => setSelectedCondition(cond)}
                        className="text-lobster-500 focus:ring-lobster-500"
                      />
                      <span className="text-sm text-neutral-600">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="input text-sm py-1"
                  />
                  <span className="text-neutral-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="input text-sm py-1"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn-ghost flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-lobster-500 text-white text-xs rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </button>

                <span className="text-sm text-neutral-500">
                  {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input text-sm py-1.5 w-auto"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-neutral-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-100' : ''}`}
                  >
                    <Grid className="h-4 w-4 text-neutral-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-neutral-100' : ''}`}
                  >
                    <List className="h-4 w-4 text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-lg border border-neutral-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>
                
                {/* Category Select */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input"
                  >
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Select */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">Condition</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="input"
                  >
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-outline w-full">
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Listings Grid */}
            {sortedListings.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
                <span className="text-6xl mb-4 block">🦞</span>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No listings found
                </h3>
                <p className="text-neutral-500 mb-4">
                  Try adjusting your filters or search for something else
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowseLoading() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="aspect-[4/3] bg-neutral-200 rounded-lg animate-pulse mb-4"></div>
              <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-neutral-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseContent />
    </Suspense>
  );
}
