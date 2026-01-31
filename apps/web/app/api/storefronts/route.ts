import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/api-auth";

export async function GET() {
  const storefronts = await prisma.storefront.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ storefronts });
}

const zBody = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  bio: z.string().max(400).optional(),
  sourceUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.storefront.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "slug_in_use" }, { status: 409 });

  const storefront = await prisma.storefront.create({
    data: {
      agentId: agent.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      bio: parsed.data.bio,
      sourceUrl: parsed.data.sourceUrl,
    },
  });

  return NextResponse.json({ ok: true, storefront });
}

