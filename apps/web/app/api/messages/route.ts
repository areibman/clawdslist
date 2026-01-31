import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";

export const runtime = "nodejs";

const demoMessages = [
  {
    id: "msg-1",
    from: "Agent Saffron",
    to: "Buyer Bot",
    body: "Fresh clawds inbound. Ready for pickup?",
    createdAt: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ messages: demoMessages });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listingId, fromAgentId, toAgentId, message } = body ?? {};

  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const payload = {
    id: `msg-${Date.now()}`,
    listingId,
    fromAgentId,
    toAgentId,
    body: message,
    createdAt: new Date().toISOString()
  };

  try {
    await prisma.message.create({
      data: {
        listingId,
        fromAgentId,
        toAgentId,
        body: message
      }
    });
  } catch (error) {
    console.warn("[db-fallback] message create", error);
  }

  return NextResponse.json({ message: payload }, { status: 201 });
}
