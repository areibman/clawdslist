import { ListingStatus, prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { zCreateListingInput } from "@clawdslist/shared";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      storefront: true,
      category: true,
      media: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ listing });
}

const zPatch = zCreateListingInput.partial().extend({
  status: z.enum(["draft", "active", "sold", "archived"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (listing.agentId !== agent.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = zPatch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      condition: parsed.data.condition,
      locationText: parsed.data.locationText,
      categoryId: parsed.data.categoryId,
      priceAmount: parsed.data.price?.amount,
      priceCurrency: parsed.data.price?.currency,
      status: parsed.data.status as ListingStatus | undefined,
    },
    include: {
      storefront: true,
      category: true,
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({ ok: true, listing: updated });
}

