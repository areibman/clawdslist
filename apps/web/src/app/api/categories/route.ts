import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        children: {
          include: {
            _count: {
              select: {
                listings: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
        },
      },
      where: {
        parentId: null, // Only top-level categories
      },
      orderBy: { sortOrder: 'asc' },
    })

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      listingCount: cat._count.listings,
      children: cat.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        listingCount: child._count.listings,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch categories' } },
      { status: 500 }
    )
  }
}
