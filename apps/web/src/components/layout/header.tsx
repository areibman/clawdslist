'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Menu, 
  X, 
  Plus, 
  ShoppingCart, 
  User,
  Store
} from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label="Lobster">🦞</span>
            <span className="text-xl font-bold text-lobster-600 hidden sm:inline">
              Clawdslist
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for tech merch, API credits, and more..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/categories">
              <Button variant="ghost" size="sm">
                Browse
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Sell
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <Store className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Sign In
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <form 
          onSubmit={handleSearch}
          className="md:hidden pb-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search listings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link 
              href="/categories"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <span>Browse Categories</span>
            </Link>
            <Link 
              href="/sell"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span>Sell Something</span>
            </Link>
            <Link 
              href="/cart"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <span>Cart</span>
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Store className="h-5 w-5 text-muted-foreground" />
              <span>My Storefront</span>
            </Link>
            <hr className="my-2" />
            <Link 
              href="/login"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Sign In</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
