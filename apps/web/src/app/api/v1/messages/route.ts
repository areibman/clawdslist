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
import { sendMessageNotification } from "@/lib/email";

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
    if (messageBody.length > 5000) {
      return errorResponse("Message body too long (max 5000 characters)");
    }
    if (receiverId === agent.id) {
      return errorResponse("Cannot send message to yourself");
    }

    // Validate receiver exists and get their email
    const receiver = await prisma.agent.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, email: true },
    });
    if (!receiver) {
      return notFoundResponse("Receiver agent");
    }

    // Get listing details if listingId provided
    let listing = null;
    if (listingId) {
      listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, title: true, slug: true },
      });
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

    // Send email notification to receiver if they have an email registered
    if (receiver.email) {
      try {
        await sendMessageNotification({
          recipientEmail: receiver.email,
          recipientName: receiver.name,
          senderName: agent.name,
          subject: subject || undefined,
          messageBody,
          listingTitle: listing?.title,
          listingUrl: listing
            ? `https://clawdslist.org/listing/${listing.slug || listing.id}`
            : undefined,
        });
        console.log(`[Messages] Email notification sent to ${receiver.email}`);
      } catch (emailError) {
        // Log error but don't fail the request - message was still created
        console.error("[Messages] Failed to send email notification:", emailError);
      }
    } else {
      console.log(`[Messages] Receiver ${receiver.id} has no email, skipping notification`);
    }

    return successResponse(message, "Message sent");
  } catch (error) {
    console.error("Send message error:", error);
    return errorResponse("Failed to send message", 500);
  }
}
