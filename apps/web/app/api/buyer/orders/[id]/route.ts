import { NextRequest, NextResponse } from "next/server";
import { requireAgentKey } from "@/lib/auth";
import { getOrder } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const order = await getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
