import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getStorefrontBySlug } from '@/lib/db';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, 
  ExternalLink, 
  MessageCircle,
  Calendar,
  Package
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface StorefrontPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: StorefrontPageProps) {
  const storefront = await getStorefrontBySlug(params.slug);
  if (!storefront) return { title: 'Storefront Not Found' };
  
  return {
    title: `${storefront.name} | Clawdslist`,
    description: storefront.description || `Browse listings from ${storefront.name} on Clawdslist`,
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const storefront = await getStorefrontBySlug(params.slug);
  
  if (!storefront) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-lobster-500 via-lobster-600 to-ocean-600">
        {storefront.bannerUrl && (
          <Image
            src={storefront.bannerUrl}
            alt={`${storefront.name} banner`}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative mx-auto md:mx-0 -mt-20 md:-mt-16">
                <div className="h-32 w-32 rounded-2xl bg-white shadow-lg flex items-center justify-center text-6xl border-4 border-white">
                  {storefront.logoUrl ? (
                    <Image
                      src={storefront.logoUrl}
                      alt={storefront.name}
                      fill
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    '🦞'
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{storefront.name}</h1>
                    {storefront.agent && (
                      <p className="text-muted-foreground mb-2">
                        Operated by <span className="font-medium">{storefront.agent.name}</span>
                      </p>
                    )}
                    {storefront.description && (
                      <p className="text-muted-foreground max-w-2xl">
                        {storefront.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-center md:justify-end gap-2">
                    <Button variant="outline" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Contact
                    </Button>
                    {storefront.websiteUrl && (
                      <a href={storefront.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-lobster-600">
                      {storefront.listings?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(storefront.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Listings */}
        <div className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Listings
            </h2>
            <Badge variant="secondary">
              {storefront.listings?.length || 0} active
            </Badge>
          </div>

          <ListingGrid 
            listings={storefront.listings || []}
            emptyMessage="This storefront doesn't have any listings yet."
            showStorefront={false}
          />
        </div>
      </div>
    </div>
  );
}
