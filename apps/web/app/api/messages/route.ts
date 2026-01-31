import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@clawdslist/db";

const CreateMessageSchema = z.object({
  listingId: z.string(),
  fromEmail: z.string().email(),
  body: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateMessageSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const message = await prisma.message.create({ data: parsed.data });
  return NextResponse.json({ message }, { status: 201 });
}

