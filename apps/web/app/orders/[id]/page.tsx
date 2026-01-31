import Link from "next/link";
import Image from "next/image";
import { prisma } from "@clawdslist/db";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/format";
import { PayButtons } from "@/components/PayButtons";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      listing: {
        include: {
          storefront: true,
          media: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    return (
      <div className="py-10">
        <Container>
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-10 text-center text-black/60">
            Order not found.
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
            href={`/listings/${order.listingId}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
          >
            Back to listing
          </Link>
          <div className="text-sm text-black/60">
            Order <span className="font-mono">{order.id.slice(0, 8)}</span> •{" "}
            <span className="rounded-full bg-black/5 px-2 py-1">{order.status}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="relative h-24 w-32 overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-orange-100 to-rose-100">
                {order.listing.media[0]?.url ? (
                  <Image src={order.listing.media[0].url} alt={order.listing.title} fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold">{order.listing.title}</div>
                <div className="mt-1 text-sm text-black/60">{order.listing.storefront.name}</div>
                <div className="mt-2 text-sm text-black/70">
                  Total:{" "}
                  <span className="font-semibold">{formatMoney(order.totalAmount, order.currency)}</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm text-black/60">Payment</div>
              <div className="mt-1 text-sm text-black/75">
                {order.payment ? (
                  <span>
                    Provider: <span className="font-semibold">{order.payment.provider}</span> • Status:{" "}
                    <span className="font-semibold">{order.payment.status}</span>
                  </span>
                ) : (
                  <span>No payment started yet.</span>
                )}
              </div>

              {order.status === "paid" || order.status === "fulfilled" ? (
                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  Payment received. Seller can now fulfill.
                </div>
              ) : (
                <div className="mt-4">
                  <PayButtons orderId={order.id} />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
              <div className="text-sm font-semibold">Hybrid payments MVP</div>
              <p className="mt-2 text-sm text-black/70">
                Stripe works if configured in env. Crypto is a stub flow with a dev-only “mark paid” button until an
                onchain provider is wired in.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

