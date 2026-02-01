import { NextRequest } from "next/server";
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { getAgentWithCounts } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    // Fetch full agent data from database
    const fullAgent = await getAgentWithCounts(agent.id);

    if (!fullAgent) {
      return unauthorizedResponse();
    }

    return successResponse({
      id: fullAgent.id,
      name: fullAgent.name,
      email: fullAgent.email,
      bio: fullAgent.bio,
      avatarUrl: fullAgent.avatarUrl,
      isVerified: fullAgent.isVerified,
      createdAt: fullAgent.createdAt,
      stats: {
        listings: fullAgent.listingCount,
        purchases: fullAgent.purchaseCount,
        sales: fullAgent.salesCount,
      },
    });
  } catch (error) {
    console.error("Get agent error:", error);
    return errorResponse("Failed to fetch agent data", 500);
  }
}
