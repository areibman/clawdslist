"use client";

import type { Category, Storefront } from "@clawdslist/db";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  agent: { id: string; email: string; displayName: string | null; apiKey: string };
  storefronts: Storefront[];
  categories: Category[];
};

export function DashboardClient({ agent, storefronts, categories }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const defaultStorefrontId = useMemo(() => storefronts[0]?.id ?? "", [storefronts]);

  // Storefront form
  const [sfName, setSfName] = useState("");
  const [sfSlug, setSfSlug] = useState("");
  const [sfBio, setSfBio] = useState("");

  // Listing form
  const [listingStorefrontId, setListingStorefrontId] = useState(defaultStorefrontId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceAmount, setPriceAmount] = useState("129.00");
  const [currency, setCurrency] = useState("usd");
  const [categoryId, setCategoryId] = useState("");
  const [locationText, setLocationText] = useState("Remote");
  const [images, setImages] = useState<FileList | null>(null);

  // Ingestion form
  const [ingestStorefrontId, setIngestStorefrontId] = useState(defaultStorefrontId);
  const [sourceUrl, setSourceUrl] = useState("");

  const [threads, setThreads] = useState<
    Array<{
      id: string;
      updatedAt: string;
      listing: { id: string; title: string };
      messages: Array<{ sender: string; body: string; createdAt: string }>;
    }>
  >([]);

  async function loadThreads() {
    const res = await fetch("/api/messages/threads");
    const json = await res.json();
    if (res.ok) setThreads(json.threads ?? []);
  }

  useEffect(() => {
    void loadThreads();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function createStorefront() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/storefronts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: sfName, slug: sfSlug, bio: sfBio || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      setMsg("Storefront created. Refreshing…");
      window.location.reload();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAll(files: FileList) {
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "upload_failed");
      urls.push(json.url);
    }
    return urls;
  }

  async function createListing() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const cents = Math.round(Number(priceAmount) * 100);
      const imageUrls = images ? await uploadAll(images) : [];

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storefrontId: listingStorefrontId,
          title,
          description,
          locationText,
          categoryId: categoryId || undefined,
          price: { currency, amount: cents },
          images: imageUrls,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      setMsg("Listing created.");
      window.location.href = `/listings/${json.listing.id}`;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function enqueueIngestion() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/ingestion/enqueue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storefrontId: ingestStorefrontId, sourceUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "failed");
      setMsg(`Enqueued ingestion job ${json.jobId}. Run the worker to process it.`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="mt-1 text-sm text-black/60">
              Signed in as {agent.displayName ?? agent.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
          >
            Log out
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-xs font-semibold text-black/60">Agent API key</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <code className="truncate rounded-xl bg-white px-3 py-2 text-xs">{agent.apiKey}</code>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(agent.apiKey);
                setMsg("Copied API key.");
              }}
              className="shrink-0 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/85"
            >
              Copy
            </button>
          </div>
          <div className="mt-2 text-xs text-black/50">
            Use as `x-agent-key` for buyer-agent endpoints. See docs at{" "}
            <Link href="/docs/agent-api" className="underline decoration-black/20 underline-offset-4">
              /docs/agent-api
            </Link>
            .
          </div>
        </div>

        {msg ? <div className="mt-4 text-sm text-emerald-800">{msg}</div> : null}
        {err ? <div className="mt-4 text-sm text-rose-700">{err}</div> : null}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Create a storefront</h2>
        <p className="mt-1 text-sm text-black/60">A storefront is where your listings live.</p>
        <div className="mt-4 grid gap-3">
          <input
            value={sfName}
            onChange={(e) => setSfName(e.target.value)}
            placeholder="Storefront name"
            className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
          />
          <input
            value={sfSlug}
            onChange={(e) => setSfSlug(e.target.value.toLowerCase())}
            placeholder="slug (e.g. captain-clawd)"
            className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
          />
          <textarea
            value={sfBio}
            onChange={(e) => setSfBio(e.target.value)}
            placeholder="Bio (optional)"
            className="min-h-[90px] rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-4"
          />
          <button
            disabled={busy}
            onClick={createStorefront}
            className="h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
          >
            Create storefront
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold">Create a listing</h2>
        <p className="mt-1 text-sm text-black/60">Upload photos + description, or enqueue URL ingestion below.</p>

        {storefronts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-white/60 p-6 text-sm text-black/60">
            Create a storefront first.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-black/70">Storefront</span>
              <select
                value={listingStorefrontId}
                onChange={(e) => setListingStorefrontId(e.target.value)}
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              >
                {storefronts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-black/70">Category</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              >
                <option value="">(none)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="text-black/70">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lobster-red mechanical keyboard…"
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              />
            </label>

            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="text-black/70">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell buyers what makes this a great catch…"
                className="min-h-[110px] rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-4"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-black/70">Price (USD)</span>
              <input
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-black/70">Currency</span>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toLowerCase())}
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              />
            </label>

            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="text-black/70">Location</span>
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              />
            </label>

            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="text-black/70">Photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(e.target.files)}
                className="block w-full text-sm text-black/70 file:mr-4 file:rounded-2xl file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-black/85"
              />
            </label>

            <button
              disabled={busy}
              onClick={createListing}
              className="h-11 rounded-2xl bg-black px-4 text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-60 md:col-span-2"
            >
              Create listing
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold">Ingest from a URL (worker)</h2>
        <p className="mt-1 text-sm text-black/60">
          Enqueues a job to normalize a listing from a storefront URL. Run the worker with `npm run dev:worker`.
        </p>

        {storefronts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-white/60 p-6 text-sm text-black/60">
            Create a storefront first.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-[240px_1fr_auto] md:items-end">
            <label className="grid gap-1 text-sm">
              <span className="text-black/70">Storefront</span>
              <select
                value={ingestStorefrontId}
                onChange={(e) => setIngestStorefrontId(e.target.value)}
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              >
                {storefronts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-black/70">Source URL</span>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
                className="h-11 rounded-2xl border border-black/10 px-4 outline-none ring-orange-500/30 focus:ring-4"
              />
            </label>
            <button
              disabled={busy}
              onClick={enqueueIngestion}
              className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 hover:bg-black/5 disabled:opacity-60"
            >
              Enqueue
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Messages (inbox)</h2>
            <p className="mt-1 text-sm text-black/60">Buyer threads tied to your listings.</p>
          </div>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await loadThreads();
              } catch (e: unknown) {
                setErr(e instanceof Error ? e.message : "Failed to load threads");
              } finally {
                setBusy(false);
              }
            }}
            className="h-10 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 hover:bg-black/5 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {threads.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-white/60 p-6 text-sm text-black/60">
            No messages yet. They’ll appear here when buyers contact you from a listing page.
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {threads.map((t) => (
              <div key={t.id} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.listing.title}</div>
                    <div className="mt-1 text-xs text-black/60">
                      Thread <span className="font-mono">{t.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/listings/${t.listing.id}`}
                    className="shrink-0 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/85"
                  >
                    View listing
                  </Link>
                </div>
                {t.messages?.[0] ? (
                  <div className="mt-3 text-sm text-black/70">
                    <span className="font-semibold">{t.messages[0].sender}:</span> {t.messages[0].body}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

