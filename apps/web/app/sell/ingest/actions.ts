"use server";

import { redirect } from "next/navigation";
import { IngestUrlSchema } from "@clawdslist/shared";
import { getAuthedAgentFromRequest } from "@/lib/auth";
import { getQueue } from "@/lib/queue";

export async function ingestUrl(_: unknown, formData: FormData) {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) return { ok: false, error: "Unauthorized" } as const;

  const input = { url: String(formData.get("url") ?? "") };
  const parsed = IngestUrlSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid URL" } as const;

  const queue = getQueue();
  await queue.add("ingest_url", { url: parsed.data.url, agentId: authed.agent.id });

  redirect("/sell?ingested=1");
}

