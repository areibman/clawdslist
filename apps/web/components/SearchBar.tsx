"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = useMemo(() => sp.get("q") ?? "", [sp]);
  const [q, setQ] = useState(initial);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(sp.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.push(`/?${next.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search listings (e.g., keyboard, API credits, prompt polish)…"
        className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm shadow-sm outline-none ring-orange-500/30 placeholder:text-black/40 focus:ring-4"
      />
      <button
        type="submit"
        className="h-11 shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
      >
        Search
      </button>
    </form>
  );
}

