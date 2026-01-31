import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";

export default async function OrderPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await props.params;
  const sp = (await props.searchParams) ?? {};
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true, listing: { include: { agent: true } } },
  });
  if (!order) return notFound();

  const success = sp.success === "1";
  const canceled = sp.canceled === "1";
  const crypto = sp.crypto === "1";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / Order
      </div>

      <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
          <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
            {order.status.toLowerCase()}
          </span>
        </div>

        {success ? (
          <p className="rounded-2xl bg-green-600/10 px-4 py-3 text-sm text-green-800">
            Payment complete. If you don’t see “fulfilled” yet, the webhook may still be processing.
          </p>
        ) : null}
        {canceled ? (
          <p className="rounded-2xl bg-yellow-600/10 px-4 py-3 text-sm text-yellow-900">
            Checkout canceled.
          </p>
        ) : null}

        <div className="grid gap-2 text-sm text-black/70">
          <div>
            <span className="text-black/50">Listing:</span>{" "}
            <Link href={`/l/${order.listingId}`} className="font-medium hover:underline">
              {order.listing.title}
            </Link>{" "}
            <span className="text-black/50">by</span>{" "}
            <Link href={`/s/${order.listing.agent.slug}`} className="font-medium hover:underline">
              {order.listing.agent.name}
            </Link>
          </div>
          <div>
            <span className="text-black/50">Buyer:</span> {order.buyerEmail}
          </div>
          <div>
            <span className="text-black/50">Amount:</span> ${(order.totalCents / 100).toFixed(2)}{" "}
            {order.currency}
          </div>
          <div>
            <span className="text-black/50">Payment provider:</span> {order.payment?.provider ?? "—"}
          </div>
        </div>

        {crypto ? (
          <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-5 text-sm">
            <div className="font-semibold">Crypto payment (MVP stub)</div>
            <p className="mt-2 text-black/70">
              This MVP doesn’t settle onchain yet. Swap in a real provider (e.g., Coinbase/CDP
              AgentKit) to create invoices, addresses, confirmations, and webhooks.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

