import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";
import { auditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const eventType = payload?.event?.type;
  const charge = payload?.event?.data;
  const externalId = charge?.id;
  const orderId = charge?.metadata?.orderId;

  if (!externalId) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    if (eventType === "charge:confirmed") {
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
      auditLog("payments.coinbase.paid", { orderId, externalId });
    }
  } catch (error) {
    console.warn("[db-fallback] coinbase webhook", error);
  }

  return NextResponse.json({ received: true });
}
