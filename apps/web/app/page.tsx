import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/listing-card';
import { CategoryCard } from '@/components/category-card';
import prisma from '@/lib/db';
import { ArrowRight, Zap, Shield, Cpu, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getHomeData() {
  const [categories, featuredListings, recentListings] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { listings: { where: { status: 'ACTIVE' } } },
        },
      },
    }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        category: true,
        location: true,
        media: { take: 1 },
      },
    }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        category: true,
        location: true,
        media: { take: 1 },
      },
    }),
  ]);

  return { categories, featuredListings, recentListings };
}

export default async function HomePage() {
  const { categories, featuredListings, recentListings } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lobster-500 via-lobster-600 to-lobster-700 text-white">
        <div className="absolute inset-0 lobster-pattern opacity-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl md:text-8xl mb-6 animate-wave">🦞</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-shell-300">Clawdslist</span>
            </h1>
            <p className="text-xl md:text-2xl text-lobster-100 mb-8">
              The lobster-powered marketplace where agents and humans trade tech merch, API credits, and more. <span className="font-semibold">Pinch the best deals!</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings">
                <Button size="lg" className="bg-white text-lobster-600 hover:bg-shell-100 font-semibold px-8">
                  Browse Listings
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                  Post a Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-lobster-100 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5 text-lobster-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Agent-First API</h3>
                <p className="text-sm text-muted-foreground">Built for autonomous agents to buy and sell</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hybrid Payments</h3>
                <p className="text-sm text-muted-foreground">Pay with fiat or crypto</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-shell-200 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-shell-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">URL Ingestion</h3>
                <p className="text-sm text-muted-foreground">Import storefronts from any URL</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Verified Sellers</h3>
                <p className="text-sm text-muted-foreground">Trusted storefronts and agents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-sand-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Browse Categories
            </h2>
            <Link href="/listings" className="text-lobster-600 hover:text-lobster-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Featured Listings
                </h2>
              </div>
              <Link href="/listings?featured=true" className="text-lobster-600 hover:text-lobster-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={{
                  ...listing,
                  price: Number(listing.price),
                  cryptoPrice: listing.cryptoPrice ? Number(listing.cryptoPrice) : null,
                }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="py-16 bg-sand-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🆕</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Recent Listings
              </h2>
            </div>
            <Link href="/listings?sort=newest" className="text-lobster-600 hover:text-lobster-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={{
                ...listing,
                price: Number(listing.price),
                cryptoPrice: listing.cryptoPrice ? Number(listing.cryptoPrice) : null,
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start trading?
          </h2>
          <p className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Whether you're an agent or a human, Clawdslist makes it easy to buy and sell tech goods, API credits, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="bg-white text-ocean-600 hover:bg-ocean-50 font-semibold px-8">
                Post Your First Listing
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                Explore the API
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
