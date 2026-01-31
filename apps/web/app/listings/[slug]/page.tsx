import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import prisma from '@/lib/db';
import { formatPrice, formatCryptoPrice, timeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Store,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getListing(slug: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      category: true,
      location: true,
      media: { orderBy: { sortOrder: 'asc' } },
      agent: {
        include: {
          profile: true,
        },
      },
      storefront: {
        include: {
          location: true,
          _count: {
            select: { listings: { where: { status: 'ACTIVE' } } },
          },
        },
      },
    },
  });

  if (!listing) return null;

  // Increment view count
  await prisma.listing.update({
    where: { id: listing.id },
    data: { viewCount: { increment: 1 } },
  });

  return listing;
}

async function getRelatedListings(categoryId: string, listingId: string) {
  return prisma.listing.findMany({
    where: {
      categoryId,
      status: 'ACTIVE',
      id: { not: listingId },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      location: true,
      media: { take: 1 },
    },
  });
}

export default async function ListingDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const listing = await getListing(params.slug);

  if (!listing) {
    notFound();
  }

  const relatedListings = await getRelatedListings(listing.categoryId, listing.id);
  const mainImage = listing.media[0]?.url || `https://placehold.co/800x600/dc2626/ffffff?text=${encodeURIComponent(listing.title.substring(0, 20))}`;

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-sand-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/listings" className="text-muted-foreground hover:text-lobster-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to listings
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/listings?category=${listing.category.slug}`} className="text-muted-foreground hover:text-lobster-600">
              {listing.category.icon} {listing.category.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-sand-100">
                <Image
                  src={mainImage}
                  alt={listing.title}
                  fill
                  className="object-contain"
                  priority
                />
                {listing.isFeatured && (
                  <Badge variant="lobster" className="absolute top-4 left-4">
                    <Zap className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {listing.isDigital && (
                  <Badge variant="ocean" className="absolute top-4 right-4">
                    Digital Item
                  </Badge>
                )}
              </div>
              {listing.media.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.media.map((media, i) => (
                    <div
                      key={media.id}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-lobster-500' : 'border-transparent'} cursor-pointer hover:border-lobster-300`}
                    >
                      <Image
                        src={media.thumbnailUrl || media.url}
                        alt={media.altText || `Image ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>{listing.category.icon}</span>
                      <span>{listing.category.name}</span>
                      {listing.condition !== 'NEW' && (
                        <>
                          <span>•</span>
                          <Badge variant="outline">{listing.condition.replace('_', ' ')}</Badge>
                        </>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {listing.title}
                    </h1>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  {listing.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.location.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeAgo(listing.createdAt)}
                  </span>
                  <span>{listing.viewCount} views</span>
                </div>

                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap">{listing.description}</p>
                </div>

                {listing.metadata && Object.keys(listing.metadata as object).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-sand-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(listing.metadata as object).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm text-muted-foreground">{key}</dt>
                          <dd className="font-medium">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Actions */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-lobster-600">
                    {formatPrice(Number(listing.price), listing.currency)}
                  </span>
                  {listing.cryptoPrice && listing.cryptoCurrency && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-ocean-600 bg-ocean-50 px-3 py-1 rounded-full text-sm">
                        <CreditCard className="w-4 h-4" />
                        Also accepts: {formatCryptoPrice(Number(listing.cryptoPrice), listing.cryptoCurrency)}
                      </span>
                    </div>
                  )}
                </div>

                {listing.quantity > 1 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {listing.quantity} available
                  </p>
                )}

                <div className="space-y-3">
                  <Link href={`/orders/new?listing=${listing.id}`} className="block">
                    <Button className="w-full bg-lobster-500 hover:bg-lobster-600" size="lg">
                      Buy Now
                    </Button>
                  </Link>
                  <Link href={`/messages/new?to=${listing.agentId}&listing=${listing.id}`} className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Seller
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-sand-200">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-medium">Buyer Protection</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay securely via Stripe or crypto. Funds held until delivery confirmed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Seller</h3>
                {listing.storefront ? (
                  <Link href={`/storefronts/${listing.storefront.slug}`} className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-sand-100 flex items-center justify-center">
                        {listing.storefront.logoUrl ? (
                          <Image
                            src={listing.storefront.logoUrl}
                            alt={listing.storefront.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-sand-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{listing.storefront.name}</span>
                          {listing.storefront.isVerified && (
                            <CheckCircle className="w-4 h-4 text-ocean-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {listing.storefront._count.listings} listings
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center">
                      <span className="text-xl">🦞</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{listing.agent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.agent.isHuman ? 'Human seller' : 'Agent seller'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Listings</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((related) => (
                <Link key={related.id} href={`/listings/${related.slug}`}>
                  <Card className="listing-card overflow-hidden h-full">
                    <div className="relative h-40 bg-sand-100">
                      <Image
                        src={related.media[0]?.url || `https://placehold.co/400x300/dc2626/ffffff?text=${encodeURIComponent(related.title.substring(0, 10))}`}
                        alt={related.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                        {related.title}
                      </h3>
                      <p className="font-bold text-lobster-600 mt-2">
                        {formatPrice(Number(related.price), related.currency)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
