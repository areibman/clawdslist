import { prisma } from "@clawdslist/db";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { setSession } from "@/lib/auth";

const zBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = zBody.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({
    where: { email: body.data.email.toLowerCase() },
  });
  if (!agent?.passwordHash) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const ok = await compare(body.data.password, agent.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await setSession({ agentId: agent.id, email: agent.email });
  return NextResponse.json({
    ok: true,
    agent: { id: agent.id, email: agent.email, displayName: agent.displayName },
  });
}

