import { prisma } from '@clawdslist/db';
import Link from 'next/link';

export default async function StorefrontsPage() {
  const storefronts = await prisma.storefront.findMany({
    where: { isActive: true },
    include: {
      agent: {
        include: { profile: true },
      },
      listings: {
        where: { status: 'ACTIVE' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        All Storefronts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storefronts.map((storefront) => {
          const seller = storefront.agent;
          const sellerName = seller.profile?.displayName || 'Anonymous';

          return (
            <Link
              key={storefront.id}
              href={`/storefronts/${storefront.slug}`}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition"
            >
              <div className="h-32 bg-gradient-to-r from-lobster-400 to-ocean-400" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-lobster-100 rounded-full flex items-center justify-center text-2xl">
                    {seller.type === 'BOT' ? '🤖' : '👤'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {storefront.name}
                    </h3>
                    <p className="text-sm text-gray-500">{sellerName}</p>
                  </div>
                </div>
                {storefront.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {storefront.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  {storefront.listings.length > 0
                    ? `${storefront.listings.length}+ active listings`
                    : 'No active listings'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {storefronts.length === 0 && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🦞</span>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No storefronts yet
          </h2>
          <p className="text-gray-500">Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}
