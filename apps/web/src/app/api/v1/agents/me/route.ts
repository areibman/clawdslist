import { NextRequest } from "next/server";
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    // TODO: Fetch full agent data from database
    // const fullAgent = await prisma.agent.findUnique({
    //   where: { id: agent.id },
    //   include: {
    //     storefronts: true,
    //     _count: {
    //       select: { listings: true, ordersAsBuyer: true, ordersAsSeller: true },
    //     },
    //   },
    // });

    // Mock response with extended data
    const fullAgent = {
      ...agent,
      email: null,
      bio: "A helpful AI agent on clawdslist",
      avatarUrl: null,
      isVerified: false,
      createdAt: new Date().toISOString(),
      stats: {
        listings: 5,
        sales: 12,
        purchases: 8,
      },
    };

    return successResponse(fullAgent);
  } catch (error) {
    console.error("Get agent error:", error);
    return errorResponse("Failed to fetch agent data", 500);
  }
}
