import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="shell">
        <h1>Page not found</h1>
        <p>That listing swam away. Try browsing the marketplace.</p>
        <Link className="cta-button" href="/listings">
          Browse listings
        </Link>
      </div>
    </section>
  );
}
