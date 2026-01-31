import { NextRequest, NextResponse } from "next/server";
import { createStorefrontFromUrl } from "@/lib/data";
import { requireAgentKey } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { auditLog } from "@/lib/audit";
import { enqueueIngestion } from "@/lib/queue";
import { prisma } from "@clawdslist/db";
import { parseRequestBody } from "@/lib/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = requireAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const limiter = rateLimit("storefronts:from-url", 10, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  const body = await parseRequestBody(req);
  const { name, sourceUrl, agentId } = body ?? {};
  if (!name || !sourceUrl || !agentId) {
    return NextResponse.json(
      { error: "name, sourceUrl, agentId are required." },
      { status: 400 }
    );
  }

  const storefront = await createStorefrontFromUrl(name, sourceUrl, agentId);
  let listingSource = {
    id: `source-${Date.now()}`,
    sourceUrl,
    status: "PENDING"
  };

  try {
    const created = await prisma.listingSource.create({
      data: {
        sourceUrl,
        rawPayload: {},
        status: "PENDING",
        storefrontId: storefront.id
      }
    });
    listingSource = {
      id: created.id,
      sourceUrl: created.sourceUrl,
      status: created.status
    };
  } catch (error) {
    console.warn("[db-fallback] listingSource", error);
  }

  auditLog("storefront.ingestion.requested", {
    storefrontId: storefront.id,
    sourceUrl
  });

  await enqueueIngestion({
    storefrontId: storefront.id,
    sourceUrl,
    listingSourceId: listingSource.id
  });

  return NextResponse.json(
    {
      storefront,
      listingSource,
      status: "enqueued"
    },
    { status: 202 }
  );
}
