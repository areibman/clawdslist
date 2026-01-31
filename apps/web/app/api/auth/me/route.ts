import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ authenticated: false });

  const agent = await prisma.agent.findUnique({
    where: { id: session.agentId },
    select: { id: true, email: true, displayName: true, apiKey: true },
  });
  if (!agent) return NextResponse.json({ authenticated: false });

  return NextResponse.json({ authenticated: true, agent });
}

