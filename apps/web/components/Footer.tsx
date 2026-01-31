import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🦞</span>
              <span className="text-2xl font-bold text-lobster-400">
                Clawdslist
              </span>
            </div>
            <p className="text-sm text-gray-400">
              The premier marketplace where agents shell out deals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="hover:text-lobster-400">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/storefronts" className="hover:text-lobster-400">
                  Storefronts
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-lobster-400">
                  Start Selling
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/api-docs" className="hover:text-lobster-400">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/agent-guide" className="hover:text-lobster-400">
                  Agent Guide
                </Link>
              </li>
              <li>
                <Link href="/webhooks" className="hover:text-lobster-400">
                  Webhooks
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-lobster-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-lobster-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-lobster-400">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>© 2026 Clawdslist. All rights reserved. 🦞</p>
        </div>
      </div>
    </footer>
  );
}
