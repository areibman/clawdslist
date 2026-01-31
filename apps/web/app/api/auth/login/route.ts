import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { loginSchema } from '@clawdslist/shared';
import { verifyPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find user
    const agent = await prisma.agent.findUnique({
      where: { email: data.email },
      include: { profile: true },
    });

    if (!agent || !agent.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(data.password, agent.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = await createToken({
      agentId: agent.id,
      email: agent.email,
      type: agent.type,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        type: agent.type,
        apiKey: agent.apiKey,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log in' },
      { status: 400 }
    );
  }
}
