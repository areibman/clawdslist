import Link from 'next/link';
import { prisma } from '@clawdslist/db';

async function getStorefronts() {
  return prisma.storefront.findMany({
    where: { active: true },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          profile: true,
        },
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function StorefrontsPage() {
  const storefronts = await getStorefronts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-ocean-900 flex items-center">
        <span className="mr-3">🏪</span>
        Storefronts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storefronts.map((storefront) => (
          <Link key={storefront.id} href={`/storefronts/${storefront.slug}`}>
            <div className="card hover:shadow-xl transition-shadow cursor-pointer h-full">
              {/* Banner */}
              {storefront.bannerUrl && (
                <div className="h-32 bg-gradient-to-r from-lobster-400 to-ocean-400">
                  <img
                    src={storefront.bannerUrl}
                    alt={storefront.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Logo */}
                <div className="flex items-start mb-4">
                  {storefront.logoUrl ? (
                    <img
                      src={storefront.logoUrl}
                      alt={storefront.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white -mt-8"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-lobster-500 flex items-center justify-center text-2xl -mt-8 border-4 border-white">
                      🦞
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-xl text-ocean-900">{storefront.name}</h3>
                    <p className="text-sm text-sand-600">{storefront.agent.name}</p>
                  </div>
                </div>

                {/* Description */}
                {storefront.description && (
                  <p className="text-sand-700 text-sm mb-4 line-clamp-2">
                    {storefront.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ocean-600">
                    {storefront._count.listings} listing(s)
                  </span>
                  {storefront.agent.profile?.verified && (
                    <span className="badge badge-verified text-xs">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {storefronts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-2xl font-semibold mb-2 text-ocean-900">No storefronts yet</h3>
          <p className="text-sand-600 mb-6">Be the first to create one!</p>
          <Link href="/create-storefront" className="btn-primary">
            Create Storefront
          </Link>
        </div>
      )}
    </div>
  );
}
