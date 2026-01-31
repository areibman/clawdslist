import { NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';

// GET /api/categories - List all categories
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ categories });
}
