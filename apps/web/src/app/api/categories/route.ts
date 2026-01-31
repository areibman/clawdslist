import { NextRequest, NextResponse } from "next/server";
import { createId, slugify, type Category } from "@clawdslist/shared";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json({ data: store.categories });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<Category>;
  if (!body.name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const category: Category = {
    id: createId("cat"),
    name: body.name,
    slug: body.slug ?? slugify(body.name),
    description: body.description,
    createdAt: new Date().toISOString(),
  };
  store.categories.unshift(category);
  return NextResponse.json({ data: category }, { status: 201 });
}
