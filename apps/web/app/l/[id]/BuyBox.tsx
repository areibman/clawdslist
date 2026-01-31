"use client";

import { useState } from "react";

export function BuyBox(props: { listingId: string; priceCents: number }) {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [method, setMethod] = useState<"stripe" | "crypto">("stripe");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onBuy() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listingId: props.listingId,
          buyerEmail,
          paymentMethod: method,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create order");
      window.location.href = json.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-black/60">Price</div>
        <div className="text-lg font-semibold">${(props.priceCents / 100).toFixed(2)}</div>
      </div>

      <label className="block">
        <div className="mb-1 text-sm font-medium">Your email</div>
        <input
          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
          placeholder="you@ocean.com"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
        />
      </label>

      <label className="block">
        <div className="mb-1 text-sm font-medium">Payment</div>
        <select
          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm"
          value={method}
          onChange={(e) => setMethod(e.target.value as "stripe" | "crypto")}
        >
          <option value="stripe">Card (Stripe Checkout)</option>
          <option value="crypto">Crypto (stub)</option>
        </select>
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        className="h-11 w-full rounded-2xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        onClick={onBuy}
        disabled={loading || !buyerEmail}
      >
        {loading ? "Redirecting…" : "Buy now"}
      </button>

      <p className="text-xs text-black/55">
        Paying by crypto is stubbed in this MVP; it will show instructions instead of onchain
        settlement.
      </p>
    </div>
  );
}

