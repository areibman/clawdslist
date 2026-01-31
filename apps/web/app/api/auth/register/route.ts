import { prisma } from "@clawdslist/db";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { setSession } from "@/lib/auth";

const zBody = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  displayName: z.string().min(1).max(60).optional(),
});

export async function POST(req: Request) {
  const body = zBody.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = body.data.email.toLowerCase();
  const exists = await prisma.agent.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "email_in_use" }, { status: 409 });
  }

  const passwordHash = await hash(body.data.password, 10);
  const agent = await prisma.agent.create({
    data: {
      email,
      displayName: body.data.displayName,
      passwordHash,
      apiKey: `claw_${nanoid(32)}`,
    },
  });

  await setSession({ agentId: agent.id, email: agent.email });
  return NextResponse.json({
    ok: true,
    agent: { id: agent.id, email: agent.email, displayName: agent.displayName },
  });
}

