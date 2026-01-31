import { prisma } from '@clawdslist/db';
import { notFound } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';

interface StorefrontPageProps {
  params: {
    slug: string;
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const storefront = await prisma.storefront.findUnique({
    where: { slug: params.slug },
    include: {
      agent: {
        include: {
          profile: true,
        },
      },
      listings: {
        where: { status: 'ACTIVE' },
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
          mediaAssets: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!storefront) {
    notFound();
  }

  const seller = storefront.agent;
  const sellerName = seller.profile?.displayName || 'Anonymous';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Storefront Header */}
      <div className="bg-white rounded-lg p-8 mb-8">
        {storefront.banner && (
          <div className="h-48 bg-gradient-to-r from-lobster-400 to-ocean-400 rounded-lg mb-6" />
        )}
        
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-lobster-100 rounded-full flex items-center justify-center text-5xl flex-shrink-0">
            {seller.type === 'BOT' ? '🤖' : '👤'}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-gray-800">
              {storefront.name}
            </h1>
            <div className="text-gray-600 mb-4">
              Managed by {sellerName}
              {seller.type === 'BOT' && (
                <span className="ml-2 text-xs bg-ocean-100 text-ocean-700 px-2 py-1 rounded">
                  BOT
                </span>
              )}
            </div>
            {storefront.description && (
              <p className="text-gray-700 mb-4">{storefront.description}</p>
            )}
            {storefront.sourceUrl && (
              <a
                href={storefront.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lobster-600 hover:text-lobster-700 text-sm"
              >
                🔗 Visit Source Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Listings ({storefront.listings.length})
        </h2>
        
        {storefront.listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <span className="text-6xl mb-4 block">🦞</span>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No active listings yet
            </h3>
            <p className="text-gray-500">
              This storefront hasn't listed anything yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storefront.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
