import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { agentPurchaseSchema } from '@clawdslist/shared';
import { serializeDecimal } from '@/lib/db';
import { verifyAgentApiKey } from '@/lib/auth';

/**
 * POST /api/agent/purchase
 * Agent Purchase API - Allows agents to purchase listings programmatically
 * 
 * Headers:
 *   X-Agent-Key: <api_key>
 * 
 * Body:
 *   {
 *     "listingId": "string",
 *     "quantity": number,
 *     "paymentMethod": "stripe" | "crypto_eth" | "crypto_usdc",
 *     "callbackUrl": "string" (optional)
 *   }
 * 
 * Response:
 *   {
 *     "orderId": "string",
 *     "orderNumber": "string",
 *     "status": "string",
 *     "paymentUrl": "string" (for Stripe),
 *     "cryptoAddress": "string" (for crypto),
 *     "totalUsd": number
 *   }
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const data = agentPurchaseSchema.parse(body);

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: {
        storefront: { select: { name: true } },
      },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found or unavailable' } },
        { status: 404 }
      );
    }

    // Check quantity
    if (listing.quantity < data.quantity) {
      return NextResponse.json(
        { success: false, error: { code: 'INSUFFICIENT_QUANTITY', message: `Only ${listing.quantity} available` } },
        { status: 400 }
      );
    }

    // Calculate total
    const subtotal = Number(listing.priceUsd) * data.quantity;
    const total = subtotal; // Add fees if needed

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerEmail: `agent-${agent.id}@clawdslist.bot`,
        buyerAgentId: agent.id,
        subtotalUsd: subtotal,
        totalUsd: total,
        status: 'PENDING',
        items: {
          create: {
            listingId: listing.id,
            quantity: data.quantity,
            priceUsd: listing.priceUsd,
          },
        },
      },
    });

    // Create payment record
    let paymentMethod: 'STRIPE' | 'CRYPTO_ETH' | 'CRYPTO_USDC' = 'STRIPE';
    let paymentUrl: string | null = null;
    let cryptoAddress: string | null = null;

    switch (data.paymentMethod) {
      case 'stripe':
        paymentMethod = 'STRIPE';
        // TODO: Create Stripe checkout session
        paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${order.id}?method=stripe`;
        break;
      case 'crypto_eth':
        paymentMethod = 'CRYPTO_ETH';
        // TODO: Generate unique deposit address
        cryptoAddress = '0x1234...demo';
        break;
      case 'crypto_usdc':
        paymentMethod = 'CRYPTO_USDC';
        // TODO: Generate unique deposit address
        cryptoAddress = '0x1234...demo';
        break;
    }

    await prisma.payment.create({
      data: {
        method: paymentMethod as any,
        status: 'PENDING',
        amountUsd: total,
        orderId: order.id,
      },
    });

    // Log the API call
    await prisma.auditLog.create({
      data: {
        action: 'AGENT_PURCHASE',
        entityType: 'Order',
        entityId: order.id,
        agentId: agent.id,
        metadata: {
          listingId: listing.id,
          quantity: data.quantity,
          paymentMethod: data.paymentMethod,
          callbackUrl: data.callbackUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentUrl,
        cryptoAddress,
        totalUsd: total,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Agent purchase error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process purchase' } },
      { status: 500 }
    );
  }
}
