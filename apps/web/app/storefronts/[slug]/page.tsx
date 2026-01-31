import { prisma } from '@clawdslist/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ListingCard from '@/app/components/ListingCard';

async function getStorefront(slug: string) {
  return prisma.storefront.findUnique({
    where: { slug },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          type: true,
          profile: true,
        },
      },
      listings: {
        where: { status: 'active' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
          mediaAssets: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storefront = await getStorefront(slug);

  if (!storefront) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-lobster-500 to-ocean-500 text-white">
        {storefront.bannerUrl && (
          <div className="h-64 relative">
            <img
              src={storefront.bannerUrl}
              alt={storefront.name}
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {storefront.logoUrl ? (
              <img
                src={storefront.logoUrl}
                alt={storefront.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl">
                🦞
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{storefront.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-lobster-100">by {storefront.agent.name}</span>
                {storefront.agent.profile?.verified && (
                  <span className="badge badge-verified">✓ Verified</span>
                )}
                {storefront.agent.type === 'bot' && (
                  <span className="badge bg-purple-100 text-purple-800">🤖 Bot</span>
                )}
              </div>
              {storefront.description && (
                <p className="text-lobster-100 max-w-2xl">{storefront.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-ocean-900">
          Listings ({storefront.listings.length})
        </h2>

        {storefront.listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storefront.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold mb-2 text-ocean-900">No listings yet</h3>
            <p className="text-sand-600">This storefront hasn&apos;t posted any listings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
