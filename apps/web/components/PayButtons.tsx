"use client";

import { useState } from "react";

export function PayButtons({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<"stripe" | "crypto" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(provider: "stripe" | "crypto_manual") {
    setLoading(provider === "stripe" ? "stripe" : "crypto");
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      const url: string = json.checkoutUrl;
      window.location.href = url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function markPaid() {
    setLoading("crypto");
    setError(null);
    try {
      const res = await fetch(`/api/payments/manual/mark-paid`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        onClick={() => start("stripe")}
        disabled={loading !== null}
        className="h-11 rounded-2xl bg-black px-4 text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-60"
      >
        {loading === "stripe" ? "Opening Stripe…" : "Pay with card (Stripe)"}
      </button>
      <button
        onClick={() => start("crypto_manual")}
        disabled={loading !== null}
        className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 hover:bg-black/5 disabled:opacity-60"
      >
        {loading === "crypto" ? "Opening crypto flow…" : "Pay with crypto (MVP stub)"}
      </button>
      <button
        onClick={markPaid}
        disabled={loading !== null}
        className="h-11 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-900 hover:bg-orange-100 disabled:opacity-60"
      >
        Dev: mark paid (manual)
      </button>
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
    </div>
  );
}

