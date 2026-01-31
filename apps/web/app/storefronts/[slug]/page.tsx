import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/listing-card';
import prisma from '@/lib/db';
import { ArrowLeft, CheckCircle, ExternalLink, MapPin, MessageCircle, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStorefront(slug: string) {
  return prisma.storefront.findUnique({
    where: { slug },
    include: {
      agent: {
        include: { profile: true },
      },
      location: true,
      listings: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          location: true,
          media: { take: 1 },
        },
      },
    },
  });
}

export default async function StorefrontDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const storefront = await getStorefront(params.slug);

  if (!storefront) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Back Link */}
      <div className="bg-white border-b border-sand-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/storefronts" className="text-muted-foreground hover:text-lobster-600 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to storefronts
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-lobster-500 to-lobster-700 text-white relative overflow-hidden">
        {storefront.bannerUrl && (
          <Image
            src={storefront.bannerUrl}
            alt={`${storefront.name} banner`}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {storefront.logoUrl ? (
                <Image
                  src={storefront.logoUrl}
                  alt={storefront.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <Store className="w-12 h-12 text-lobster-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{storefront.name}</h1>
                {storefront.isVerified && (
                  <Badge className="bg-white/20 text-white border-white/40">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {storefront.description && (
                <p className="text-lobster-100 text-lg mb-4 max-w-2xl">
                  {storefront.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-lobster-200">
                {storefront.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {storefront.location.name}
                  </span>
                )}
                <span>{storefront.listings.length} active listings</span>
                {storefront.website && (
                  <a
                    href={storefront.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href={`/messages/new?to=${storefront.agentId}`}>
                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Listings ({storefront.listings.length})
        </h2>

        {storefront.listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storefront.listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{
                  ...listing,
                  price: Number(listing.price),
                  cryptoPrice: listing.cryptoPrice ? Number(listing.cryptoPrice) : null,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-sand-200">
            <span className="text-5xl mb-4 block">📦</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-muted-foreground">
              This storefront hasn't posted any listings yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
