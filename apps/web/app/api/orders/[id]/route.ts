import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { requireAuth, verifyApiKey } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            mediaAssets: true,
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (order.buyerId !== agent.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get order' },
      { status: 500 }
    );
  }
}
