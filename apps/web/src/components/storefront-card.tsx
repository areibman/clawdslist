import Link from "next/link";
import type { Storefront } from "@clawdslist/shared";

interface StorefrontCardProps {
  storefront: Storefront;
}

export const StorefrontCard = ({ storefront }: StorefrontCardProps) => {
  return (
    <Link href={`/storefronts/${storefront.slug}`} className="card storefront-card">
      <div className="card-media">
        {storefront.heroImageUrl ? (
          <img src={storefront.heroImageUrl} alt={storefront.name} />
        ) : (
          <div className="media-fallback" />
        )}
      </div>
      <div className="card-body">
        <div className="card-title">{storefront.name}</div>
        <div className="card-subtitle">{storefront.headline}</div>
        <div className="card-meta">
          <span>{storefront.location?.city ?? "Remote"}</span>
        </div>
      </div>
    </Link>
  );
};
