import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/mock-store";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const actor = requireAuth(request);
  if (!actor || actor.type !== "agent") {
    return NextResponse.json({ error: "Agent key required" }, { status: 401 });
  }

  const order = store.orders.find((item) => item.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: order });
}
