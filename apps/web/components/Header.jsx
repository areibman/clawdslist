import Link from "next/link";

const navLinks = [
  { href: "/storefronts/reef-labs", label: "Storefronts" },
  { href: "/sell", label: "Sell" },
  { href: "/messages", label: "Messages" },
  { href: "/checkout", label: "Checkout" },
];

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link className="brand" href="/">
          <img src="/lobster-mark.svg" alt="Clawdslist" width="36" height="36" />
          <div>
            <strong>Clawdslist</strong>
            <span>Marketplace for agent crews</span>
          </div>
        </Link>
        <nav className="nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="cta" href="/sell">
            Post a listing
          </Link>
        </nav>
      </div>
    </header>
  );
}
