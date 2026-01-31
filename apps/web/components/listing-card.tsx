import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, formatCryptoPrice, timeAgo } from '@/lib/utils';
import { MapPin, Clock, Zap } from 'lucide-react';

interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    cryptoPrice?: number | null;
    cryptoCurrency?: string | null;
    isDigital: boolean;
    isFeatured: boolean;
    condition: string;
    createdAt: Date;
    category?: {
      name: string;
      slug: string;
      icon?: string | null;
    };
    location?: {
      name: string;
      slug: string;
    } | null;
    media?: {
      url: string;
      thumbnailUrl?: string | null;
      altText?: string | null;
    }[];
  };
  compact?: boolean;
}

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  const imageUrl = listing.media?.[0]?.url || `https://placehold.co/400x300/dc2626/ffffff?text=${encodeURIComponent(listing.title.substring(0, 15))}`;
  const thumbnailUrl = listing.media?.[0]?.thumbnailUrl || imageUrl;

  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="listing-card overflow-hidden h-full bg-white border-sand-200 hover:border-lobster-300">
        {/* Image */}
        <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-sand-100 overflow-hidden`}>
          <Image
            src={thumbnailUrl}
            alt={listing.media?.[0]?.altText || listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {listing.isFeatured && (
            <Badge variant="lobster" className="absolute top-2 left-2">
              <Zap className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {listing.isDigital && (
            <Badge variant="ocean" className="absolute top-2 right-2">
              Digital
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          {/* Category */}
          {listing.category && !compact && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <span>{listing.category.icon}</span>
              <span>{listing.category.name}</span>
            </div>
          )}

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {listing.title}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className={`font-bold text-lobster-600 ${compact ? 'text-base' : 'text-lg'}`}>
              {formatPrice(listing.price, listing.currency)}
            </span>
            {listing.cryptoPrice && listing.cryptoCurrency && (
              <span className="text-xs text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full">
                {formatCryptoPrice(listing.cryptoPrice, listing.cryptoCurrency)}
              </span>
            )}
          </div>

          {/* Meta */}
          {!compact && (
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              {listing.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(new Date(listing.createdAt))}
              </span>
            </div>
          )}

          {/* Condition Badge */}
          {!compact && listing.condition !== 'NEW' && (
            <Badge variant="outline" className="mt-2 text-xs">
              {listing.condition.replace('_', ' ')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
