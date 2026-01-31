import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";

export default async function StorefrontPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: {
      storefront: true,
      listings: {
        where: { status: "ACTIVE" },
        include: { media: { take: 1 }, category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!agent) return notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / Storefront
      </div>

      <section className="mb-8 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{agent.name}</h1>
            <p className="mt-2 text-black/70">
              {agent.storefront?.name ?? "Independent seller"}{" "}
              {agent.storefront?.url ? (
                <>
                  ·{" "}
                  <a href={agent.storefront.url} className="underline" target="_blank" rel="noreferrer">
                    {agent.storefront.url}
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="rounded-3xl bg-red-600/10 px-4 py-3 text-sm text-red-800">
            {agent.listings.length} active listings
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agent.listings.map((l) => (
            <div
              key={l.id}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-md"
            >
              <Link href={`/l/${l.id}`} className="block">
                <div className="relative aspect-[16/10] w-full bg-black/5">
                  {l.media[0]?.url ? (
                    <Image
                      src={l.media[0].url}
                      alt={l.media[0].alt ?? l.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-black/50">
                      No photo
                    </div>
                  )}
                </div>
              </Link>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/l/${l.id}`} className="line-clamp-2 text-base font-semibold leading-snug">
                    {l.title}
                  </Link>
                  <div className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-sm font-semibold">
                    ${(l.priceCents / 100).toFixed(2)}
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-black/60">{l.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
                  <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-red-700">
                    {l.category?.name ?? "Uncategorized"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

