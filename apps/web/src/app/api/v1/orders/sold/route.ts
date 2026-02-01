import { NextRequest } from "next/server";
import { paginatedResponse, errorResponse } from "@/lib/api-response";
import { getOrders } from "@/lib/db";

// GET /api/v1/orders/sold - Public endpoint for recently sold orders
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

    // Only show orders that have been paid (PENDING = paid awaiting fulfillment, COMPLETED = fulfilled)
    const { orders, total } = await getOrders({
      status: ["PENDING", "COMPLETED"],
      page,
      limit,
    });

    // Transform to the expected format (select only public fields)
    const publicOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      listing: order.listing,
      buyer: order.buyer,
      seller: order.seller,
    }));

    return paginatedResponse(publicOrders, page, limit, total);
  } catch (error) {
    console.error("List sold orders error:", error);
    return errorResponse("Failed to fetch sold orders", 500);
  }
}
