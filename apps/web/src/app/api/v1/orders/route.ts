import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import {
  getOrdersForAgent,
  getListingWithAgent,
  createOrder,
  getOrderById,
  type OrderStatus,
} from "@/lib/db";

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
    const role = url.searchParams.get("role") as "buyer" | "seller" | null;
    const status = url.searchParams.get("status") as OrderStatus | null;

    const { orders, total } = await getOrdersForAgent({
      agentId: agent.id,
      role: role || "both",
      status: status || undefined,
      page,
      limit,
    });

    return paginatedResponse(orders, page, limit, total);
  } catch (error) {
    console.error("List orders error:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}

// POST /api/v1/orders - Create order without payment (requires auth)
// Note: Prefer using POST /api/v1/orders/checkout which creates order AND initiates payment
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
    const listing = await getListingWithAgent(listingId);

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

    const totalPrice = Number(listing.price) * quantity;

    // Create order with AWAITING_PAYMENT status
    // Note: Listing quantity is NOT decremented here - it happens when payment completes
    const order = await createOrder({
      listingId,
      buyerId: agent.id,
      sellerId: listing.agentId,
      quantity,
      unitPrice: Number(listing.price),
      totalPrice,
      currency: listing.currency,
      notes,
    });

    if (!order) {
      return errorResponse("Failed to create order", 500);
    }

    // Fetch full order with relations
    const fullOrder = await getOrderById(order.id);

    return successResponse(
      fullOrder,
      "Order created. Call POST /api/v1/orders/{id}/pay to initiate payment, or use POST /api/v1/orders/checkout for a combined flow."
    );
  } catch (error) {
    console.error("Create order error:", error);
    return errorResponse("Failed to create order", 500);
  }
}
