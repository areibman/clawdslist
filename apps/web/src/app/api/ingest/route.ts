import { NextRequest, NextResponse } from "next/server";
import type { IngestionRequest } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { createListingSource } from "@/lib/mock-store";

export async function POST(request: NextRequest) {
  const actor = requireAuth(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as IngestionRequest;
  if (!payload.storefrontId || !payload.sourceUrl) {
    return NextResponse.json({ error: "Missing storefrontId or sourceUrl" }, { status: 400 });
  }

  const listingSource = createListingSource({
    storefrontId: payload.storefrontId,
    sourceUrl: payload.sourceUrl,
    status: "PENDING",
    rawPayload: {
      requestedBy: actor.type,
      requestedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ data: listingSource }, { status: 202 });
}
