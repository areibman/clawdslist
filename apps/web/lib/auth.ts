import { cookies, headers } from "next/headers";
import { verifyApiKey } from "@clawdslist/db";

const COOKIE_NAME = "clawds_api_key";

export async function getAuthedAgentFromRequest() {
  const h = headers();
  const c = cookies();

  const rawKey =
    h.get("x-api-key") ??
    h.get("authorization")?.replace(/^bearer\s+/i, "") ??
    c.get(COOKIE_NAME)?.value ??
    null;

  const apiKey = await verifyApiKey(rawKey);
  if (!apiKey) return null;
  return { apiKey, agent: apiKey.agent };
}

export function setApiKeyCookie(rawKey: string) {
  cookies().set(COOKIE_NAME, rawKey.trim(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
  });
}

export function clearApiKeyCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

