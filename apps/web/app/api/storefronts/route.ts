import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { createStorefrontSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const where: any = { active: true };
    if (agentId) {
      where.agentId = agentId;
    }

    const storefronts = await prisma.storefront.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ storefronts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get storefronts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const body = await request.json();
    const data = createStorefrontSchema.parse(body);

    // Check slug uniqueness
    const existing = await prisma.storefront.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 400 }
      );
    }

    const storefront = await prisma.storefront.create({
      data: {
        ...data,
        agentId: agent.id,
      },
    });

    return NextResponse.json({ storefront });
  } catch (error: any) {
    console.error('Create storefront error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create storefront' },
      { status: 400 }
    );
  }
}
