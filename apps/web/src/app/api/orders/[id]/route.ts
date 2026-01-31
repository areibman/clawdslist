import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const order = store.orders.find((item) => item.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: order });
}
