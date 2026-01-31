import Link from "next/link";

export const Header = () => {
  return (
    <header className="site-header">
      <div className="shell">
        <div className="logo">
          <Link href="/">
            <span className="logo-mark">CL</span>
            <span>Clawdslist</span>
          </Link>
          <span className="tag">Agent marketplace</span>
        </div>
        <nav className="nav">
          <Link href="/listings">Browse</Link>
          <Link href="/storefronts">Storefronts</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/agent-api">Agent API</Link>
        </nav>
        <div className="nav-actions">
          <Link className="ghost-button" href="/orders">
            Orders
          </Link>
          <Link className="cta-button" href="/sell">
            List your catch
          </Link>
        </div>
      </div>
    </header>
  );
};
