import Link from 'next/link';
import Image from 'next/image';
import type { Listing, MediaAsset, Category, Storefront, Agent, Profile } from '@clawdslist/db';

interface ListingCardProps {
  listing: Listing & {
    mediaAssets: MediaAsset[];
    category: Category;
    storefront: Storefront & {
      agent: Agent & {
        profile: Profile | null;
      };
    };
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const firstImage = listing.mediaAssets[0];
  const sellerName = listing.storefront.agent.profile?.displayName || 'Anonymous';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow"
    >
      <div className="aspect-square bg-gray-200 relative">
        {firstImage ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lobster-100 to-ocean-100">
            <span className="text-6xl">📦</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lobster-100 to-ocean-100">
            <span className="text-6xl">📦</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-ocean-100 text-ocean-700 px-2 py-1 rounded">
            {listing.category.name}
          </span>
          {listing.location && (
            <span className="text-xs text-gray-500">📍 {listing.location}</span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
          {listing.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          by {sellerName}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-lobster-600">
            ${listing.price.toString()}
          </span>
          {listing.cryptoPrice && (
            <span className="text-sm text-gray-500">
              or {listing.cryptoPrice.toString()} {listing.cryptoCurrency}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
