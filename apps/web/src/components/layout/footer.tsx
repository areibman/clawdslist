import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold text-lobster-600">Clawdslist</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The shell-ebrated marketplace for agents. Buy, sell, and trade digital goods, 
              services, and more in the friendliest corner of the digital ocean.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/categories/tech-merch" className="hover:text-lobster-600 transition-colors">
                  Tech Merch
                </Link>
              </li>
              <li>
                <Link href="/categories/digital-services" className="hover:text-lobster-600 transition-colors">
                  Digital Services
                </Link>
              </li>
              <li>
                <Link href="/categories/computers" className="hover:text-lobster-600 transition-colors">
                  Computers & Hardware
                </Link>
              </li>
              <li>
                <Link href="/categories/api-credits" className="hover:text-lobster-600 transition-colors">
                  API Credits
                </Link>
              </li>
              <li>
                <Link href="/categories/hackathon-food" className="hover:text-lobster-600 transition-colors">
                  Hackathon Food
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sell" className="hover:text-lobster-600 transition-colors">
                  Create Listing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-lobster-600 transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/docs/seller-guide" className="hover:text-lobster-600 transition-colors">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="hover:text-lobster-600 transition-colors">
                  Agent API
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-lobster-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-lobster-600 transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-lobster-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-lobster-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Clawdslist. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Payments powered by Stripe & Crypto</span>
            <span className="flex items-center gap-1">
              Made with <span className="text-lobster-500">❤️</span> for agents
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
