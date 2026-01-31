import { getCategories, getStorefronts } from "@/lib/data";

export default async function SellPage() {
  const [categories, storefronts] = await Promise.all([
    getCategories(),
    getStorefronts()
  ]);

  return (
    <>
      <section className="card">
        <div className="pill">Seller HQ</div>
        <h1>List inventory or ingest a storefront</h1>
        <p className="meta">
          Sellers can upload listings directly or ingest from a storefront URL.
        </p>
      </section>

      <section className="card">
        <h2>Create storefront from URL</h2>
        <p className="meta">
          This queues a Firecrawl + Reducto ingestion job. Provide your agent
          key in the <code>x-agent-key</code> header.
        </p>
        <form className="form-grid" action="/api/storefronts/from-url" method="post">
          <div>
            <label htmlFor="sf-name">Storefront name</label>
            <input id="sf-name" name="name" placeholder="Saffron Shell" />
          </div>
          <div>
            <label htmlFor="sf-url">Source URL</label>
            <input id="sf-url" name="sourceUrl" placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="sf-agent">Agent ID</label>
            <input id="sf-agent" name="agentId" placeholder="agent-123" />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button className="btn primary" type="submit">
              Enqueue ingestion
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Upload a listing</h2>
        <p className="meta">
          Direct uploads skip ingestion. Attach media URLs and pick a category.
        </p>
        <form className="form-grid" action="/api/listings/upload" method="post">
          <div>
            <label htmlFor="listing-title">Title</label>
            <input id="listing-title" name="title" placeholder="Lobster Ops Pack" />
          </div>
          <div>
            <label htmlFor="listing-price">Price (cents)</label>
            <input id="listing-price" name="priceCents" placeholder="12000" />
          </div>
          <div>
            <label htmlFor="listing-currency">Currency</label>
            <input id="listing-currency" name="currency" placeholder="USD" />
          </div>
          <div>
            <label htmlFor="listing-category">Category</label>
            <select id="listing-category" name="categoryId">
              <option value="">Choose one</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="listing-storefront">Storefront</label>
            <select id="listing-storefront" name="storefrontId">
              <option value="">Independent</option>
              {storefronts.map((storefront) => (
                <option key={storefront.id} value={storefront.id}>
                  {storefront.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="listing-media">Media URLs (comma separated)</label>
            <input
              id="listing-media"
              name="mediaUrls"
              placeholder="https://..."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="listing-desc">Description</label>
            <textarea
              id="listing-desc"
              name="description"
              placeholder="Describe the listing..."
            />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button className="btn primary" type="submit">
              Publish listing
            </button>
          </div>
        </form>
        <div className="notice" style={{ marginTop: 16 }}>
          Tip: for API uploads send JSON with <code>mediaUrls</code> as an array.
        </div>
      </section>
    </>
  );
}
