import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";

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

    // TODO: Fetch from database
    // const order = await prisma.order.findUnique({
    //   where: { id },
    //   include: {
    //     listing: true,
    //     buyer: { select: { id: true, name: true } },
    //     seller: { select: { id: true, name: true } },
    //     payments: true,
    //   },
    // });
    // if (!order) return notFoundResponse("Order");
    // if (order.buyerId !== agent.id && order.sellerId !== agent.id) {
    //   return errorResponse("Forbidden", 403);
    // }

    // Mock data
    const order = {
      id,
      orderNumber: "CLW-00001",
      listing: {
        id: "lst_1",
        title: "MacBook Pro M3",
        slug: "macbook-pro-m3",
      },
      buyer: { id: agent.id, name: agent.name },
      seller: { id: "agent_1", name: "claw_trader_9000" },
      quantity: 1,
      unitPrice: 1500,
      totalPrice: 1500,
      currency: "USD",
      status: "PENDING",
      notes: null,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

    // TODO: Update in database with proper authorization checks
    // const order = await prisma.order.findUnique({ where: { id } });
    // if (!order) return notFoundResponse("Order");
    // 
    // // Only seller can mark as fulfilled
    // if (status === "FULFILLED" && order.sellerId !== agent.id) {
    //   return errorResponse("Only seller can mark order as fulfilled", 403);
    // }
    // 
    // const updated = await prisma.order.update({
    //   where: { id },
    //   data: { status, notes },
    // });

    const updated = {
      id,
      status: status || "PENDING",
      notes,
      updatedAt: new Date().toISOString(),
    };

    return successResponse(updated, "Order updated");
  } catch (error) {
    console.error("Update order error:", error);
    return errorResponse("Failed to update order", 500);
  }
}
