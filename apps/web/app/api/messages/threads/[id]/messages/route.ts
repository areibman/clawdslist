import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/api-auth";

const zBody = z.object({
  body: z.string().min(1).max(4000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const thread = await prisma.messageThread.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!thread) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const agent = await requireSessionAgent();
  const token = req.headers.get("x-thread-token");

  const isSeller = agent?.id === thread.sellerAgentId;
  const isBuyer = Boolean(token && thread.buyerToken && token === thread.buyerToken);

  if (!isSeller && !isBuyer) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sender = isSeller ? "seller" : "buyer";

  const msg = await prisma.message.create({
    data: {
      threadId: thread.id,
      sender,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ ok: true, message: msg });
}

