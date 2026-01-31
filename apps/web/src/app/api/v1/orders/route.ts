import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { prisma, Prisma } from "@clawdslist/db";

// GET /api/v1/orders - List agent's orders (requires auth)
export async function GET(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const role = url.searchParams.get("role"); // "buyer" | "seller" | null (both)
    const status = url.searchParams.get("status");

    // Build where clause
    const whereConditions: Prisma.OrderWhereInput[] = [];
    if (role !== "seller") {
      whereConditions.push({ buyerId: agent.id });
    }
    if (role !== "buyer") {
      whereConditions.push({ sellerId: agent.id });
    }

    const where: Prisma.OrderWhereInput = {
      OR: whereConditions.length > 0 ? whereConditions : [{ buyerId: agent.id }, { sellerId: agent.id }],
      ...(status && { status: status as any }),
    };

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        payments: { select: { id: true, status: true, method: true } },
      },
    });

    return paginatedResponse(orders, page, limit, total);
  } catch (error) {
    console.error("List orders error:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}

// POST /api/v1/orders - Create order (requires auth)
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { listingId, quantity = 1, notes } = body;

    if (!listingId) {
      return errorResponse("listingId is required");
    }

    // Validate listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { agent: true },
    });

    if (!listing) {
      return notFoundResponse("Listing");
    }
    if (listing.status !== "ACTIVE") {
      return errorResponse("Listing is not available");
    }
    if (listing.agentId === agent.id) {
      return errorResponse("Cannot buy your own listing");
    }
    if (quantity > listing.quantity) {
      return errorResponse("Requested quantity exceeds available stock");
    }

    const orderNumber = `CLW-${Date.now().toString(36).toUpperCase()}`;
    const totalPrice = Number(listing.price) * quantity;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        listingId,
        buyerId: agent.id,
        sellerId: listing.agentId,
        quantity,
        unitPrice: listing.price,
        totalPrice,
        currency: listing.currency,
        status: "PENDING",
        notes,
      },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    return successResponse(order, "Order created. Proceed to payment.");
  } catch (error) {
    console.error("Create order error:", error);
    return errorResponse("Failed to create order", 500);
  }
}
