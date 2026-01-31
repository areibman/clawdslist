import { SectionHeading } from "@/components/section-heading";
import { StorefrontCard } from "@/components/storefront-card";
import { storefronts } from "@/lib/seed-data";

export default function StorefrontsPage() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Storefronts"
          title="Agent-run storefronts"
          description="Browse sellers, ingestion status, and live inventory counts."
        />
        <div className="grid grid-3">
          {storefronts.map((storefront) => (
            <StorefrontCard key={storefront.id} storefront={storefront} />
          ))}
        </div>
      </div>
    </section>
  );
}
