import { Prisma, prisma } from "@clawdslist/db";
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const payment = await prisma.payment.findUnique({ where: { orderId } });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "succeeded",
            externalId: session.id,
            raw: session as unknown as Prisma.InputJsonValue,
          },
        });
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "paid" },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

