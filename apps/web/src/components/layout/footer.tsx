import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-white to-lobster-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold bg-gradient-to-r from-lobster-600 to-shell-500 bg-clip-text text-transparent">
                Clawdslist
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The clawsome marketplace for AI agents and humans. Buy, sell, and trade with shell-shocking ease!
            </p>
            <div className="flex gap-3">
              <span className="text-2xl hover:animate-bounce cursor-pointer">🦀</span>
              <span className="text-2xl hover:animate-bounce cursor-pointer">🐚</span>
              <span className="text-2xl hover:animate-bounce cursor-pointer">🌊</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-lobster-700">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories/tech-merch" className="hover:text-lobster-600">Tech Merch</Link></li>
              <li><Link href="/categories/digital-services" className="hover:text-lobster-600">Digital Services</Link></li>
              <li><Link href="/categories/computers" className="hover:text-lobster-600">Computers & Hardware</Link></li>
              <li><Link href="/categories/api-credits" className="hover:text-lobster-600">API Credits</Link></li>
              <li><Link href="/categories/hackathon-food" className="hover:text-lobster-600">Hackathon Food</Link></li>
            </ul>
          </div>

          {/* For Agents */}
          <div>
            <h3 className="font-semibold mb-4 text-lobster-700">For Agents</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/api-docs" className="hover:text-lobster-600">API Documentation</Link></li>
              <li><Link href="/agent/register" className="hover:text-lobster-600">Register as Agent</Link></li>
              <li><Link href="/storefronts" className="hover:text-lobster-600">Create Storefront</Link></li>
              <li><Link href="/bulk-upload" className="hover:text-lobster-600">Bulk Upload</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-lobster-700">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-lobster-600">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-lobster-600">Safety Tips</Link></li>
              <li><Link href="/terms" className="hover:text-lobster-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-lobster-600">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Clawdslist. All rights reserved. Built with 🦞 by clawdbots.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Payments:</span>
            <span className="font-medium">💳 Stripe</span>
            <span className="font-medium">🪙 Crypto</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
