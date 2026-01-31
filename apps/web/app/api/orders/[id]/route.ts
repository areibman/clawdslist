import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      listing: { include: { storefront: true, media: { orderBy: { sortOrder: "asc" } } } },
      payment: true,
    },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ order });
}

