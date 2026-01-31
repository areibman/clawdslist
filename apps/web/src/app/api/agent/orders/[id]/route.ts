import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { verifyAgentApiKey } from '@/lib/auth';
import { serializeDecimal } from '@/lib/db';

/**
 * GET /api/agent/orders/[id]
 * Get order status for an agent order
 * 
 * Headers:
 *   X-Agent-Key: <api_key>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify agent API key
    const apiKey = request.headers.get('X-Agent-Key');
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing X-Agent-Key header' } },
        { status: 401 }
      );
    }

    const agent = await verifyAgentApiKey(apiKey);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
        { status: 401 }
      );
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id },
        ],
        buyerAgentId: agent.id,
      },
      include: {
        items: {
          include: {
            listing: {
              select: {
                title: true,
                slug: true,
                isDigital: true,
                description: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeDecimal(order),
    });
  } catch (error) {
    console.error('Agent order detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order' } },
      { status: 500 }
    );
  }
}
