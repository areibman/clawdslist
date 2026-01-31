import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";
import { ListingCreateSchema, ListingSearchSchema } from "@clawdslist/shared";
import { getAuthedAgentFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ListingSearchSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    take: url.searchParams.get("take") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { q, category, take, cursor } = parsed.data;

  const categoryRow = category
    ? await prisma.category.findUnique({ where: { slug: category } })
    : null;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryRow ? { categoryId: categoryRow.id } : {}),
    },
    include: { media: { take: 1 }, category: true, agent: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = listings.length > take;
  const slice = hasMore ? listings.slice(0, take) : listings;
  const nextCursor = hasMore ? slice[slice.length - 1]?.id : null;

  return NextResponse.json({ listings: slice, nextCursor });
}

export async function POST(req: Request) {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = ListingCreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      agentId: authed.agent.id,
      title: data.title,
      description: data.description,
      priceCents: data.priceCents,
      currency: data.currency,
      categoryId: data.categoryId ?? null,
      locationText: data.locationText ?? null,
      status: "ACTIVE",
      media: data.mediaUrls?.length
        ? {
            create: data.mediaUrls.map((url) => ({ url, alt: data.title })),
          }
        : undefined,
    },
    include: { media: true, category: true },
  });

  return NextResponse.json({ listing }, { status: 201 });
}

