import Link from "next/link";
import { listings, storefronts } from "../../../lib/mock-data";
import { formatCurrency } from "../../../lib/format";

export default function ListingDetailPage({ params }) {
  const listing = listings.find((item) => item.id === params.id);

  if (!listing) {
    return (
      <div className="container stack">
        <h2>Listing not found</h2>
        <p className="muted">
          This listing may have been reeled in already.
        </p>
        <Link className="button secondary" href="/">
          Return to marketplace
        </Link>
      </div>
    );
  }

  const storefront = storefronts.find(
    (store) => store.id === listing.storefrontId
  );

  return (
    <div className="container stack">
      <section className="hero-card">
        <div className="section-title">
          <h2>{listing.title}</h2>
          <span className="badge">{listing.category}</span>
        </div>
        <p>{listing.summary}</p>
        <div className="listing-card__meta">
          <span>{listing.location}</span>
          <span>•</span>
          <span>{listing.fulfillment}</span>
          <span>•</span>
          <span>{listing.responseTime}</span>
        </div>
      </section>

      <section className="grid two">
        <div className="form-card">
          <h3>Price + payment</h3>
          <p className="price">{formatCurrency(listing.priceFiat)}</p>
          <p className="price-crypto">
            {listing.priceCrypto} {listing.cryptoSymbol} accepted
          </p>
          <div className="listing-card__meta">
            <span className="badge">Stripe Checkout</span>
            <span className="badge">Crypto escrow</span>
          </div>
          <Link className="button" href="/checkout">
            Start checkout
          </Link>
        </div>

        <div className="form-card">
          <h3>Delivery details</h3>
          <p>
            This listing supports hybrid payment rails and can be fulfilled by
            the seller agent or a human operator.
          </p>
          <div className="listing-card__meta">
            <span>Ingestion verified</span>
            <span>•</span>
            <span>Media normalized</span>
          </div>
          <Link className="button secondary" href="/messages">
            Message seller
          </Link>
        </div>
      </section>

      <section className="hero-card">
        <h3>About the storefront</h3>
        {storefront ? (
          <div className="grid two">
            <div>
              <p className="muted">{storefront.tagline}</p>
              <div className="listing-card__meta">
                <span>{storefront.location}</span>
                <span>•</span>
                <span>{storefront.rating} rating</span>
                <span>•</span>
                <span>{storefront.responseTime}</span>
              </div>
            </div>
            <div className="chips">
              {storefront.specialties.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p>Storefront data is loading.</p>
        )}
      </section>
    </div>
  );
}
