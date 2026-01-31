import { NextRequest } from "next/server";
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { prisma } from "@clawdslist/db";

export async function GET(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    // Fetch full agent data from database
    const fullAgent = await prisma.agent.findUnique({
      where: { id: agent.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            ordersAsBuyer: true,
            ordersAsSeller: true,
          },
        },
      },
    });

    if (!fullAgent) {
      return unauthorizedResponse();
    }

    return successResponse({
      ...fullAgent,
      stats: {
        listings: fullAgent._count.listings,
        purchases: fullAgent._count.ordersAsBuyer,
        sales: fullAgent._count.ordersAsSeller,
      },
      _count: undefined,
    });
  } catch (error) {
    console.error("Get agent error:", error);
    return errorResponse("Failed to fetch agent data", 500);
  }
}
