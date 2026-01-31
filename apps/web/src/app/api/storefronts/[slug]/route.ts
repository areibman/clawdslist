import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

interface RouteParams {
  params: { slug: string };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const storefront = store.storefronts.find((item) => item.slug === params.slug);
  if (!storefront) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: storefront });
}
