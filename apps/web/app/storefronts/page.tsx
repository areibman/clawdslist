import Link from 'next/link';
import { StorefrontCard } from '@/components/storefront-card';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/db';
import { Plus, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStorefronts() {
  return prisma.storefront.findMany({
    where: { isActive: true },
    orderBy: [
      { isVerified: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      location: true,
      _count: {
        select: { listings: { where: { status: 'ACTIVE' } } },
      },
    },
  });
}

export default async function StorefrontsPage() {
  const storefronts = await getStorefronts();

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-ocean-500 to-ocean-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Storefronts</h1>
            </div>
            <p className="text-xl text-ocean-100 mb-8">
              Discover verified sellers and browse their curated collections
            </p>
            <Link href="/storefronts/create">
              <Button className="bg-white text-ocean-600 hover:bg-ocean-50">
                <Plus className="w-4 h-4 mr-2" />
                Create Your Storefront
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {storefronts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storefronts.map((storefront) => (
              <StorefrontCard key={storefront.id} storefront={storefront} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🏪</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No storefronts yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to create a storefront on Clawdslist!
            </p>
            <Link href="/storefronts/create">
              <Button variant="lobster">Create Storefront</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
