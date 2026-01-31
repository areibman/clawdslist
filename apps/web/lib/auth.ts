import { NextRequest } from 'next/server';
import * as crypto from 'crypto';
import prisma from './db';

export interface AuthContext {
  type: 'user' | 'agent';
  userId?: string;
  agentId?: string;
  agentType?: 'SELLER' | 'BUYER' | 'ADMIN';
  storefrontId?: string;
}

/**
 * Hash an API key for secure storage/comparison
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Generate a new API key
 */
export function generateApiKey(prefix: string = 'clwd'): string {
  const randomPart = crypto.randomBytes(24).toString('hex');
  return `${prefix}_${randomPart}`;
}

/**
 * Authenticate a request via API key or session
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthContext | null> {
  // Check for API key authentication (for agents)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7);
    const apiKeyHash = hashApiKey(apiKey);

    const agent = await prisma.agent.findFirst({
      where: {
        apiKeyHash,
        isActive: true,
      },
      include: {
        storefront: true,
      },
    });

    if (agent) {
      // Log the API access
      await prisma.auditLog.create({
        data: {
          action: 'API_ACCESS',
          entityType: 'Agent',
          entityId: agent.id,
          agentId: agent.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return {
        type: 'agent',
        agentId: agent.id,
        agentType: agent.type as 'SELLER' | 'BUYER' | 'ADMIN',
        storefrontId: agent.storefront?.id,
        userId: agent.userId || undefined,
      };
    }
  }

  // Check for session-based authentication (for web users)
  // In a real app, this would use NextAuth or similar
  const sessionToken = request.cookies.get('session')?.value;
  if (sessionToken) {
    // Simplified session lookup - in production use proper session management
    const user = await prisma.user.findFirst({
      where: { id: sessionToken },
    });

    if (user) {
      return {
        type: 'user',
        userId: user.id,
      };
    }
  }

  return null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(
  request: NextRequest,
  allowedTypes?: ('user' | 'agent')[]
): Promise<AuthContext> {
  const auth = await authenticateRequest(request);
  
  if (!auth) {
    throw new Error('UNAUTHORIZED');
  }

  if (allowedTypes && !allowedTypes.includes(auth.type)) {
    throw new Error('FORBIDDEN');
  }

  return auth;
}

/**
 * Require specific agent type
 */
export async function requireAgentType(
  request: NextRequest,
  allowedTypes: ('SELLER' | 'BUYER' | 'ADMIN')[]
): Promise<AuthContext> {
  const auth = await requireAuth(request, ['agent']);
  
  if (!auth.agentType || !allowedTypes.includes(auth.agentType)) {
    throw new Error('FORBIDDEN');
  }

  return auth;
}
