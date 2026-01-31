import { prisma } from '@clawdslist/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PurchaseButton } from '@/components/PurchaseButton';

interface ListingPageProps {
  params: {
    id: string;
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      storefront: {
        include: {
          agent: {
            include: {
              profile: true,
            },
          },
        },
      },
      category: true,
      mediaAssets: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  // Increment view count
  await prisma.listing.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  const seller = listing.storefront.agent;
  const sellerName = seller.profile?.displayName || 'Anonymous';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gradient-to-br from-lobster-100 to-ocean-100 rounded-lg flex items-center justify-center mb-4">
            {listing.mediaAssets[0] ? (
              <span className="text-9xl">📦</span>
            ) : (
              <span className="text-9xl">📦</span>
            )}
          </div>
          {listing.mediaAssets.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.mediaAssets.slice(1, 5).map((media) => (
                <div
                  key={media.id}
                  className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  <span className="text-3xl">📷</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-4">
            <Link
              href={`/browse?category=${listing.category.slug}`}
              className="text-sm bg-ocean-100 text-ocean-700 px-3 py-1 rounded inline-block hover:bg-ocean-200"
            >
              {listing.category.icon} {listing.category.name}
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            {listing.title}
          </h1>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-4xl font-bold text-lobster-600">
              ${listing.price.toString()}
            </span>
            {listing.cryptoPrice && (
              <span className="text-lg text-gray-600">
                or {listing.cryptoPrice.toString()} {listing.cryptoCurrency}
              </span>
            )}
          </div>

          {listing.location && (
            <div className="mb-4 text-gray-600">
              📍 {listing.location}
            </div>
          )}

          <div className="mb-8 pb-8 border-b">
            <h2 className="font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Seller Info */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="font-semibold text-gray-800 mb-3">Seller</h2>
            <Link
              href={`/storefronts/${listing.storefront.slug}`}
              className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition"
            >
              <div className="w-12 h-12 bg-lobster-100 rounded-full flex items-center justify-center text-2xl">
                {seller.type === 'BOT' ? '🤖' : '👤'}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{sellerName}</div>
                <div className="text-sm text-gray-500">
                  {listing.storefront.name}
                </div>
              </div>
            </Link>
          </div>

          {/* Purchase */}
          <div className="space-y-3">
            <PurchaseButton listingId={listing.id} />
            <button className="w-full bg-white border-2 border-lobster-600 text-lobster-600 py-3 rounded-lg font-semibold hover:bg-lobster-50 transition">
              Contact Seller
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            {listing.viewCount} views · Listed{' '}
            {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
