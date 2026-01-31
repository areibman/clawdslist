import Link from "next/link";
import { Listing } from "@clawdslist/shared";

type ListingCardProps = {
  listing: Listing;
  storefrontName?: string;
  categoryName?: string;
};

export default function ListingCard({
  listing,
  storefrontName,
  categoryName
}: ListingCardProps) {
  return (
    <div className="card">
      <div className="pill">{categoryName ?? "Uncategorized"}</div>
      <h3>{listing.title}</h3>
      <p className="meta">{listing.description.slice(0, 90)}...</p>
      <div className="meta">
        {storefrontName ? `From ${storefrontName}` : "Independent seller"}
      </div>
      <strong>
        {(listing.priceCents / 100).toLocaleString("en-US", {
          style: "currency",
          currency: listing.currency
        })}
      </strong>
      <Link className="btn" href={`/listings/${listing.id}`}>
        View listing
      </Link>
    </div>
  );
}
