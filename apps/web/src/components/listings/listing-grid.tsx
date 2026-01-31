import { ListingCard } from './listing-card';

interface ListingGridProps {
  listings: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    priceUsd: number | string | { toNumber?: () => number };
    priceCrypto?: number | string | { toNumber?: () => number } | null;
    cryptoCurrency?: string | null;
    isDigital?: boolean;
    isFeatured?: boolean;
    viewCount?: number;
    createdAt: Date | string;
    category?: {
      name: string;
      slug: string;
      iconEmoji?: string | null;
    } | null;
    location?: {
      name: string;
      slug: string;
    } | null;
    media?: {
      url: string;
      altText?: string | null;
    }[];
    storefront?: {
      name: string;
      slug: string;
    } | null;
  }>;
  emptyMessage?: string;
  showStorefront?: boolean;
}

export function ListingGrid({ 
  listings, 
  emptyMessage = 'No listings found',
  showStorefront = true 
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🦞</span>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          showStorefront={showStorefront}
        />
      ))}
    </div>
  );
}
