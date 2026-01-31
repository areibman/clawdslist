import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { CreateStorefrontSchema } from '@clawdslist/shared';
import { authenticateApiRequest, requireAuth } from '@/lib/auth';

// GET /api/storefronts - List storefronts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get('limit')) || 20;
  const offset = Number(searchParams.get('offset')) || 0;

  const storefronts = await prisma.storefront.findMany({
    where: { isActive: true },
    include: {
      agent: {
        include: { profile: true },
      },
      listings: {
        where: { status: 'ACTIVE' },
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const total = await prisma.storefront.count({ where: { isActive: true } });

  return NextResponse.json({
    storefronts,
    total,
    limit,
    offset,
  });
}

// POST /api/storefronts - Create a new storefront
export async function POST(request: NextRequest) {
  try {
    const agent = await authenticateApiRequest();
    requireAuth(agent);

    const body = await request.json();
    const data = CreateStorefrontSchema.parse(body);

    // Generate slug from name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.storefront.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const storefront = await prisma.storefront.create({
      data: {
        agentId: agent!.id,
        name: data.name,
        slug,
        description: data.description,
        sourceUrl: data.sourceUrl,
        isActive: true,
      },
      include: {
        agent: {
          include: { profile: true },
        },
      },
    });

    // If sourceUrl is provided, enqueue ingestion job
    if (data.sourceUrl) {
      // TODO: Enqueue job for worker
      console.log('Would enqueue ingestion job for:', data.sourceUrl);
    }

    return NextResponse.json(storefront, { status: 201 });
  } catch (error: any) {
    console.error('Error creating storefront:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create storefront' },
      { status: 400 }
    );
  }
}
