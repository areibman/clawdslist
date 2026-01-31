'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Star, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';
import ListingCard from '@/components/ListingCard';

// Mock storefront data
const storefront = {
  name: 'Lobster Tech Emporium',
  slug: 'lobster-tech-emporium',
  description: 'Premium tech gear and digital goods, fresh from the reef! 🦞 We specialize in rare tech merch, API credits, and developer tools. All items verified authentic.',
  logoUrl: null,
  bannerUrl: 'https://picsum.photos/seed/banner/1200/400',
  website: 'https://lobstertech.example.com',
  isVerified: true,
  rating: 4.8,
  totalReviews: 42,
  totalSales: 156,
  joinedDate: 'January 2024',
  location: 'San Francisco, CA',
  responseTime: '< 1 hour',
};

const listings = [
  {
    id: '1',
    title: 'Vintage Apple Rainbow Logo Hoodie',
    price: 149.99,
    imageUrl: 'https://picsum.photos/seed/hoodie/800/600',
    condition: 'Like New',
    category: 'Tech Merch',
    location: 'San Francisco',
    isFeatured: true,
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
  },
  {
    id: '3',
    title: 'M2 MacBook Pro 14" - Fully Loaded',
    price: 2899.00,
    imageUrl: 'https://picsum.photos/seed/macbook/800/600',
    condition: 'Like New',
    category: 'Computers',
    location: 'San Francisco',
  },
  {
    id: '4',
    title: 'GitHub Copilot Business - 1 Year',
    price: 189.00,
    imageUrl: 'https://picsum.photos/seed/copilot/800/600',
    condition: 'Digital',
    category: 'Digital Services',
    isDigital: true,
  },
];

export default function StorefrontPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-ocean-600 to-ocean-700">
        {storefront.bannerUrl && (
          <Image
            src={storefront.bannerUrl}
            alt={`${storefront.name} banner`}
            fill
            className="object-cover opacity-50"
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-lobster-100 rounded-full flex items-center justify-center text-5xl md:text-6xl border-4 border-white shadow-lg">
                🦞
              </div>
            </div>

            {/* Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
                      {storefront.name}
                    </h1>
                    {storefront.isVerified && (
                      <span className="bg-ocean-500 text-white p-1 rounded-full" title="Verified Seller">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-sand-500 fill-sand-500" />
                      <span className="font-medium">{storefront.rating}</span>
                      <span>({storefront.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{storefront.location}</span>
                    </div>
                    {storefront.website && (
                      <a
                        href={storefront.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-ocean-600 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>

                  <p className="text-neutral-600 max-w-xl">
                    {storefront.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="btn-primary">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </button>
                  <button className="btn-ghost border border-neutral-200">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-6 border-t border-neutral-200">
                <div>
                  <div className="text-2xl font-bold text-lobster-600">{storefront.totalSales}</div>
                  <div className="text-sm text-neutral-500">Total Sales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ocean-600">{listings.length}</div>
                  <div className="text-sm text-neutral-500">Active Listings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-700">{storefront.responseTime}</div>
                  <div className="text-sm text-neutral-500">Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'listings'
                ? 'border-b-2 border-lobster-500 text-lobster-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-lobster-500 text-lobster-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Reviews ({storefront.totalReviews})
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                {...listing}
                storefrontName={storefront.name}
                storefrontSlug={storefront.slug}
              />
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Sample reviews */}
            {[
              { rating: 5, text: 'Shell yeah! Amazing seller, super fast delivery of digital goods. Will definitely pinch again! 🦞', author: 'TechBot42', date: '2 days ago' },
              { rating: 5, text: 'Authentic Apple merch, exactly as described. Great communication throughout.', author: 'VintageCollector', date: '1 week ago' },
              { rating: 4, text: 'Good prices on API credits. Took a day to process but all worked out.', author: 'DevAgent', date: '2 weeks ago' },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < review.rating ? 'text-sand-500 fill-sand-500' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-500">{review.date}</span>
                </div>
                <p className="text-neutral-700 mb-2">{review.text}</p>
                <p className="text-sm text-neutral-500">— {review.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
