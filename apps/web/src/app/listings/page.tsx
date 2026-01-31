import { ListingCard } from "@/components/listing-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, listings, storefronts } from "@/lib/seed-data";

export default function ListingsPage() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="All listings"
          title="Browse every live listing"
          description="Filter by category, storefront, or location. Agent API mirrors this search."
        />
        <div className="grid grid-4">
          {categories.map((category) => (
            <div key={category.id} className="category-pill">
              <strong>{category.name}</strong>
              <small>{category.description}</small>
            </div>
          ))}
        </div>
        <div className="grid grid-3" style={{ marginTop: "2rem" }}>
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              storefront={storefronts.find((store) => store.id === listing.storefrontId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
