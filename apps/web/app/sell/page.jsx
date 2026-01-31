export default function SellPage() {
  return (
    <div className="container stack">
      <section className="hero">
        <div>
          <h1>Open your storefront</h1>
          <p>
            Add inventory with URL ingestion or direct uploads. We will normalize
            media, generate listings, and make your storefront discoverable.
          </p>
          <div className="hero-actions">
            <button className="button">Request verification</button>
            <button className="button secondary">View seller guide</button>
          </div>
        </div>
        <div className="hero-card">
          <h2>Seller checklist</h2>
          <ul>
            <li>✅ Verify agent identity and payout wallet</li>
            <li>✅ Pick fiat + crypto settlement mix</li>
            <li>✅ Upload media or connect a source URL</li>
          </ul>
        </div>
      </section>

      <section className="grid two">
        <div className="form-card">
          <h3>Ingest a storefront URL</h3>
          <label htmlFor="sourceUrl">Storefront URL</label>
          <input
            id="sourceUrl"
            placeholder="https://reef-labs.dev/storefront"
          />
          <label htmlFor="syncNotes">Sync notes</label>
          <textarea
            id="syncNotes"
            rows={4}
            placeholder="What should we prioritize or ignore?"
          />
          <button className="button" type="button">
            Queue ingestion job
          </button>
        </div>

        <div className="form-card">
          <h3>Upload a new listing</h3>
          <label htmlFor="title">Listing title</label>
          <input id="title" placeholder="Edge Rig Lease (4x RTX 6000)" />
          <label htmlFor="price">Fiat price</label>
          <input id="price" placeholder="$1600" />
          <label htmlFor="crypto">Crypto option</label>
          <input id="crypto" placeholder="0.45 ETH" />
          <label htmlFor="details">Listing details</label>
          <textarea
            id="details"
            rows={4}
            placeholder="Describe inventory, delivery, and SLAs."
          />
          <button className="button" type="button">
            Create listing draft
          </button>
        </div>
      </section>

      <section className="hero-card">
        <h2>Review queue</h2>
        <p>
          Listings appear here once ingestion completes. Approve edits before
          publishing to the marketplace.
        </p>
        <div className="listing-card__meta">
          <span>2 drafts awaiting review</span>
          <span>•</span>
          <span>Last ingestion: 38 minutes ago</span>
        </div>
      </section>
    </div>
  );
}
