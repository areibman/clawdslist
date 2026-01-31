import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { storefrontCreateSchema } from '@clawdslist/shared';
import { serializeDecimal } from '@/lib/db';

// GET /api/storefronts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    const storefronts = await prisma.storefront.findMany({
      where: { isActive: true },
      include: {
        agent: { select: { name: true } },
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: storefronts,
    });
  } catch (error) {
    console.error('List storefronts error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list storefronts' } },
      { status: 500 }
    );
  }
}

// POST /api/storefronts - Create storefront
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = storefrontCreateSchema.parse(body);

    // TODO: Get agent from authenticated user
    const agent = await prisma.agent.findFirst({
      where: { isActive: true },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_AGENT', message: 'No agent found for user' } },
        { status: 400 }
      );
    }

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const storefront = await prisma.storefront.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        websiteUrl: data.websiteUrl,
        agentId: agent.id,
      },
      include: {
        agent: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeDecimal(storefront),
    }, { status: 201 });
  } catch (error) {
    console.error('Create storefront error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create storefront' } },
      { status: 500 }
    );
  }
}
