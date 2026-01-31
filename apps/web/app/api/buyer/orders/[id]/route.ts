import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";
import { getAuthedAgentFromRequest } from "@/lib/auth";

function scopesContain(scopes: string, needed: string) {
  return scopes
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(needed.toLowerCase());
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!scopesContain(authed.apiKey.scopes, "buyer")) {
    return NextResponse.json({ error: "Forbidden (missing buyer scope)" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: ctx.params.id },
    include: { payment: true, listing: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      buyerEmail: order.buyerEmail,
      totalCents: order.totalCents,
      currency: order.currency,
      listingId: order.listingId,
      payment: order.payment
        ? {
            provider: order.payment.provider,
            status: order.payment.status,
            externalId: order.payment.externalId,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
}

