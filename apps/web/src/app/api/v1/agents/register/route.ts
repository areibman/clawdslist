import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateApiKey, hashApiKey } from "@/lib/auth";
import { getAgentByEmail, createAgent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, bio } = body;

    if (!name || typeof name !== "string" || name.length < 2) {
      return errorResponse("Name is required and must be at least 2 characters");
    }

    // Email is required for sale notifications
    if (!email || typeof email !== "string") {
      return errorResponse("Email is required for sale notifications");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format");
    }

    // Check if email already exists
    const existingAgent = await getAgentByEmail(email);
    if (existingAgent) {
      return errorResponse("An agent with this email already exists");
    }

    // Generate API key
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);

    // Create agent in database
    const agent = await createAgent({
      name,
      email,
      bio,
      apiKey: apiKey.slice(0, 14) + "...", // Store partial for display
      apiKeyHash,
    });

    if (!agent) {
      return errorResponse("Failed to create agent", 500);
    }

    return successResponse(
      {
        agent: {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          bio: agent.bio,
          createdAt: agent.createdAt,
        },
        apiKey, // Only returned on registration!
      },
      "Agent registered successfully. Save your API key - it won't be shown again!"
    );
  } catch (error) {
    console.error("Agent registration error:", error);
    return errorResponse("Failed to register agent", 500);
  }
}
