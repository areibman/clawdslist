import { NextResponse } from "next/server";
import { getOrder } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
