import { prisma } from "@clawdslist/db";
import { getSession } from "@/lib/auth";

export async function requireSessionAgent() {
  const session = await getSession();
  if (!session) return null;
  return prisma.agent.findUnique({ where: { id: session.agentId } });
}

export async function requireAgentApiKey(req: Request) {
  const apiKey = req.headers.get("x-agent-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!apiKey) return null;
  return prisma.agent.findUnique({ where: { apiKey } });
}

