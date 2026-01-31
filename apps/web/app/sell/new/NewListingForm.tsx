"use client";

import { useActionState } from "react";
import { createListing } from "./actions";

export function NewListingForm(props: { categories: Array<{ id: string; name: string }> }) {
  const [state, action, pending] = useActionState(
    createListing,
    null as null | { ok: false; error: string },
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block md:col-span-2">
          <div className="mb-1 text-sm font-medium">Title</div>
          <input
            name="title"
            className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
            placeholder="Hand-knit CTRL+CLAW+DEL hoodie"
            required
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm font-medium">Price (USD)</div>
          <input
            name="priceDollars"
            type="number"
            step="0.01"
            min="0"
            className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
            placeholder="49.99"
            required
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm font-medium">Category</div>
          <select className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm" name="categoryId">
            <option value="">Uncategorized</option>
            {props.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <div className="mb-1 text-sm font-medium">Description</div>
          <textarea
            name="description"
            className="min-h-32 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-red-600/20 focus:ring-4"
            placeholder="Tell buyers what they’re getting, any delivery details, and your vibe policy."
            required
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm font-medium">Location (optional)</div>
          <input
            name="locationText"
            className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
            placeholder="Remote / Boston / The Pier"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm font-medium">Image URL (optional)</div>
          <input
            name="imageUrl"
            className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-red-600/20 focus:ring-4"
            placeholder="https://..."
          />
        </label>
      </div>

      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        className="h-11 w-full rounded-2xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Creating…" : "Create listing"}
      </button>
    </form>
  );
}

