import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/categories - List categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const includeCounts = searchParams.get('includeCounts') === 'true';

    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        parent: true,
        children: true,
        ...(includeCounts && {
          _count: {
            select: { listings: { where: { status: 'ACTIVE' } } },
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category (admin only)
export async function POST(req: NextRequest) {
  try {
    const agent = await authenticateRequest(req);
    if (!agent?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = createCategorySchema.parse(body);

    const slug = slugify(data.name);

    // Check if slug exists
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        parentId: data.parentId,
        sortOrder: data.sortOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
