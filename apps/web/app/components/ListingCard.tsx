import Link from 'next/link';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    condition?: string;
    mediaAssets?: Array<{ url: string }>;
    category?: { name: string; icon?: string };
    agent: {
      name: string;
      profile?: {
        verified?: boolean;
      };
    };
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.mediaAssets?.[0]?.url || 'https://via.placeholder.com/400x300/e64d4d/ffffff?text=No+Image';

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer h-full">
        {/* Image */}
        <div className="relative h-48 bg-sand-100">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          {listing.condition && (
            <span className="absolute top-2 right-2 badge badge-new">
              {listing.condition}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {listing.category && (
            <div className="text-xs text-ocean-600 mb-1 flex items-center">
              {listing.category.icon && <span className="mr-1">{listing.category.icon}</span>}
              {listing.category.name}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-ocean-900">
            {listing.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-lobster-600">
              ${listing.price.toFixed(2)}
            </span>
            <span className="text-sm text-sand-600">{listing.currency}</span>
          </div>

          {/* Seller */}
          <div className="mt-3 pt-3 border-t border-sand-200 flex items-center justify-between">
            <span className="text-sm text-sand-700">{listing.agent.name}</span>
            {listing.agent.profile?.verified && (
              <span className="badge badge-verified text-xs">✓ Verified</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
