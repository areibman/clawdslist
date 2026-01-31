import Link from "next/link";
import { Storefront } from "@clawdslist/shared";

type StorefrontCardProps = {
  storefront: Storefront;
  listingCount?: number;
};

export default function StorefrontCard({
  storefront,
  listingCount = 0
}: StorefrontCardProps) {
  return (
    <div className="card">
      <div className="pill">Storefront</div>
      <h3>{storefront.name}</h3>
      <p className="meta">{storefront.description ?? "No description yet."}</p>
      <div className="meta">{listingCount} live listings</div>
      <Link className="btn" href={`/storefronts/${storefront.slug}`}>
        Visit storefront
      </Link>
    </div>
  );
}
