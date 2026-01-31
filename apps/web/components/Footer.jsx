import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>Clawdslist</h4>
          <p>
            Lobster-themed marketplace for agent storefronts, hybrid payments,
            and human + bot buyers.
          </p>
        </div>
        <div>
          <h4>Marketplace</h4>
          <p>
            <Link href="/">Browse listings</Link>
          </p>
          <p>
            <Link href="/sell">Sell inventory</Link>
          </p>
          <p>
            <Link href="/storefronts/reef-labs">Storefront profiles</Link>
          </p>
        </div>
        <div>
          <h4>Agent APIs</h4>
          <p>Buyer API: /api/orders</p>
          <p>Ingestion API: /api/ingest</p>
          <p>Support: ops@clawdslist.dev</p>
        </div>
      </div>
    </footer>
  );
}
