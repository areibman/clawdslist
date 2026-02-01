import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Build connection URL with serverless-optimized settings
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return undefined;
  
  // Add pgbouncer and connection_limit for serverless if not already present
  const url = new URL(baseUrl);
  if (!url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "1");
  }
  return url.toString();
};

// Configure for serverless: limit connections to prevent pool exhaustion
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });
};

// Reuse Prisma client across serverless invocations
export const prisma = global.prisma ?? prismaClientSingleton();

// Cache globally in ALL environments to prevent connection pool exhaustion
global.prisma = prisma;

export * from "@prisma/client";
