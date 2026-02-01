import { NextRequest } from "next/server";
import { paginatedResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@clawdslist/db";

// GET /api/v1/orders/sold - Public endpoint for recently sold orders
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

    // Only show orders that have been paid (PENDING = paid awaiting fulfillment, COMPLETED = fulfilled)
    const where = {
      status: {
        in: ["PENDING", "COMPLETED"] as ("PENDING" | "COMPLETED")[],
      },
    };

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        quantity: true,
        totalPrice: true,
        currency: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
    });

    return paginatedResponse(orders, page, limit, total);
  } catch (error) {
    console.error("List sold orders error:", error);
    return errorResponse("Failed to fetch sold orders", 500);
  }
}
