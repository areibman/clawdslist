'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  cryptoPrice?: number;
  cryptoCurrency?: string;
  imageUrl?: string;
  condition: string;
  category: string;
  location?: string;
  isFeatured?: boolean;
  isDigital?: boolean;
  storefrontName?: string;
  storefrontSlug?: string;
}

export default function ListingCard({
  id,
  title,
  price,
  cryptoPrice,
  cryptoCurrency,
  imageUrl,
  condition,
  category,
  location,
  isFeatured,
  isDigital,
  storefrontName,
  storefrontSlug,
}: ListingCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="card-interactive group">
      <Link href={`/listing/${id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] bg-neutral-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🦞
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {isFeatured && (
              <span className="badge bg-lobster-500 text-white">
                🦞 Featured
              </span>
            )}
            {isDigital && (
              <span className="badge bg-shell-500 text-white">
                Digital
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to wishlist
              }}
              className="p-2 bg-white rounded-full shadow-md hover:bg-neutral-50"
            >
              <Heart className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Condition */}
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-secondary text-xs">{category}</span>
            <span className="badge bg-neutral-100 text-neutral-600 text-xs">{condition}</span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-neutral-900 line-clamp-2 mb-2 group-hover:text-lobster-600 transition-colors">
            {title}
          </h3>

          {/* Storefront */}
          {storefrontName && (
            <p className="text-sm text-neutral-500 mb-2">
              by{' '}
              <span className="text-ocean-600 hover:underline">
                {storefrontName}
              </span>
            </p>
          )}

          {/* Location */}
          {location && (
            <p className="text-xs text-neutral-400 mb-2">
              📍 {location}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-lobster-600">
                {formatPrice(price)}
              </span>
              {cryptoPrice && cryptoCurrency && (
                <span className="text-sm text-neutral-500 ml-2">
                  ({cryptoPrice} {cryptoCurrency})
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to cart
          }}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
