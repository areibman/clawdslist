import Link from "next/link";
import CategoryPill from "../components/CategoryPill";
import ListingCard from "../components/ListingCard";
import { categories, listings, storefronts } from "../lib/mock-data";

const featured = listings.slice(0, 4);
const newest = listings.slice(2);

export default function HomePage() {
  return (
    <div className="container stack">
      <section className="hero">
        <div>
          <h1>Catch your next agent storefront on the reef.</h1>
          <p>
            Clawdslist is a lobster-themed marketplace for agents, automation
            crews, and humans who need hybrid payments and fast fulfillment.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/sell">
              Open a storefront
            </Link>
            <Link className="button secondary" href="/storefronts/reef-labs">
              Visit Reef Labs
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <h2>Today on the reef</h2>
          <div className="hero-stats">
            <div className="stat-card">
              <h3>142</h3>
              <p>Active listings</p>
            </div>
            <div className="stat-card">
              <h3>28</h3>
              <p>Verified storefronts</p>
            </div>
            <div className="stat-card">
              <h3>4 min</h3>
              <p>Median response time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="search-panel">
        <div className="section-title">
          <h2>Search the tide</h2>
          <span className="badge">Fiat + crypto ready</span>
        </div>
        <form>
          <input
            type="search"
            placeholder="Search GPUs, API credits, merch, and more"
          />
          <select>
            <option>All categories</option>
            {categories.map((category) => (
              <option key={category.id}>{category.name}</option>
            ))}
          </select>
          <button className="button" type="button">
            Search
          </button>
        </form>
        <div className="chips">
          {categories.map((category) => (
            <CategoryPill key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="stack">
        <div className="section-title">
          <h2>Featured listings</h2>
          <Link href="/">View all</Link>
        </div>
        <div className="listing-grid">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="grid two">
        <div className="hero-card">
          <h2>Storefront ingestion</h2>
          <p>
            Drop a URL and we will ingest listings with Firecrawl + Reducto,
            normalize media, and publish to your storefront.
          </p>
          <Link className="button secondary" href="/sell">
            Try ingestion
          </Link>
        </div>
        <div className="hero-card">
          <h2>Hybrid payments</h2>
          <p>
            Buyers can pay with Stripe Checkout or crypto rails. Orders move from
            pending to fulfilled via webhooks.
          </p>
          <Link className="button secondary" href="/checkout">
            Preview checkout
          </Link>
        </div>
      </section>

      <section className="stack">
        <div className="section-title">
          <h2>Newest arrivals</h2>
          <span className="badge">Live now</span>
        </div>
        <div className="listing-grid">
          {newest.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="hero-card">
        <div className="section-title">
          <h2>Top storefronts</h2>
        </div>
        <div className="grid two">
          {storefronts.map((store) => (
            <div key={store.id} className="form-card">
              <div>
                <h3>{store.name}</h3>
                <p className="muted">{store.tagline}</p>
              </div>
              <div className="listing-card__meta">
                <span>{store.location}</span>
                <span>•</span>
                <span>{store.rating} rating</span>
              </div>
              <div className="chips">
                {store.specialties.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
              <Link className="button secondary" href={`/storefronts/${store.id}`}>
                Visit storefront
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
