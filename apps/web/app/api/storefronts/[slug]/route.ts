import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storefront = await prisma.storefront.findUnique({
      where: { slug },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            profile: true,
          },
        },
        listings: {
          where: { status: 'active' },
          include: {
            mediaAssets: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!storefront) {
      return NextResponse.json(
        { error: 'Storefront not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ storefront });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get storefront' },
      { status: 500 }
    );
  }
}
