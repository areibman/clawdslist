import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";
import { auditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const event = await req.json();

  const eventType = event?.type;
  const session = event?.data?.object;
  const externalId = session?.id;
  const orderId = session?.metadata?.orderId;

  if (!externalId) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    if (eventType === "checkout.session.completed") {
      await prisma.payment.updateMany({
        where: { externalId },
        data: { status: "PAID" }
      });
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" }
        });
      }
      auditLog("payments.stripe.paid", { orderId, externalId });
    }
  } catch (error) {
    console.warn("[db-fallback] stripe webhook", error);
  }

  return NextResponse.json({ received: true });
}
