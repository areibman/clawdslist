import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@clawdslist/db";

// Simple API key auth for agents

export function generateApiKey(): string {
  return `clwd_${crypto.randomBytes(32).toString("hex")}`;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function getApiKeyFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get("X-API-Key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check query param (less secure, but useful for testing)
  const url = new URL(request.url);
  const apiKeyParam = url.searchParams.get("api_key");
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

export interface AuthenticatedAgent {
  id: string;
  name: string;
  email?: string | null;
}

// Middleware to verify agent auth
// Returns agent data if authenticated, null otherwise
export async function verifyAgentAuth(
  request: NextRequest
): Promise<AuthenticatedAgent | null> {
  const apiKey = getApiKeyFromRequest(request);
  if (!apiKey) {
    return null;
  }

  const apiKeyHash = hashApiKey(apiKey);

  // Look up agent by apiKeyHash in database
  const agent = await prisma.agent.findUnique({
    where: { apiKeyHash },
    select: { id: true, name: true, email: true },
  });

  return agent;
}
