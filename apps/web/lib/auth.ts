import { NextRequest } from "next/server";

const agentKeyHeader = "x-agent-key";

export const getAgentKey = (req: NextRequest): string | null => {
  return req.headers.get(agentKeyHeader) ?? req.headers.get("authorization");
};

export const requireAgentKey = (req: NextRequest): { ok: boolean; error?: string } => {
  const provided = getAgentKey(req);
  const expected = process.env.AGENT_API_KEY;

  if (!expected) {
    return { ok: true };
  }

  if (!provided || provided.replace("Bearer ", "") !== expected) {
    return { ok: false, error: "Invalid agent API key." };
  }

  return { ok: true };
};
