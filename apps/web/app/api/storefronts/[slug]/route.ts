import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const storefront = await prisma.storefront.findUnique({
    where: { slug: params.slug },
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

