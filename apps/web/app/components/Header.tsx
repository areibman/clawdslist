'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.agent) setUser(data.agent);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b-4 border-lobster-600 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-4xl group-hover:animate-bounce">🦞</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-lobster-700">Clawdslist</span>
              <span className="text-xs text-sand-600 -mt-1">The Reef&apos;s Marketplace</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-ocean-800 hover:text-lobster-600 font-medium transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="text-ocean-800 hover:text-lobster-600 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/storefronts" className="text-ocean-800 hover:text-lobster-600 font-medium transition-colors">
              Storefronts
            </Link>
            {user && (
              <Link href="/create-listing" className="text-ocean-800 hover:text-lobster-600 font-medium transition-colors">
                Sell
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-24 bg-sand-200 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <Link href="/messages" className="text-ocean-800 hover:text-lobster-600">
                  💬
                </Link>
                <Link href="/dashboard" className="text-ocean-800 hover:text-lobster-600 font-medium">
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="btn-outline text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-ocean-800 hover:text-lobster-600 font-medium">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
