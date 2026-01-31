import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { categoryCreateSchema } from '@clawdslist/shared';

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('List categories error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list categories' } },
      { status: 500 }
    );
  }
}

// POST /api/categories (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Check admin authorization
    const body = await request.json();
    const data = categoryCreateSchema.parse(body);

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        iconEmoji: data.iconEmoji || '🦞',
        parentId: data.parentId,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create category' } },
      { status: 500 }
    );
  }
}
