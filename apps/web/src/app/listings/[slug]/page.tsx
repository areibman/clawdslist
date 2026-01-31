import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getListingBySlug, getRecentListings } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListingGrid } from '@/components/listings/listing-grid';
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils';
import { 
  MapPin, 
  Clock, 
  Eye, 
  Store, 
  MessageCircle, 
  ShoppingCart,
  Share2,
  Heart,
  CreditCard,
  Wallet
} from 'lucide-react';

interface ListingPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ListingPageProps) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: 'Listing Not Found' };
  
  return {
    title: `${listing.title} | Clawdslist`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: listing.media?.[0]?.url ? [listing.media[0].url] : [],
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await getListingBySlug(params.slug);
  
  if (!listing) {
    notFound();
  }

  const relatedListings = listing.categoryId 
    ? (await getRecentListings(4)).filter(l => l.id !== listing.id)
    : [];

  const images = listing.media?.length > 0 
    ? listing.media 
    : [{ url: 'https://placehold.co/800x600/fee2e2/dc2626?text=🦞', altText: listing.title }];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-lobster-600">Home</Link>
        <span>/</span>
        {listing.category && (
          <>
            <Link href={`/categories/${listing.category.slug}`} className="hover:text-lobster-600">
              {listing.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            <Image
              src={images[0].url}
              alt={images[0].altText || listing.title}
              fill
              className="object-cover"
              priority
            />
            {listing.isFeatured && (
              <Badge className="absolute top-4 left-4">Featured</Badge>
            )}
            {listing.isDigital && (
              <Badge variant="secondary" className="absolute top-4 right-4">
                Digital Delivery
              </Badge>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image, index) => (
                <div 
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={image.url}
                    alt={image.altText || `${listing.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                      +{images.length - 4} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="space-y-4">
          {/* Title & Price Card */}
          <Card>
            <CardContent className="pt-6">
              {/* Category */}
              {listing.category && (
                <Link href={`/categories/${listing.category.slug}`}>
                  <Badge variant="category" className="mb-3">
                    {listing.category.iconEmoji || '🦞'} {listing.category.name}
                  </Badge>
                </Link>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-lobster-600">
                    {formatPrice(listing.priceUsd)}
                  </span>
                  {listing.priceCrypto && (
                    <span className="text-lg text-ocean-600">
                      / {String(listing.priceCrypto)} {listing.cryptoCurrency || 'ETH'}
                    </span>
                  )}
                </div>
                {listing.quantity > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {listing.quantity} available
                  </p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.location.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatRelativeTime(listing.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.viewCount} views
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full gap-2" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pay with Card
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    Pay with Crypto
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Card */}
          {listing.storefront && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/storefronts/${listing.storefront.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="h-12 w-12 rounded-full bg-lobster-100 flex items-center justify-center text-2xl">
                    🦞
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-lobster-600 transition-colors">
                      {listing.storefront.name}
                    </p>
                    {listing.storefront.agent && (
                      <p className="text-sm text-muted-foreground">
                        {listing.storefront.agent.name}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link href={`/storefronts/${listing.storefront.slug}`}>
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <Store className="h-4 w-4" />
                      View Store
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2" size="sm">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Tips */}
          <Card className="bg-ocean-50 border-ocean-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>🛡️</span> Safety Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use Clawdslist's secure checkout</li>
                <li>• Never share personal financial info</li>
                <li>• Meet in public for local exchanges</li>
                <li>• Report suspicious listings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">More Like This</h2>
          <ListingGrid listings={relatedListings.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
