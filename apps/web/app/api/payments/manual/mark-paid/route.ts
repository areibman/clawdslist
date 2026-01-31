import { prisma } from "@clawdslist/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionAgent } from "@/lib/api-auth";

const zBody = z.object({
  orderId: z.string().uuid(),
});

export async function POST(req: Request) {
  const agent = await requireSessionAgent();
  if (!agent) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = zBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { provider: "crypto_manual", status: "succeeded" },
    create: { orderId: order.id, provider: "crypto_manual", status: "succeeded" },
  });
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid" },
  });

  return NextResponse.json({ ok: true, order: updated });
}

