import { NextRequest } from 'next/server';
import prisma from '@/lib/db';

export interface AuthenticatedAgent {
  id: string;
  email: string;
  name: string;
  isHuman: boolean;
  isAdmin: boolean;
}

export async function authenticateRequest(req: NextRequest): Promise<AuthenticatedAgent | null> {
  // Check for API key in header
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return null;
  }

  try {
    const agent = await prisma.agent.findUnique({
      where: { apiKey },
      select: {
        id: true,
        email: true,
        name: true,
        isHuman: true,
        isAdmin: true,
      },
    });

    return agent;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function requireAuth(agent: AuthenticatedAgent | null): asserts agent is AuthenticatedAgent {
  if (!agent) {
    throw new Error('Authentication required');
  }
}

export function requireAdmin(agent: AuthenticatedAgent | null): asserts agent is AuthenticatedAgent {
  requireAuth(agent);
  if (!agent.isAdmin) {
    throw new Error('Admin access required');
  }
}
