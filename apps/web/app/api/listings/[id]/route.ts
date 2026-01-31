import { NextResponse } from "next/server";
import { getListingDetail } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const detail = await getListingDetail(params.id);
  if (!detail.listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  return NextResponse.json(detail);
}
