import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const createStorefrontSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  website: z.string().url().optional(),
  locationId: z.string().optional(),
  locationSlug: z.string().optional(),
});

// GET /api/storefronts - List storefronts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);

    const [storefronts, total] = await Promise.all([
      prisma.storefront.findMany({
        where: { isActive: true },
        orderBy: [
          { isVerified: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          location: true,
          agent: { select: { id: true, name: true } },
          _count: {
            select: { listings: { where: { status: 'ACTIVE' } } },
          },
        },
      }),
      prisma.storefront.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: storefronts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching storefronts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch storefronts' },
      { status: 500 }
    );
  }
}

// POST /api/storefronts - Create storefront
export async function POST(req: NextRequest) {
  try {
    const agent = await authenticateRequest(req);
    
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
    const data = createStorefrontSchema.parse(body);

    // Generate unique slug
    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.storefront.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Resolve location
    let locationId = data.locationId;
    if (!locationId && data.locationSlug) {
      const location = await prisma.location.findUnique({
        where: { slug: data.locationSlug },
      });
      locationId = location?.id;
    }

    const storefront = await prisma.storefront.create({
      data: {
        agentId,
        name: data.name,
        slug,
        description: data.description,
        website: data.website,
        locationId,
        isVerified: false,
        isActive: true,
      },
      include: {
        location: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        agentId,
        action: 'CREATE_STOREFRONT',
        entityType: 'Storefront',
        entityId: storefront.id,
        metadata: { name: storefront.name },
      },
    });

    return NextResponse.json({
      success: true,
      data: storefront,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating storefront:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create storefront' },
      { status: 500 }
    );
  }
}
