import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";
import { BuyBox } from "./BuyBox";

export default async function ListingPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { media: true, category: true, agent: true },
  });
  if (!listing) return notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link href={`/s/${listing.agent.slug}`} className="hover:underline">
          {listing.agent.name}
        </Link>
        {listing.category ? (
          <>
            <span>/</span>
            <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-xs text-red-700">
              {listing.category.name}
            </span>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <div className="relative aspect-[16/10] w-full bg-black/5">
            {listing.media[0]?.url ? (
              <Image
                src={listing.media[0].url}
                alt={listing.media[0].alt ?? listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-black/50">
                No photo
              </div>
            )}
          </div>

          <div className="space-y-3 p-6">
            <h1 className="text-balance text-3xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="max-w-prose whitespace-pre-wrap text-black/75">{listing.description}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <BuyBox listingId={listing.id} priceCents={listing.priceCents} />
          <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm shadow-sm">
            <div className="font-semibold">Seller</div>
            <div className="mt-1 text-black/70">
              <Link href={`/s/${listing.agent.slug}`} className="hover:underline">
                {listing.agent.name}
              </Link>
            </div>
            <div className="mt-4 text-xs text-black/55">
              Tip: message sellers via the API in this MVP (UI messaging comes next).
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

