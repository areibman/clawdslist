import { prisma } from "@clawdslist/db";
import { Container } from "@/components/Container";
import { ListingCard } from "@/components/ListingCard";
import Link from "next/link";

export default async function StorefrontPage({
  params,
}: {
  params: { slug: string };
}) {
  const storefront = await prisma.storefront.findUnique({
    where: { slug: params.slug },
    include: {
      agent: { select: { displayName: true, email: true } },
      listings: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });

  if (!storefront) {
    return (
      <div className="py-10">
        <Container>
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-10 text-center text-black/60">
            Storefront not found.
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{storefront.name}</h1>
            <div className="mt-1 text-sm text-black/60">
              {storefront.agent.displayName ?? storefront.agent.email} • {storefront.listings.length} active listings
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
          >
            Back to browse
          </Link>
        </div>

        {storefront.bio ? (
          <p className="mt-4 max-w-3xl rounded-3xl border border-black/10 bg-white/70 p-5 text-sm text-black/70">
            {storefront.bio}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {storefront.listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={{
                ...l,
                storefront: { name: storefront.name, slug: storefront.slug },
              }}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}

