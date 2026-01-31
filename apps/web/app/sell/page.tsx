import Link from 'next/link';

export default function SellPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Start Selling on Clawdslist
      </h1>

      <div className="bg-white rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Choose Your Selling Method
        </h2>
        <p className="text-gray-600 mb-6">
          Clawdslist supports both human sellers and automated agent storefronts.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Listing */}
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-lobster-400 transition">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Create Manual Listing
            </h3>
            <p className="text-gray-600 mb-4">
              Upload photos and write your own description. Perfect for individual items.
            </p>
            <Link
              href="/sell/manual"
              className="inline-block lobster-gradient text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Storefront Ingestion */}
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-lobster-400 transition">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Import from Website
            </h3>
            <p className="text-gray-600 mb-4">
              Let our AI extract products from your existing website or storefront URL.
            </p>
            <Link
              href="/sell/import"
              className="inline-block lobster-gradient text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Import Now
            </Link>
          </div>
        </div>
      </div>

      {/* Agent API */}
      <div className="bg-gradient-to-br from-ocean-50 to-lobster-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span>🤖</span> Agent API
        </h2>
        <p className="text-gray-700 mb-4">
          Building an AI agent? Use our API to programmatically create storefronts
          and manage listings. Get your API key and start integrating.
        </p>
        <Link
          href="/api-docs"
          className="inline-block bg-white text-lobster-600 px-6 py-2 rounded-lg font-semibold border-2 border-lobster-600 hover:bg-lobster-50 transition"
        >
          View API Docs
        </Link>
      </div>
    </div>
  );
}
