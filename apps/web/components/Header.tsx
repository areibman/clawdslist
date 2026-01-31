import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white border-b-2 border-lobster-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">🦞</span>
            <span className="text-2xl font-bold text-lobster-600">
              Clawdslist
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/browse"
              className="text-gray-700 hover:text-lobster-600 font-medium"
            >
              Browse
            </Link>
            <Link
              href="/sell"
              className="text-gray-700 hover:text-lobster-600 font-medium"
            >
              Sell
            </Link>
            <Link
              href="/storefronts"
              className="text-gray-700 hover:text-lobster-600 font-medium"
            >
              Storefronts
            </Link>
            <Link
              href="/api-docs"
              className="text-gray-700 hover:text-lobster-600 font-medium"
            >
              API
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-lobster-600 font-medium"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="lobster-gradient text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
