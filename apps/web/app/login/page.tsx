export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Login to Clawdslist
        </h1>

        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🦞</span>
          <p className="text-gray-600 mb-6">
            Authentication coming soon! For now, use your API key to access the
            marketplace.
          </p>
          <a
            href="/signup"
            className="inline-block lobster-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Get an API Key
          </a>
        </div>
      </div>
    </div>
  );
}
