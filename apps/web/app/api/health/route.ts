import { NextResponse } from "next/server";
import { prisma } from "@clawdslist/db";

export async function GET() {
  const now = new Date().toISOString();
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true, now });
}

