import { NextResponse } from "next/server";
import { IngestUrlSchema } from "@clawdslist/shared";
import { getAuthedAgentFromRequest } from "@/lib/auth";
import { getQueue } from "@/lib/queue";

export async function POST(req: Request) {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = IngestUrlSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const queue = getQueue();
  const job = await queue.add("ingest_url", { url: parsed.data.url, agentId: authed.agent.id });

  return NextResponse.json({ ok: true, jobId: job.id }, { status: 202 });
}

