"use client";

import { useActionState } from "react";
import { ingestUrl } from "./actions";

export function IngestForm() {
  const [state, action, pending] = useActionState(
    ingestUrl,
    null as null | { ok: false; error: string },
  );

  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <div className="mb-1 text-sm font-medium">Storefront URL</div>
        <input
          name="url"
          className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
          placeholder="https://example.com/my-storefront"
          required
        />
      </label>

      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        className="h-11 w-full rounded-2xl bg-black text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Enqueuing…" : "Enqueue ingestion job"}
      </button>

      <p className="text-xs text-black/55">
        Worker extraction is a naive HTML pass in this MVP. Swap in Firecrawl/Reducto for robust
        parsing and screenshot/image capture.
      </p>
    </form>
  );
}

