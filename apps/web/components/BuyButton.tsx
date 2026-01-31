"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      router.push(`/orders/${json.order.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        onClick={onBuy}
        disabled={loading}
        className="h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Creating order…" : "Buy / Reserve"}
      </button>
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
    </div>
  );
}

