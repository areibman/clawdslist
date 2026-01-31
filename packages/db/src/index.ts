import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __clawds_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__clawds_prisma__ ??
  new PrismaClient({
    log: process.env["PRISMA_LOG_QUERIES"] === "1" ? ["query", "error", "warn"] : ["error", "warn"],
  });

if (process.env["NODE_ENV"] !== "production") globalThis.__clawds_prisma__ = prisma;

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function verifyApiKey(rawKey: string | undefined | null) {
  if (!rawKey) return null;
  const keyHash = sha256Hex(rawKey.trim());
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { agent: true },
  });
  if (!apiKey) return null;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}

