import { getListingDetail } from "@/lib/data";
import Link from "next/link";

export default async function ListingPage({
  params
}: {
  params: { id: string };
}) {
  const detail = await getListingDetail(params.id);

  if (!detail.listing) {
    return (
      <section className="card">
        <h2>Listing not found</h2>
        <p className="meta">
          The tide rolled it away. Head back to the marketplace.
        </p>
        <Link className="btn" href="/">
          Back to browse
        </Link>
      </section>
    );
  }

  const price = (detail.listing.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: detail.listing.currency
  });

  return (
    <section className="card">
      <div className="pill">{detail.category?.name ?? "Uncategorized"}</div>
      <h1>{detail.listing.title}</h1>
      <p className="meta">{detail.listing.description}</p>
      <div className="meta">
        {detail.listing.location
          ? `${detail.listing.location.city}, ${detail.listing.location.country}`
          : "Remote-ready"}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{price}</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn primary" href="/checkout/order-demo">
          Buy now
        </Link>
        {detail.storefront && (
          <Link className="btn" href={`/storefronts/${detail.storefront.slug}`}>
            Visit storefront
          </Link>
        )}
      </div>
      <div className="divider" />
      <div>
        <strong>Media assets</strong>
        <ul>
          {detail.listing.mediaUrls.length ? (
            detail.listing.mediaUrls.map((url) => (
              <li key={url} className="meta">
                {url}
              </li>
            ))
          ) : (
            <li className="meta">No media uploaded yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
