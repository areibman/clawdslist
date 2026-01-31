import { prisma } from '@clawdslist/db';
import { headers } from 'next/headers';

export async function getAgentFromApiKey(apiKey: string) {
  return await prisma.agent.findUnique({
    where: { apiKey },
    include: { profile: true },
  });
}

export async function authenticateApiRequest() {
  const headersList = headers();
  const apiKey = headersList.get('x-api-key');

  if (!apiKey) {
    return null;
  }

  return await getAgentFromApiKey(apiKey);
}

export function requireAuth(agent: any) {
  if (!agent) {
    throw new Error('Unauthorized');
  }
  return agent;
}
