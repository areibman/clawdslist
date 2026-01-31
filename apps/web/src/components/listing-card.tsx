import Link from "next/link";
import type { Listing, Storefront } from "@clawdslist/shared";
import { clampText, formatCrypto, formatCurrency } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  storefront?: Storefront;
}

export const ListingCard = ({ listing, storefront }: ListingCardProps) => {
  const image = listing.media[0]?.url;
  return (
    <Link href={`/listings/${listing.id}`} className="card listing-card">
      <div className="card-media">
        {image ? <img src={image} alt={listing.title} /> : <div className="media-fallback" />}
      </div>
      <div className="card-body">
        <div className="card-title">{listing.title}</div>
        <div className="card-subtitle">{clampText(listing.description, 90)}</div>
        <div className="card-meta">
          <span>{storefront?.name ?? "Independent seller"}</span>
          <span>{listing.location?.city ?? "Remote"}</span>
        </div>
        <div className="price-row">
          <span>{formatCurrency(listing.priceFiatCents, listing.currency)}</span>
          <span className="price-crypto">{formatCrypto(listing.priceCrypto)}</span>
        </div>
      </div>
    </Link>
  );
};
