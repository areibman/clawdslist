import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { media: true, category: true, agent: true, storefront: true },
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

