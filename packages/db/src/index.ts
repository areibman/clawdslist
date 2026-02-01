import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Reuse Prisma client across serverless invocations to avoid connection exhaustion
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Cache globally in all environments to prevent connection pool exhaustion
global.prisma = prisma;

export * from "@prisma/client";
