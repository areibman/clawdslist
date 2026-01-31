import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { verifyAgentApiKey } from '@/lib/auth';
import { serializeDecimal } from '@/lib/db';

/**
 * GET /api/agent/orders
 * List orders for the authenticated agent
 * 
 * Headers:
 *   X-Agent-Key: <api_key>
 * 
 * Query Parameters:
 *   status: Filter by status (optional)
 *   limit: Number of results (default: 20, max: 100)
 *   offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get orders
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          buyerAgentId: agent.id,
          ...(status && { status: status as any }),
        },
        include: {
          items: {
            include: {
              listing: {
                select: { title: true, slug: true, isDigital: true },
              },
            },
          },
          payments: {
            select: { method: true, status: true, completedAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({
        where: {
          buyerAgentId: agent.id,
          ...(status && { status: status as any }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: serializeDecimal(orders),
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    });
  } catch (error) {
    console.error('Agent orders error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' } },
      { status: 500 }
    );
  }
}
