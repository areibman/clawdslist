import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

