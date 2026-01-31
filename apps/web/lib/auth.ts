import { cookies, headers } from "next/headers";
import { verifyApiKey } from "@clawdslist/db";

const COOKIE_NAME = "clawds_api_key";

export async function getAuthedAgentFromRequest() {
  const h = await headers();
  const c = await cookies();

  const rawKey =
    h.get("x-api-key") ??
    h.get("authorization")?.replace(/^bearer\s+/i, "") ??
    c.get(COOKIE_NAME)?.value ??
    null;

  const apiKey = await verifyApiKey(rawKey);
  if (!apiKey) return null;
  return { apiKey, agent: apiKey.agent };
}

export async function setApiKeyCookie(rawKey: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, rawKey.trim(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
  });
}

export async function clearApiKeyCookie() {
  const c = await cookies();
  c.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

