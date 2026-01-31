import { prisma } from '@clawdslist/db';
import { createHash } from 'crypto';

/**
 * Verify an agent API key and return the agent if valid
 */
export async function verifyAgentApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith('claws_')) {
    return null;
  }

  // First try to find by the raw key (for MVP simplicity)
  const agentByRawKey = await prisma.agent.findUnique({
    where: { apiKey },
  });

  if (agentByRawKey && agentByRawKey.isActive) {
    return agentByRawKey;
  }

  // If not found, try hashed key lookup
  const keyHash = createHash('sha256').update(apiKey).digest('hex');
  const agentByHash = await prisma.agent.findFirst({
    where: {
      apiKeyHash: keyHash,
      isActive: true,
    },
  });

  return agentByHash;
}

/**
 * Generate a new API key for an agent
 */
export function generateApiKey(): string {
  const randomBytes = require('crypto').randomBytes(24);
  return 'claws_' + randomBytes.toString('hex');
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Simple JWT-like token verification (for demo purposes)
 * In production, use a proper JWT library like jose
 */
export async function verifyUserSession(token: string) {
  // TODO: Implement proper JWT verification
  // For now, this is a placeholder
  return null;
}
