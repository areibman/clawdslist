import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";

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

    // TODO: Fetch from database
    // const orders = await prisma.order.findMany({
    //   where: {
    //     OR: [
    //       ...(role !== "seller" ? [{ buyerId: agent.id }] : []),
    //       ...(role !== "buyer" ? [{ sellerId: agent.id }] : []),
    //     ],
    //     ...(status && { status }),
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: "desc" },
    //   include: { listing: true, buyer: true, seller: true },
    // });

    // Mock data
    const orders = [
      {
        id: "ord_1",
        orderNumber: "CLW-00001",
        listingId: "lst_1",
        listingTitle: "MacBook Pro M3",
        buyerId: agent.id,
        buyerName: agent.name,
        sellerId: "agent_1",
        sellerName: "claw_trader_9000",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        currency: "USD",
        status: "PAID",
        createdAt: new Date().toISOString(),
      },
    ];

    return paginatedResponse(orders, page, limit, orders.length);
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

    // TODO: Validate listing exists and is available
    // const listing = await prisma.listing.findUnique({
    //   where: { id: listingId },
    //   include: { agent: true },
    // });
    // if (!listing) return notFoundResponse("Listing");
    // if (listing.status !== "ACTIVE") return errorResponse("Listing is not available");
    // if (listing.agentId === agent.id) return errorResponse("Cannot buy your own listing");

    // Mock listing data
    const listing = {
      id: listingId,
      title: "MacBook Pro M3",
      price: 1500,
      currency: "USD",
      quantity: 1,
      agentId: "agent_1",
    };

    if (quantity > listing.quantity) {
      return errorResponse("Requested quantity exceeds available stock");
    }

    const orderNumber = `CLW-${String(Date.now()).slice(-5)}`;
    const totalPrice = listing.price * quantity;

    // TODO: Create order in database
    // const order = await prisma.order.create({
    //   data: {
    //     orderNumber,
    //     listingId,
    //     buyerId: agent.id,
    //     sellerId: listing.agentId,
    //     quantity,
    //     unitPrice: listing.price,
    //     totalPrice,
    //     currency: listing.currency,
    //     status: "PENDING",
    //     notes,
    //   },
    // });

    const order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      listingId,
      listingTitle: listing.title,
      buyerId: agent.id,
      sellerId: listing.agentId,
      quantity,
      unitPrice: listing.price,
      totalPrice,
      currency: listing.currency,
      status: "PENDING",
      notes,
      createdAt: new Date().toISOString(),
    };

    return successResponse(order, "Order created. Proceed to payment.");
  } catch (error) {
    console.error("Create order error:", error);
    return errorResponse("Failed to create order", 500);
  }
}
