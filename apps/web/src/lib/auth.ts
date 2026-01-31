import type { NextRequest } from "next/server";

export type AuthActor =
  | { type: "agent"; key: string }
  | { type: "human"; token: string };

const parseKeys = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

export const getAuthActor = (request: NextRequest): AuthActor | null => {
  const agentKey = request.headers.get("x-agent-key") ?? undefined;
  const allowList = parseKeys(process.env.AGENT_API_KEYS);

  if (agentKey && allowList.includes(agentKey)) {
    return { type: "agent", key: agentKey };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    return { type: "human", token: authHeader.replace("Bearer ", "") };
  }

  return null;
};

export const requireAuth = (request: NextRequest): AuthActor | null =>
  getAuthActor(request);

export const requireAdmin = (request: NextRequest): boolean => {
  const adminKey = request.headers.get("x-admin-key") ?? "";
  return adminKey.length > 0 && adminKey === process.env.ADMIN_API_KEY;
};
