"use client";

import { useState } from "react";

export function ContactSeller({ listingId }: { listingId: string }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ threadId: string; buyerToken: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      setResult({ threadId: json.thread.id, buyerToken: json.thread.buyerToken ?? null });
      setBody("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold">Message the seller</div>
      <p className="mt-1 text-sm text-black/60">Start a thread about this listing (MVP messaging).</p>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ask about condition, delivery, bundle deals…"
        className="mt-3 min-h-[90px] w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-4"
      />
      <button
        disabled={busy || body.trim().length === 0}
        onClick={send}
        className="mt-3 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 hover:bg-black/5 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
      </button>

      {result ? (
        <div className="mt-3 rounded-2xl bg-black/[0.02] p-4 text-xs text-black/70">
          Thread created: <span className="font-mono">{result.threadId.slice(0, 8)}</span>
          {result.buyerToken ? (
            <>
              <div className="mt-2">
                Buyer token (keep it): <span className="font-mono">{result.buyerToken}</span>
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(result.buyerToken ?? "");
                }}
                className="mt-2 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/85"
              >
                Copy token
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {error ? <div className="mt-2 text-xs text-rose-700">{error}</div> : null}
    </div>
  );
}

