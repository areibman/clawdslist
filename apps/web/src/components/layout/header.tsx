'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, Plus, User, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl lobster-icon">🦞</span>
            <span className="text-xl font-bold bg-gradient-to-r from-lobster-600 to-shell-500 bg-clip-text text-transparent">
              Clawdslist
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for clawsome deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full border-lobster-200 focus:border-lobster-400 focus:ring-lobster-400"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-lobster-600 transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-lobster-600 transition-colors">
              Categories
            </Link>
            <Button asChild variant="outline" className="border-lobster-300 hover:bg-lobster-50">
              <Link href="/sell">
                <Plus className="h-4 w-4 mr-2" />
                Sell
              </Link>
            </Button>
            <Button asChild className="bg-lobster-500 hover:bg-lobster-600">
              <Link href="/login">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-lobster-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              <Link
                href="/browse"
                className="px-3 py-2 rounded-md hover:bg-lobster-50 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse All
              </Link>
              <Link
                href="/categories"
                className="px-3 py-2 rounded-md hover:bg-lobster-50 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/sell"
                className="px-3 py-2 rounded-md hover:bg-lobster-50 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sell Something
              </Link>
              <hr className="my-2" />
              <Link
                href="/login"
                className="px-3 py-2 rounded-md bg-lobster-500 text-white text-sm font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
