'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Shield, 
  Truck, 
  CreditCard, 
  Bitcoin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Check
} from 'lucide-react';

// Mock listing data
const listing = {
  id: '1',
  title: 'Vintage Apple Rainbow Logo Hoodie',
  description: `Authentic vintage Apple hoodie with the classic rainbow logo. This is a true collector's piece for any tech enthusiast.

**Condition:** Excellent - barely worn, no stains or tears
**Size:** Large (fits true to size)
**Material:** 80% cotton, 20% polyester

The hoodie features:
- Original rainbow Apple logo embroidery
- Front kangaroo pocket
- Drawstring hood
- Ribbed cuffs and hem

This is from the 1990s Apple employee collection. A rare find that pinches your nostalgia just right! 🦞`,
  price: 149.99,
  cryptoPrice: 0.062,
  cryptoCurrency: 'ETH',
  quantity: 1,
  condition: 'Like New',
  category: { name: 'Tech Merch', slug: 'tech-merch' },
  location: { name: 'San Francisco', slug: 'san-francisco' },
  isDigital: false,
  isFeatured: true,
  viewCount: 234,
  createdAt: '2024-01-15',
  storefront: {
    name: 'Lobster Tech Emporium',
    slug: 'lobster-tech-emporium',
    rating: 4.8,
    totalReviews: 42,
    isVerified: true,
  },
  images: [
    { url: 'https://picsum.photos/seed/hoodie1/800/600', alt: 'Front view' },
    { url: 'https://picsum.photos/seed/hoodie2/800/600', alt: 'Back view' },
    { url: 'https://picsum.photos/seed/hoodie3/800/600', alt: 'Detail view' },
    { url: 'https://picsum.photos/seed/hoodie4/800/600', alt: 'Logo closeup' },
  ],
};

export default function ListingPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href="/" className="hover:text-lobster-600">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-lobster-600">Browse</Link>
          <span>/</span>
          <Link href={`/browse?category=${listing.category.slug}`} className="hover:text-lobster-600">
            {listing.category.name}
          </Link>
          <span>/</span>
          <span className="text-neutral-700">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-neutral-200 mb-4">
              <Image
                src={listing.images[selectedImage].url}
                alt={listing.images[selectedImage].alt}
                fill
                className="object-cover"
              />
              
              {/* Featured Badge */}
              {listing.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-lobster-500 text-white text-sm px-3 py-1">
                    🦞 Featured
                  </span>
                </div>
              )}

              {/* Navigation Arrows */}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft className="h-6 w-6 text-neutral-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronRight className="h-6 w-6 text-neutral-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index
                        ? 'border-lobster-500'
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div>
            {/* Category & Condition */}
            <div className="flex items-center gap-2 mb-3">
              <Link href={`/browse?category=${listing.category.slug}`}>
                <span className="badge-secondary">{listing.category.name}</span>
              </Link>
              <span className="badge bg-neutral-100 text-neutral-600">{listing.condition}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">
              {listing.title}
            </h1>

            {/* Storefront */}
            <Link
              href={`/store/${listing.storefront.slug}`}
              className="flex items-center gap-3 mb-6 group"
            >
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center text-2xl">
                🦞
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 group-hover:text-lobster-600">
                    {listing.storefront.name}
                  </span>
                  {listing.storefront.isVerified && (
                    <span className="text-ocean-500" title="Verified Seller">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Star className="h-4 w-4 text-sand-500 fill-sand-500" />
                  <span>{listing.storefront.rating}</span>
                  <span>({listing.storefront.totalReviews} reviews)</span>
                </div>
              </div>
            </Link>

            {/* Price */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-lobster-600">
                  {formatPrice(listing.price)}
                </span>
                {listing.cryptoPrice && (
                  <span className="text-lg text-neutral-500">
                    or {listing.cryptoPrice} {listing.cryptoCurrency}
                  </span>
                )}
              </div>

              {/* Payment Method Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPaymentMethod('fiat')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'fiat'
                      ? 'border-lobster-500 bg-lobster-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Pay with Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'border-lobster-500 bg-lobster-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Bitcoin className="h-5 w-5" />
                  <span className="font-medium">Pay with Crypto</span>
                </button>
              </div>

              {/* Quantity */}
              {listing.quantity > 1 && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-neutral-600">Quantity:</span>
                  <div className="flex items-center border border-neutral-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 hover:bg-neutral-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x border-neutral-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                      className="px-3 py-1 hover:bg-neutral-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {listing.quantity} available
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 btn-primary py-3 text-lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                <button className="btn-ghost p-3 border border-neutral-200">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="btn-ghost p-3 border border-neutral-200">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Shield className="h-5 w-5 text-ocean-500" />
                <span>Buyer Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Truck className="h-5 w-5 text-ocean-500" />
                <span>{listing.isDigital ? 'Instant Delivery' : 'Fast Shipping'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MessageCircle className="h-5 w-5 text-ocean-500" />
                <span>Message Seller</span>
              </div>
            </div>

            {/* Location & Time */}
            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
              {listing.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Listed {listing.createdAt}</span>
              </div>
              <span>{listing.viewCount} views</span>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-lg text-neutral-900 mb-4">Description</h2>
              <div className="prose prose-neutral max-w-none">
                {listing.description.split('\n').map((line, i) => (
                  <p key={i} className="text-neutral-600 mb-2">
                    {line.startsWith('**') ? (
                      <strong>{line.replace(/\*\*/g, '')}</strong>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
