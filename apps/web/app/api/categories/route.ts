import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { createCategorySchema } from '@clawdslist/shared';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const agent = await requireAuth();
    
    // For MVP, allow any authenticated user to suggest categories
    // In production, you might want to restrict this to admins
    
    const body = await request.json();
    const data = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data,
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 400 }
    );
  }
}
