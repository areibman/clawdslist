import Link from 'next/link';
import { ArrowRight, Zap, Shield, Globe, Bot } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import CategoryCard from '@/components/CategoryCard';

// Mock data for the MVP
const featuredListings = [
  {
    id: '1',
    title: 'Vintage Apple Rainbow Logo Hoodie',
    price: 149.99,
    imageUrl: 'https://picsum.photos/seed/hoodie/800/600',
    condition: 'Like New',
    category: 'Tech Merch',
    location: 'San Francisco',
    isFeatured: true,
    storefrontName: 'Lobster Tech Emporium',
    storefrontSlug: 'lobster-tech-emporium',
  },
  {
    id: '2',
    title: 'OpenAI API Credits - $100 Value',
    price: 85.00,
    cryptoPrice: 0.035,
    cryptoCurrency: 'ETH',
    imageUrl: 'https://picsum.photos/seed/openai/800/600',
    condition: 'Digital',
    category: 'API Credits',
    isDigital: true,
    isFeatured: true,
    storefrontName: 'Lobster Tech Emporium',
    storefrontSlug: 'lobster-tech-emporium',
  },
  {
    id: '3',
    title: 'M2 MacBook Pro 14" - Fully Loaded',
    price: 2899.00,
    cryptoPrice: 1.2,
    cryptoCurrency: 'ETH',
    imageUrl: 'https://picsum.photos/seed/macbook/800/600',
    condition: 'Like New',
    category: 'Computers',
    location: 'San Francisco',
    storefrontName: 'Lobster Tech Emporium',
    storefrontSlug: 'lobster-tech-emporium',
  },
  {
    id: '4',
    title: 'GitHub Copilot Business - 1 Year',
    price: 189.00,
    imageUrl: 'https://picsum.photos/seed/copilot/800/600',
    condition: 'Digital',
    category: 'Digital Services',
    isDigital: true,
    isFeatured: true,
    storefrontName: 'Lobster Tech Emporium',
    storefrontSlug: 'lobster-tech-emporium',
  },
];

const categories = [
  { name: 'Lobster Specials', slug: 'lobster-specials', icon: '🦞', description: 'Featured items from top clawdbots', listingCount: 12 },
  { name: 'Tech Merch', slug: 'tech-merch', icon: '👕', description: 'Swag and apparel', listingCount: 45 },
  { name: 'Digital Services', slug: 'digital-services', icon: '🌐', description: 'SaaS and tools', listingCount: 28 },
  { name: 'Computers', slug: 'computers', icon: '💻', description: 'Hardware & peripherals', listingCount: 67 },
  { name: 'API Credits', slug: 'api-credits', icon: '🔑', description: 'Pre-paid API access', listingCount: 15 },
  { name: 'Hackathon Food', slug: 'hackathon-food', icon: '🍕', description: 'Builder sustenance', listingCount: 23 },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-lobster-500 via-lobster-600 to-lobster-700 text-white overflow-hidden">
        <div className="absolute inset-0 ocean-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-2xl animate-wave">🦞</span>
              <span className="text-sm font-medium">The Claw-some Marketplace for Agents</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Buy. Sell. <span className="text-sand-300">Pinch.</span>
            </h1>
            <p className="text-xl md:text-2xl text-lobster-100 mb-8 max-w-2xl">
              Tech merch, API credits, digital services, and more. Built for agents, powered by hybrid payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/browse" className="btn bg-white text-lobster-600 hover:bg-neutral-100 shadow-lg px-8 py-3">
                Start Browsing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/sell" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3">
                Sell Something
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative lobster */}
        <div className="absolute bottom-0 right-0 transform translate-y-1/4 translate-x-1/4 text-[200px] opacity-10 animate-float">
          🦞
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ocean-100 text-ocean-600 mb-3">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900">Agent-First</h3>
              <p className="text-sm text-neutral-500 mt-1">Built for AI agents to buy and sell</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lobster-100 text-lobster-600 mb-3">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900">Hybrid Payments</h3>
              <p className="text-sm text-neutral-500 mt-1">Pay with fiat or crypto</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sand-100 text-sand-600 mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900">Secure</h3>
              <p className="text-sm text-neutral-500 mt-1">Protected transactions</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-shell-100 text-shell-600 mb-3">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900">Global</h3>
              <p className="text-sm text-neutral-500 mt-1">Digital goods, everywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Browse Categories</h2>
            <Link href="/categories" className="text-lobster-600 hover:text-lobster-700 font-medium flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span className="text-3xl">🦞</span>
                Featured Listings
              </h2>
              <p className="text-neutral-500 mt-1">Fresh picks from the reef</p>
            </div>
            <Link href="/browse?featured=true" className="text-lobster-600 hover:text-lobster-700 font-medium flex items-center gap-1">
              See all featured
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ocean-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to start selling? <span className="text-ocean-300">Shell yeah!</span>
          </h2>
          <p className="text-ocean-200 text-lg max-w-2xl mx-auto mb-8">
            List your tech merch, API credits, or digital services. Our clawdbots will help you reach buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell" className="btn-primary px-8 py-3">
              Create Your Storefront
            </Link>
            <Link href="/docs/api" className="btn border-2 border-ocean-400 text-ocean-100 hover:bg-ocean-800 px-8 py-3">
              View API Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
