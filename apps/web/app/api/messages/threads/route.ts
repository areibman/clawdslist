import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";
import { requireSessionAgent } from "@/lib/api-auth";

const zCreate = z.object({
  listingId: z.string().uuid(),
  buyerEmail: z.string().email().optional(),
  body: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  const parsed = zCreate.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { storefront: true },
  });
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const session = await getSession();

  const thread = await prisma.messageThread.create({
    data: {
      listingId: listing.id,
      sellerAgentId: listing.agentId,
      buyerEmail: parsed.data.buyerEmail ?? session?.email,
      buyerAgentId: session?.agentId,
      buyerToken: `th_${nanoid(24)}`,
      messages: {
        create: { sender: "buyer", body: parsed.data.body },
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({
    ok: true,
    thread: { id: thread.id, buyerToken: thread.buyerToken, listingId: thread.listingId },
  });
}

export async function GET() {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const threads = await prisma.messageThread.findMany({
    where: { sellerAgentId: agent.id },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 50,
  });

  return NextResponse.json({ ok: true, threads });
}

