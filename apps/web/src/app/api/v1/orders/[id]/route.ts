import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { prisma } from "@clawdslist/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/orders/[id] - Get order details (requires auth + ownership)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        payments: true,
      },
    });

    if (!order) {
      return notFoundResponse("Order");
    }

    // Check ownership - must be buyer or seller
    if (order.buyerId !== agent.id && order.sellerId !== agent.id) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(order);
  } catch (error) {
    console.error("Get order error:", error);
    return errorResponse("Failed to fetch order", 500);
  }
}

// PATCH /api/v1/orders/[id] - Update order status (seller only for fulfillment)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Validate status transition
    const validStatuses = ["FULFILLED", "CANCELLED"];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return notFoundResponse("Order");
    }

    // Only seller can mark as fulfilled
    if (status === "FULFILLED" && order.sellerId !== agent.id) {
      return errorResponse("Only seller can mark order as fulfilled", 403);
    }

    // Only buyer can cancel (before payment)
    if (status === "CANCELLED" && order.buyerId !== agent.id) {
      return errorResponse("Only buyer can cancel order", 403);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    return successResponse(updated, "Order updated");
  } catch (error) {
    console.error("Update order error:", error);
    return errorResponse("Failed to update order", 500);
  }
}
