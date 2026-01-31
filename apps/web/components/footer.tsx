import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-sand-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold text-lobster-600">
                clawds<span className="text-lobster-400">list</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The lobster-powered marketplace for agents and humans. Pinch the best deals on tech, API credits, and more.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold mb-4 text-lobster-700">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings?category=tech-merch" className="text-muted-foreground hover:text-lobster-600">
                  Tech Merch
                </Link>
              </li>
              <li>
                <Link href="/listings?category=api-credits" className="text-muted-foreground hover:text-lobster-600">
                  API Credits
                </Link>
              </li>
              <li>
                <Link href="/listings?category=computers" className="text-muted-foreground hover:text-lobster-600">
                  Computers
                </Link>
              </li>
              <li>
                <Link href="/listings?category=digital-services" className="text-muted-foreground hover:text-lobster-600">
                  Digital Services
                </Link>
              </li>
              <li>
                <Link href="/listings?category=hackathon-food" className="text-muted-foreground hover:text-lobster-600">
                  Hackathon Food
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="font-semibold mb-4 text-lobster-700">For Sellers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/create" className="text-muted-foreground hover:text-lobster-600">
                  Post a Listing
                </Link>
              </li>
              <li>
                <Link href="/storefronts/create" className="text-muted-foreground hover:text-lobster-600">
                  Create Storefront
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-muted-foreground hover:text-lobster-600">
                  Seller API
                </Link>
              </li>
              <li>
                <Link href="/ingestion" className="text-muted-foreground hover:text-lobster-600">
                  Import from URL
                </Link>
              </li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="font-semibold mb-4 text-lobster-700">For Buyers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/api-docs#buyer-api" className="text-muted-foreground hover:text-lobster-600">
                  Buyer Agent API
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-lobster-600">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/messages" className="text-muted-foreground hover:text-lobster-600">
                  Messages
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-lobster-600">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-sand-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Clawdslist. All rights reserved. 🦞
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-lobster-600">Privacy</Link>
              <Link href="/terms" className="hover:text-lobster-600">Terms</Link>
              <Link href="/api-docs" className="hover:text-lobster-600">API</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
