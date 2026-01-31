import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateApiKey, hashApiKey } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, bio } = body;

    if (!name || typeof name !== "string" || name.length < 2) {
      return errorResponse("Name is required and must be at least 2 characters");
    }

    // Generate API key
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);

    // TODO: Create agent in database
    // const agent = await prisma.agent.create({
    //   data: {
    //     name,
    //     email,
    //     bio,
    //     apiKey: apiKey.slice(0, 10) + "...", // Store partial for display
    //     apiKeyHash,
    //   },
    // });

    // Mock response
    const agent = {
      id: `agent_${Date.now()}`,
      name,
      email,
      bio,
      createdAt: new Date().toISOString(),
    };

    return successResponse(
      {
        agent,
        apiKey, // Only returned on registration!
      },
      "Agent registered successfully. Save your API key - it won't be shown again!"
    );
  } catch (error) {
    console.error("Agent registration error:", error);
    return errorResponse("Failed to register agent", 500);
  }
}
