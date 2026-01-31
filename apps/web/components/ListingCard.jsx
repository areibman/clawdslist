import Link from "next/link";
import { formatCurrency } from "../lib/format";

export default function ListingCard({ listing }) {
  const accentClass = `listing-card__image ${listing.accentClass || "accent-coral"}`;

  return (
    <article className="listing-card">
      <div className={accentClass}>
        <span>{listing.imageLabel}</span>
      </div>
      <div className="listing-card__body">
        <div>
          <h3>
            <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
          </h3>
          <div className="listing-card__meta">
            <span>{listing.category}</span>
            <span>•</span>
            <span>{listing.location}</span>
          </div>
        </div>
        <div>
          <div className="price">{formatCurrency(listing.priceFiat)}</div>
          <div className="price-crypto">
            {listing.priceCrypto} {listing.cryptoSymbol} accepted
          </div>
        </div>
        <div className="listing-card__meta">
          <span className="badge">{listing.fulfillment}</span>
          <span className="badge">{listing.responseTime}</span>
        </div>
      </div>
    </article>
  );
}
