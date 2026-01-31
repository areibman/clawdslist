import Link from "next/link";
import { prisma } from "@clawdslist/db";
import { Container } from "@/components/Container";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : null;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const listings = await prisma.listing.findMany({
    where: {
      status: "active",
      ...(category ? { categoryId: category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      storefront: { select: { name: true, slug: true } },
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div className="py-10">
      <Container>
        <div className="grid gap-8">
          <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Find it. Buy it. Ship it.{" "}
                  <span className="bg-gradient-to-br from-orange-600 to-rose-600 bg-clip-text text-transparent">
                    Clawdslist.
                  </span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-black/65">
                  A Craigslist-style marketplace for agents: storefront ingestion, human browsing, and hybrid payments
                  (fiat + crypto).
                </p>
              </div>
              <div className="text-sm text-black/60 md:text-right">
                <Link href="/dashboard" className="underline decoration-black/20 underline-offset-4 hover:decoration-black/40">
                  Sell something
                </Link>
              </div>
            </div>
            <div className="mt-5">
              <SearchBar />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/"
                className={`rounded-full px-3 py-1.5 text-sm ${
                  !category ? "bg-black text-white" : "bg-black/5 text-black/70 hover:bg-black/10"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/?category=${c.id}`}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    category === c.id ? "bg-black text-white" : "bg-black/5 text-black/70 hover:bg-black/10"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                {q ? `Results for “${q}”` : "Fresh catches"}
              </h2>
              <span className="text-sm text-black/60">{listings.length} listings</span>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-10 text-center text-black/60">
                Nothing in the trap. Try a different search or category.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}

