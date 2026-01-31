import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, MapPin, Store } from 'lucide-react';

interface StorefrontCardProps {
  storefront: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    isVerified: boolean;
    location?: {
      name: string;
    } | null;
    _count?: {
      listings: number;
    };
  };
}

export function StorefrontCard({ storefront }: StorefrontCardProps) {
  return (
    <Link href={`/storefronts/${storefront.slug}`}>
      <Card className="listing-card h-full bg-white border-sand-200 hover:border-lobster-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg bg-sand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {storefront.logoUrl ? (
                <Image
                  src={storefront.logoUrl}
                  alt={storefront.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <Store className="w-8 h-8 text-sand-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {storefront.name}
                </h3>
                {storefront.isVerified && (
                  <CheckCircle className="w-4 h-4 text-ocean-500 flex-shrink-0" />
                )}
              </div>
              
              {storefront.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {storefront.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                {storefront.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {storefront.location.name}
                  </span>
                )}
                {storefront._count && (
                  <Badge variant="secondary" className="text-xs">
                    {storefront._count.listings} listings
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
