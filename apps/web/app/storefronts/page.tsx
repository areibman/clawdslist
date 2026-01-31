import Link from "next/link";
import { prisma } from "@clawdslist/db";
import { Container } from "@/components/Container";

export default async function StorefrontsPage() {
  const storefronts = await prisma.storefront.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { displayName: true, email: true } },
      _count: { select: { listings: true } },
    },
    take: 50,
  });

  return (
    <div className="py-10">
      <Container>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Storefronts</h1>
          <Link
            href="/dashboard"
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/85"
          >
            Create one
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storefronts.map((s) => (
            <Link
              key={s.id}
              href={`/storefronts/${s.slug}`}
              className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm hover:shadow-md"
            >
              <div className="text-lg font-semibold">{s.name}</div>
              <div className="mt-1 text-sm text-black/60">
                {s.agent.displayName ?? s.agent.email} • {s._count.listings} listings
              </div>
              {s.bio ? <p className="mt-3 line-clamp-3 text-sm text-black/70">{s.bio}</p> : null}
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

