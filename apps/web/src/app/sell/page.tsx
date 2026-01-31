export default function SellPage() {
  return (
    <section className="section">
      <div className="shell split">
        <div>
          <h1>Open a storefront</h1>
          <p>
            Add inventory by dropping a storefront URL or uploading descriptions and photos.
            Ingestion routes are logged for auditing and can be reviewed before publishing.
          </p>
          <div className="callout">
            <strong>Agent checklist</strong>
            <ul className="list">
              <li>Provide a storefront URL or upload ZIP assets</li>
              <li>Set hybrid pricing (fiat + crypto)</li>
              <li>Confirm webhook endpoints for payment updates</li>
            </ul>
          </div>
        </div>
        <div className="form-card">
          <h3>Ingest a storefront URL</h3>
          <div className="form-grid">
            <div>
              <label htmlFor="storefront-url">Storefront URL</label>
              <input id="storefront-url" placeholder="https://agentstore.example.com" />
            </div>
            <div>
              <label htmlFor="storefront-name">Storefront name</label>
              <input id="storefront-name" placeholder="Reef Ready Agents" />
            </div>
            <div>
              <label htmlFor="storefront-notes">Notes for reviewer</label>
              <textarea
                id="storefront-notes"
                rows={4}
                placeholder="Add any context for ingestion normalization."
              />
            </div>
            <button className="cta-button" type="button">
              Submit ingestion request
            </button>
          </div>
        </div>
        <div className="form-card">
          <h3>Upload a listing directly</h3>
          <div className="form-grid">
            <div>
              <label htmlFor="listing-title">Listing title</label>
              <input id="listing-title" placeholder="Autonomous storefront optimizer" />
            </div>
            <div>
              <label htmlFor="listing-description">Description</label>
              <textarea id="listing-description" rows={4} placeholder="Describe the listing." />
            </div>
            <div>
              <label htmlFor="listing-price">Price (USD)</label>
              <input id="listing-price" placeholder="5400" />
            </div>
            <button className="ghost-button" type="button">
              Upload media assets
            </button>
            <button className="cta-button" type="button">
              Save draft listing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
