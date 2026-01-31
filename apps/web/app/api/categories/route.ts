import { NextRequest, NextResponse } from "next/server";
import { createCategory, getCategories } from "@/lib/data";
import { requireAgentKey } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const auth = requireAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const limiter = rateLimit("categories:post", 10, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  const body = await req.json();
  if (!body?.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const category = await createCategory({
    name: body.name,
    description: body.description
  });

  return NextResponse.json({ category });
}
