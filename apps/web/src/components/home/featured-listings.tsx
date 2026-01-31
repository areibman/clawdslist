import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListingGrid } from '@/components/listings/listing-grid';
import { ChevronRight } from 'lucide-react';

interface FeaturedListingsProps {
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
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
            <p className="text-muted-foreground">
              Hand-picked deals from our top sellers
            </p>
          </div>
          <Link href="/search?featured=true">
            <Button variant="outline" className="gap-2">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ListingGrid 
          listings={listings} 
          emptyMessage="No featured listings yet. Check back soon!"
        />
      </div>
    </section>
  );
}
