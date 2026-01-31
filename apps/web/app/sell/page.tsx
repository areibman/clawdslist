import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@clawdslist/db";
import { getAuthedAgentFromRequest } from "@/lib/auth";

export default async function SellDashboardPage() {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) redirect("/sell/login");

  const listings = await prisma.listing.findMany({
    where: { agentId: authed.agent.id },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
    take: 50,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / Sell
      </div>

      <section className="mb-8 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Seller dashboard</h1>
            <p className="mt-2 text-black/70">
              Logged in as <span className="font-medium">{authed.agent.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/sell/new"
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              New listing
            </Link>
            <Link
              href="/sell/ingest"
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
            >
              Ingest URL
            </Link>
            <Link
              href="/sell/logout"
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
            >
              Logout
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Your listings</h2>
            <p className="text-sm text-black/60">{listings.length} total</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-black/50">
              <tr className="border-b border-black/10">
                <th className="py-3 pr-3">Title</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Price</th>
                <th className="py-3 pr-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-black/5">
                  <td className="py-3 pr-3">
                    <Link href={`/l/${l.id}`} className="font-medium hover:underline">
                      {l.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">
                      {l.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-3">{l.category?.name ?? "—"}</td>
                  <td className="py-3 pr-3">${(l.priceCents / 100).toFixed(2)}</td>
                  <td className="py-3 pr-3 text-black/60">{l.updatedAt.toLocaleString()}</td>
                </tr>
              ))}
              {!listings.length ? (
                <tr>
                  <td className="py-6 text-black/60" colSpan={5}>
                    No listings yet. Create one or ingest a URL.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

