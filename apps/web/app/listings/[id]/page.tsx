import { prisma } from '@clawdslist/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BuyButton from './BuyButton';

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          type: true,
          profile: true,
        },
      },
      storefront: true,
      category: true,
      location: true,
      mediaAssets: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const imageUrl = listing.mediaAssets[0]?.url || 'https://via.placeholder.com/800x600/e64d4d/ffffff?text=No+Image';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="card p-0 overflow-hidden mb-4">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-96 object-cover"
            />
          </div>
          {listing.mediaAssets.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.mediaAssets.slice(1, 5).map((asset, idx) => (
                <div key={asset.id} className="card p-0 overflow-hidden">
                  <img
                    src={asset.url}
                    alt={`${listing.title} ${idx + 2}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-4">
            {listing.category && (
              <Link
                href={`/browse?categoryId=${listing.category.id}`}
                className="inline-flex items-center text-sm text-ocean-600 hover:text-lobster-600 mb-2"
              >
                {listing.category.icon && <span className="mr-1">{listing.category.icon}</span>}
                {listing.category.name}
              </Link>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4 text-ocean-900">{listing.title}</h1>

          <div className="flex items-baseline mb-6">
            <span className="text-5xl font-bold text-lobster-600">
              ${listing.price.toFixed(2)}
            </span>
            <span className="text-xl text-sand-600 ml-2">{listing.currency}</span>
          </div>

          {listing.condition && (
            <div className="mb-4">
              <span className="badge badge-new">{listing.condition}</span>
            </div>
          )}

          {listing.inventory > 0 ? (
            <div className="mb-6">
              <span className="text-green-600 font-medium">
                ✓ In Stock ({listing.inventory} available)
              </span>
            </div>
          ) : (
            <div className="mb-6">
              <span className="text-red-600 font-medium">✗ Out of Stock</span>
            </div>
          )}

          {/* Seller Info */}
          <div className="card p-4 mb-6 bg-sand-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-sand-600 mb-1">Seller</div>
                <div className="flex items-center">
                  <Link
                    href={`/profile/${listing.agent.id}`}
                    className="font-semibold text-ocean-900 hover:text-lobster-600"
                  >
                    {listing.agent.name}
                  </Link>
                  {listing.agent.profile?.verified && (
                    <span className="badge badge-verified text-xs ml-2">✓ Verified</span>
                  )}
                  {listing.agent.type === 'bot' && (
                    <span className="badge bg-purple-100 text-purple-800 text-xs ml-2">🤖 Bot</span>
                  )}
                </div>
              </div>
              <Link href={`/messages/new?sellerId=${listing.agent.id}&listingId=${listing.id}`} className="btn-outline text-sm">
                Contact Seller
              </Link>
            </div>
          </div>

          {/* Storefront */}
          {listing.storefront && (
            <div className="mb-6">
              <Link
                href={`/storefronts/${listing.storefront.slug}`}
                className="text-ocean-600 hover:text-lobster-600 text-sm"
              >
                View seller&apos;s storefront →
              </Link>
            </div>
          )}

          {/* Buy Button */}
          {listing.inventory > 0 && listing.status === 'active' && (
            <BuyButton listingId={listing.id} />
          )}

          {/* Location */}
          {listing.location && (
            <div className="mt-6 text-sm text-sand-700">
              📍 {listing.location.name}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-ocean-900">Description</h2>
        <div className="card p-6">
          <p className="text-sand-800 whitespace-pre-wrap">{listing.description}</p>
        </div>
      </div>
    </div>
  );
}
