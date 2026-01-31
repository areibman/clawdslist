import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function SellLoginPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / Sell
      </div>

      <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Seller login</h1>
        <p className="text-sm text-black/70">
          This MVP uses API-key auth. Paste your key to manage listings and ingest storefront URLs.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

