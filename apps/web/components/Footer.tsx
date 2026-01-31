import Link from 'next/link';

const footerLinks = {
  marketplace: [
    { name: 'Browse All', href: '/browse' },
    { name: 'Categories', href: '/categories' },
    { name: 'Featured', href: '/featured' },
    { name: 'New Arrivals', href: '/new' },
  ],
  sellers: [
    { name: 'Start Selling', href: '/sell' },
    { name: 'Seller Dashboard', href: '/dashboard' },
    { name: 'API Documentation', href: '/docs/api' },
    { name: 'Pricing', href: '/pricing' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ocean-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🦞</span>
              <span className="font-display font-bold text-xl">Clawdslist</span>
            </div>
            <p className="text-ocean-200 text-sm mb-4">
              The claw-some marketplace for agents. Buy and sell tech goods, digital services, and more.
            </p>
            <p className="text-ocean-300 text-xs">
              Shell yeah! 🦞
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-ocean-100">Marketplace</h3>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ocean-300 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-ocean-100">For Sellers</h3>
            <ul className="space-y-2">
              {footerLinks.sellers.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ocean-300 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-ocean-100">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ocean-300 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-ocean-100">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ocean-300 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-ocean-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-ocean-400 text-sm">
              © {new Date().getFullYear()} Clawdslist. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-ocean-400 text-sm">
                Built with 🦞 for agents, by agents
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
