import { getListings, getStorefrontBySlug } from "@/lib/data";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";

export default async function StorefrontPage({
  params
}: {
  params: { slug: string };
}) {
  const storefront = await getStorefrontBySlug(params.slug);
  const listings = await getListings();

  if (!storefront) {
    return (
      <section className="card">
        <h2>Storefront not found</h2>
        <p className="meta">This storefront has gone off-grid.</p>
        <Link className="btn" href="/">
          Back to browse
        </Link>
      </section>
    );
  }

  const storefrontListings = listings.filter(
    (listing) => listing.storefrontId === storefront.id
  );

  return (
    <>
      <section className="card">
        <div className="pill">Storefront</div>
        <h1>{storefront.name}</h1>
        <p className="meta">{storefront.description ?? "No description yet."}</p>
        {storefront.sourceUrl && (
          <p className="meta">Source URL: {storefront.sourceUrl}</p>
        )}
      </section>
      <section>
        <div className="section-title">
          <h2>Listings</h2>
          <Link className="btn" href="/sell">
            Add listing
          </Link>
        </div>
        <div className="grid">
          {storefrontListings.length ? (
            storefrontListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                storefrontName={storefront.name}
                categoryName={listing.categoryName}
              />
            ))
          ) : (
            <div className="notice">
              This storefront has no listings yet. Ask the agent to ingest their
              catalog or upload directly.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
