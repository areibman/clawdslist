import Image from "next/image";
import Link from "next/link";
import { prisma } from "@clawdslist/db";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/format";
import { BuyButton } from "@/components/BuyButton";
import { ContactSeller } from "@/components/ContactSeller";

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      storefront: true,
      category: true,
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!listing) {
    return (
      <div className="py-10">
        <Container>
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-10 text-center text-black/60">
            Listing not found.
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
          >
            Back
          </Link>
          <Link
            href={`/storefronts/${listing.storefront.slug}`}
            className="text-sm text-black/60 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
          >
            More from {listing.storefront.name}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="grid gap-4">
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-orange-100 to-rose-100">
                {listing.media[0]?.url ? (
                  <Image
                    src={listing.media[0].url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-black/50">
                    No photo (yet)
                  </div>
                )}
              </div>
              {listing.media.length > 1 ? (
                <div className="grid grid-cols-4 gap-2 p-3">
                  {listing.media.slice(1, 5).map((m) => (
                    <div
                      key={m.id}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-black/5"
                    >
                      <Image src={m.url} alt={listing.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
              <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-black/60">
                <span className="rounded-full bg-black/5 px-3 py-1.5">
                  {formatMoney(listing.priceAmount, listing.priceCurrency)}
                </span>
                {listing.category ? (
                  <span className="rounded-full bg-black/5 px-3 py-1.5">{listing.category.name}</span>
                ) : null}
                {listing.locationText ? (
                  <span className="rounded-full bg-black/5 px-3 py-1.5">{listing.locationText}</span>
                ) : null}
                {listing.condition ? (
                  <span className="rounded-full bg-black/5 px-3 py-1.5">{listing.condition}</span>
                ) : null}
              </div>

              {listing.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-black/75">
                  {listing.description}
                </p>
              ) : (
                <p className="mt-4 text-sm text-black/60">No description provided yet.</p>
              )}
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-black/60">Checkout</div>
              <div className="mt-1 text-xl font-semibold">{formatMoney(listing.priceAmount, listing.priceCurrency)}</div>
              <div className="mt-4">
                <BuyButton listingId={listing.id} />
              </div>
              <div className="mt-4 text-xs text-black/50">
                MVP flow: creates an order, then you choose fiat (Stripe) or crypto (manual stub) on the order page.
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
              <div className="text-sm font-semibold">Seller</div>
              <div className="mt-1 text-sm text-black/60">{listing.storefront.name}</div>
              <Link
                href={`/storefronts/${listing.storefront.slug}`}
                className="mt-3 inline-block rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
              >
                Visit storefront
              </Link>
            </div>

            <ContactSeller listingId={listing.id} />
          </aside>
        </div>
      </Container>
    </div>
  );
}

