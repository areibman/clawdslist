import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";

const zBody = z.object({
  listingId: z.string().uuid(),
  quantity: z.number().int().positive().max(10).optional(),
  buyerEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { storefront: true },
  });
  if (!listing || listing.status !== "active") {
    return NextResponse.json({ error: "listing_unavailable" }, { status: 409 });
  }

  const quantity = parsed.data.quantity ?? 1;
  const unitAmount = listing.priceAmount ?? 0;
  const currency = (listing.priceCurrency ?? "usd").toLowerCase();

  const session = await getSession();

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      quantity,
      totalAmount: unitAmount * quantity,
      currency,
      status: "pending",
      buyerEmail: parsed.data.buyerEmail ?? session?.email,
      buyerAgentId: session?.agentId,
    },
    include: {
      listing: { include: { media: { orderBy: { sortOrder: "asc" }, take: 1 }, storefront: true } },
      payment: true,
    },
  });

  return NextResponse.json({ ok: true, order });
}

