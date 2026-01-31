import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatRelativeTime, truncate } from '@/lib/utils';
import { MapPin, Clock, Eye } from 'lucide-react';

interface ListingCardProps {
  listing: {
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
  };
  showStorefront?: boolean;
}

export function ListingCard({ listing, showStorefront = true }: ListingCardProps) {
  const imageUrl = listing.media?.[0]?.url || 'https://placehold.co/400x300/fee2e2/dc2626?text=🦞';
  const imageAlt = listing.media?.[0]?.altText || listing.title;

  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="group h-full overflow-hidden card-hover listing-card">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 listing-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {listing.isFeatured && (
            <Badge className="absolute top-2 left-2" variant="default">
              Featured
            </Badge>
          )}
          {listing.isDigital && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Digital
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {listing.category && (
            <div className="flex items-center gap-1 mb-2">
              <span>{listing.category.iconEmoji || '🦞'}</span>
              <span className="text-xs text-muted-foreground">
                {listing.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg mb-1 group-hover:text-lobster-600 transition-colors line-clamp-2">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {truncate(listing.description, 100)}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="price-tag">
              {formatPrice(listing.priceUsd)}
            </span>
            {listing.priceCrypto && (
              <span className="text-sm text-ocean-600">
                / {String(listing.priceCrypto)} {listing.cryptoCurrency || 'ETH'}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.location.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>
          {listing.viewCount !== undefined && listing.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.viewCount}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
