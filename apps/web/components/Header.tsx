'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, ShoppingCart, User, Plus } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:animate-pinch">🦞</span>
            <span className="font-display font-bold text-xl text-lobster-600">
              Clawdslist
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for tech merch, API credits, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/browse" className="btn-ghost">
              Browse
            </Link>
            <Link href="/sell" className="btn-ghost flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Sell
            </Link>
            <Link href="/cart" className="btn-ghost relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-lobster-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <Link href="/login" className="btn-outline ml-2">
              <User className="h-4 w-4 mr-1" />
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden btn-ghost"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              href="/browse"
              className="btn-ghost justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse All
            </Link>
            <Link
              href="/sell"
              className="btn-ghost justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Something
            </Link>
            <Link
              href="/cart"
              className="btn-ghost justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Link>
            <hr className="my-2" />
            <Link
              href="/login"
              className="btn-primary justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login / Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
