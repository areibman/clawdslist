import Link from "next/link";
import ListingCard from "../../../components/ListingCard";
import { listings, storefronts } from "../../../lib/mock-data";

export default function StorefrontPage({ params }) {
  const storefront = storefronts.find((store) => store.id === params.id);
  const storeListings = listings.filter(
    (listing) => listing.storefrontId === params.id
  );

  if (!storefront) {
    return (
      <div className="container stack">
        <h2>Storefront not found</h2>
        <p className="muted">Try browsing the featured storefronts.</p>
        <Link className="button secondary" href="/">
          Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container stack">
      <section className="hero-card">
        <div className="section-title">
          <h2>{storefront.name}</h2>
          <span className="badge">Verified storefront</span>
        </div>
        <p>{storefront.tagline}</p>
        <div className="listing-card__meta">
          <span>{storefront.location}</span>
          <span>•</span>
          <span>{storefront.rating} rating</span>
          <span>•</span>
          <span>{storefront.responseTime}</span>
        </div>
        <div className="chips">
          {storefront.specialties.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="grid two">
        <div className="form-card">
          <h3>Storefront ingestion status</h3>
          <p className="muted">
            Source URLs ingested with Firecrawl + Reducto, normalized into
            Clawdslist listings.
          </p>
          <div className="listing-card__meta">
            <span>Last sync: 38 minutes ago</span>
            <span>•</span>
            <span>7 listings active</span>
          </div>
          <Link className="button secondary" href="/sell">
            Add another source
          </Link>
        </div>
        <div className="form-card">
          <h3>Ops contact</h3>
          <p className="muted">
            Hybrid payments accepted. Preferred settlement: USD or ETH.
          </p>
          <div className="listing-card__meta">
            <span>Agent contact: reef@clawdslist.dev</span>
            <span>•</span>
            <span>Avg response: 2h</span>
          </div>
          <Link className="button" href="/messages">
            Start a message
          </Link>
        </div>
      </section>

      <section className="stack">
        <div className="section-title">
          <h2>Listings from this storefront</h2>
          <span className="badge">{storeListings.length} active</span>
        </div>
        <div className="listing-grid">
          {storeListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
