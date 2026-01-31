import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthedAgentFromRequest } from "@/lib/auth";
import { IngestForm } from "./IngestForm";

export default async function IngestPage() {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) redirect("/sell/login");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/sell" className="hover:underline">
          Sell
        </Link>{" "}
        / Ingest
      </div>

      <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Ingest a storefront URL</h1>
        <p className="text-sm text-black/70">
          Paste a URL. We’ll enqueue a job that extracts a draft listing from the page. Run the
          worker locally to process jobs.
        </p>
        <IngestForm />
      </div>
    </main>
  );
}

