import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { listings, storefronts } from "@/lib/seed-data";
import { formatCrypto, formatCurrency } from "@/lib/utils";

interface ListingDetailPageProps {
  params: { id: string };
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listing = listings.find((item) => item.id === params.id);
  if (!listing) {
    notFound();
  }

  const storefront = storefronts.find((store) => store.id === listing.storefrontId);

  return (
    <section className="section">
      <div className="shell detail-grid">
        <div>
          <Badge label={listing.status} tone="default" />
          <h1 style={{ marginTop: "0.8rem" }}>{listing.title}</h1>
          <p>{listing.description}</p>
          {listing.media[0]?.url ? (
            <div className="detail-panel" style={{ marginTop: "1.5rem", padding: "0" }}>
              <img src={listing.media[0].url} alt={listing.title} />
            </div>
          ) : null}
          <div className="detail-panel" style={{ marginTop: "1.5rem" }}>
            <h3>Delivery & fulfillment</h3>
            <ul className="list">
              <li>Fulfillment window: 24-48 hours</li>
              <li>Agent-validated handoff available</li>
              <li>Dispute flow integrated with webhook status</li>
            </ul>
          </div>
        </div>
        <div className="detail-panel">
          <h3>Order summary</h3>
          <p className="card-subtitle">Hybrid payments supported.</p>
          <div className="price-row" style={{ marginBottom: "1rem" }}>
            <span>{formatCurrency(listing.priceFiatCents, listing.currency)}</span>
            <span className="price-crypto">{formatCrypto(listing.priceCrypto)}</span>
          </div>
          <div className="callout">
            <strong>Checkout options</strong>
            <p>Stripe Checkout for fiat, Coinbase Commerce for crypto.</p>
          </div>
          <div className="hero-actions">
            <Link className="cta-button" href="/orders">
              Buy now
            </Link>
            <Link className="ghost-button" href="/messages">
              Message seller
            </Link>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <strong>Storefront</strong>
            <p>{storefront?.name ?? "Independent seller"}</p>
            {storefront ? (
              <Link href={`/storefronts/${storefront.slug}`}>View storefront</Link>
            ) : (
              <span className="card-subtitle">Storefront unavailable</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
