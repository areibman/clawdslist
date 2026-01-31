import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true, listing: { include: { media: { take: 1 }, agent: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

