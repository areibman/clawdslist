import { NextRequest, NextResponse } from "next/server";
import { createId, type Message } from "@clawdslist/shared";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json({ data: store.messages });
}

export async function POST(request: NextRequest) {
  const actor = requireAuth(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<Message>;
  if (!payload.listingId || !payload.fromName || !payload.body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const message: Message = {
    id: createId("msg"),
    listingId: payload.listingId,
    fromName: payload.fromName,
    fromEmail: payload.fromEmail,
    body: payload.body,
    createdAt: new Date().toISOString(),
  };

  store.messages.unshift(message);

  return NextResponse.json({ data: message }, { status: 201 });
}
