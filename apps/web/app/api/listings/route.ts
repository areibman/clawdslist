import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  locationId: z.string().optional(),
  locationSlug: z.string().optional(),
  storefrontId: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  isDigital: z.boolean().optional(),
  cryptoPrice: z.number().positive().optional(),
  cryptoCurrency: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  metadata: z.any().optional(),
});

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  condition: z.string().optional(),
  status: z.string().optional(),
  featured: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'popular']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// GET /api/listings - Search listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = searchSchema.parse(Object.fromEntries(searchParams));

    const page = parseInt(params.page || '1');
    const pageSize = Math.min(parseInt(params.pageSize || '20'), 100);
    const skip = (page - 1) * pageSize;

    const where: any = {
      status: params.status || 'ACTIVE',
    };

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    if (params.category) {
      where.category = { slug: params.category };
    }

    if (params.location) {
      where.location = { slug: params.location };
    }

    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
      if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
    }

    if (params.condition) {
      where.condition = params.condition;
    }

    if (params.featured === 'true') {
      where.isFeatured = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (params.sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: true,
          location: true,
          media: { take: 1 },
          storefront: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: listings.map(l => ({
          ...l,
          price: Number(l.price),
          cryptoPrice: l.cryptoPrice ? Number(l.cryptoPrice) : null,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create listing
export async function POST(req: NextRequest) {
  try {
    const agent = await authenticateRequest(req);
    
    // For demo purposes, create a demo agent if not authenticated
    let agentId = agent?.id;
    if (!agentId) {
      const demoAgent = await prisma.agent.findFirst({
        where: { email: 'seller-bot@clawdslist.com' },
      });
      agentId = demoAgent?.id;
    }

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = createListingSchema.parse(body);

    // Resolve category
    let categoryId = data.categoryId;
    if (!categoryId && data.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: data.categorySlug },
      });
      categoryId = category?.id;
    }
    if (!categoryId) {
      // Default to first category
      const defaultCategory = await prisma.category.findFirst();
      categoryId = defaultCategory?.id;
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 400 }
      );
    }

    // Resolve location
    let locationId = data.locationId;
    if (!locationId && data.locationSlug) {
      const location = await prisma.location.findUnique({
        where: { slug: data.locationSlug },
      });
      locationId = location?.id;
    }

    // Generate unique slug
    const baseSlug = slugify(data.title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const listing = await prisma.listing.create({
      data: {
        agentId,
        storefrontId: data.storefrontId,
        categoryId,
        locationId,
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        cryptoPrice: data.cryptoPrice,
        cryptoCurrency: data.cryptoCurrency,
        condition: data.condition || 'NEW',
        status: 'ACTIVE',
        isDigital: data.isDigital || false,
        quantity: data.quantity || 1,
        metadata: data.metadata as any,
        publishedAt: new Date(),
      },
      include: {
        category: true,
        location: true,
        media: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        agentId,
        action: 'CREATE_LISTING',
        entityType: 'Listing',
        entityId: listing.id,
        metadata: { title: listing.title },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...listing,
        price: Number(listing.price),
        cryptoPrice: listing.cryptoPrice ? Number(listing.cryptoPrice) : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
