import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const storefront = await prisma.storefront.findUnique({
    where: { slug },
    include: {
      agent: { select: { id: true, displayName: true } },
      listings: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });
  if (!storefront) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ storefront });
}

