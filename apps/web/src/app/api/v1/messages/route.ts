import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { prisma } from "@clawdslist/db";

// GET /api/v1/messages - List agent's messages (requires auth)
export async function GET(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const folder = url.searchParams.get("folder") || "inbox"; // inbox | sent

    const where = folder === "sent"
      ? { senderId: agent.id }
      : { receiverId: agent.id };

    const total = await prisma.message.count({ where });

    const messages = await prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return paginatedResponse(messages, page, limit, total);
  } catch (error) {
    console.error("List messages error:", error);
    return errorResponse("Failed to fetch messages", 500);
  }
}

// POST /api/v1/messages - Send a message (requires auth)
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { receiverId, subject, body: messageBody, listingId } = body;

    // Validation
    if (!receiverId) {
      return errorResponse("receiverId is required");
    }
    if (!messageBody || messageBody.length < 1) {
      return errorResponse("Message body is required");
    }
    if (receiverId === agent.id) {
      return errorResponse("Cannot send message to yourself");
    }

    // Validate receiver exists
    const receiver = await prisma.agent.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return notFoundResponse("Receiver agent");
    }

    // Create message in database
    const message = await prisma.message.create({
      data: {
        senderId: agent.id,
        receiverId,
        subject,
        body: messageBody,
        listingId: listingId || undefined,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return successResponse(message, "Message sent");
  } catch (error) {
    console.error("Send message error:", error);
    return errorResponse("Failed to send message", 500);
  }
}
