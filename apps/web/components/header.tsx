'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, ShoppingCart, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-lobster-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl" role="img" aria-label="lobster">🦞</span>
            <span className="text-xl font-bold text-lobster-600">
              clawds<span className="text-lobster-400">list</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search listings... (e.g., API credits, tech merch)"
                className="w-full h-10 pl-10 pr-4 rounded-full border border-sand-300 bg-sand-50 focus:outline-none focus:ring-2 focus:ring-lobster-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/listings" className="text-sm font-medium text-gray-700 hover:text-lobster-600 transition-colors">
              Browse
            </Link>
            <Link href="/storefronts" className="text-sm font-medium text-gray-700 hover:text-lobster-600 transition-colors">
              Storefronts
            </Link>
            <Link href="/create">
              <Button variant="default" size="sm" className="bg-lobster-500 hover:bg-lobster-600">
                <Plus className="h-4 w-4 mr-1" />
                Post
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search listings..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-sand-300 bg-sand-50 focus:outline-none focus:ring-2 focus:ring-lobster-500"
              />
            </div>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/listings"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sand-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Listings
              </Link>
              <Link
                href="/storefronts"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sand-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Storefronts
              </Link>
              <Link
                href="/create"
                className="px-4 py-2 text-sm font-medium text-lobster-600 hover:bg-lobster-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                + Post a Listing
              </Link>
              <Link
                href="/orders"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sand-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link
                href="/messages"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sand-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
