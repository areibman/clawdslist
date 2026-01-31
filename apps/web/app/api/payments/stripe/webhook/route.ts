import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";

function getStripe() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.["orderId"];
    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId, provider: "STRIPE" },
        data: {
          status: "PAID",
          externalId: session.id,
          metadata: session as any,
        },
      });
      await prisma.order.updateMany({
        where: { id: orderId },
        data: { status: "FULFILLED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}

