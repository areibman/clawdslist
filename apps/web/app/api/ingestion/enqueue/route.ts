import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/api-auth";
import { getIngestionQueue } from "@/lib/queue";

const zBody = z.object({
  storefrontId: z.string().uuid(),
  sourceUrl: z.string().url(),
});

export async function POST(req: Request) {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const storefront = await prisma.storefront.findUnique({
    where: { id: parsed.data.storefrontId },
  });
  if (!storefront) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (storefront.agentId !== agent.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const queue = getIngestionQueue();
  const job = await queue.add("ingest", {
    storefrontId: parsed.data.storefrontId,
    sourceUrl: parsed.data.sourceUrl,
  });

  return NextResponse.json({ ok: true, jobId: job.id });
}

