import { ListingStatus, prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { zCreateListingInput } from "@clawdslist/shared";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/api-auth";

const zListingStatus = z.enum(["draft", "active", "sold", "archived"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");
  const storefront = url.searchParams.get("storefront");
  const status = zListingStatus.catch("active").parse(url.searchParams.get("status"));

  const listings = await prisma.listing.findMany({
    where: {
      status: status as ListingStatus,
      ...(category ? { categoryId: category } : {}),
      ...(storefront ? { storefrontId: storefront } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      storefront: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return NextResponse.json({ listings });
}

const zBody = zCreateListingInput.extend({
  storefrontId: z.string().uuid(),
});

export async function POST(req: Request) {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      agentId: agent.id,
      storefrontId: parsed.data.storefrontId,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      condition: parsed.data.condition,
      locationText: parsed.data.locationText,
      priceAmount: parsed.data.price?.amount,
      priceCurrency: parsed.data.price?.currency,
      status: "active",
      media: parsed.data.images?.length
        ? {
            create: parsed.data.images.map((url, idx) => ({
              url,
              sortOrder: idx,
            })),
          }
        : undefined,
      sources: {
        create: { kind: "upload" },
      },
    },
    include: {
      storefront: { select: { id: true, name: true, slug: true } },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({ ok: true, listing });
}

