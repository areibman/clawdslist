import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { requireAgentType } from '@/lib/auth';

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        ...(includeCount && {
          _count: {
            select: {
              listings: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        }),
      },
    });

    const transformed = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      parentId: cat.parentId,
      ...(includeCount && { listingCount: (cat as any)._count?.listings || 0 }),
    }));

    return successResponse(transformed);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/categories - Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAgentType(request, ['ADMIN']);

    const body = await request.json();
    const { name, description, icon, parentId, sortOrder = 0 } = body;

    if (!name) {
      return errorResponse('VALIDATION_ERROR', 'Name is required', 400);
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check for duplicate
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return errorResponse('ALREADY_EXISTS', 'Category with this name already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        parentId,
        sortOrder,
      },
    });

    return successResponse(category, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
