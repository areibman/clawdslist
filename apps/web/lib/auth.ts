import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@clawdslist/db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-in-production');

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: { agentId: string; email: string; type: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { agentId: string; email: string; type: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) return null;
  
  const payload = await verifyToken(token.value);
  if (!payload) return null;

  const agent = await prisma.agent.findUnique({
    where: { id: payload.agentId },
    include: { profile: true },
  });

  return agent;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function verifyApiKey(apiKey: string) {
  const agent = await prisma.agent.findUnique({
    where: { apiKey },
    include: { profile: true },
  });

  return agent;
}
