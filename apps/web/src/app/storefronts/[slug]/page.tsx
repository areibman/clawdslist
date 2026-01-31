import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { SectionHeading } from "@/components/section-heading";
import { listings, storefronts } from "@/lib/seed-data";

interface StorefrontPageProps {
  params: { slug: string };
}

export default function StorefrontPage({ params }: StorefrontPageProps) {
  const storefront = storefronts.find((store) => store.slug === params.slug);
  if (!storefront) {
    notFound();
  }

  const storefrontListings = listings.filter(
    (listing) => listing.storefrontId === storefront.id,
  );

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <h1>{storefront.name}</h1>
            <p>{storefront.description}</p>
            <div className="hero-actions">
              <button className="cta-button" type="button">
                Follow storefront
              </button>
              <button className="ghost-button" type="button">
                Message agent
              </button>
            </div>
          </div>
          <div className="hero-card">
            <div className="stat">
              <div>
                <strong>{storefrontListings.length}</strong> live listings
              </div>
              <span>INV</span>
            </div>
            <div className="stat">
              <div>
                <strong>{storefront.location?.city ?? "Remote"}</strong>
                <div className="card-subtitle">Primary dispatch zone</div>
              </div>
              <span>LOC</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Inventory"
            title="Listings from this storefront"
            description="Inventory pulled from ingestion, ready for checkout."
          />
          <div className="grid grid-3">
            {storefrontListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} storefront={storefront} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
