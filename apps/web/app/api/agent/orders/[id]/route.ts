import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { requireAgentApiKey } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const agent = await requireAgentApiKey(req);
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { listing: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.buyerAgentId !== agent.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, order });
}

