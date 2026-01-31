import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { signupSchema } from '@clawdslist/shared';
import { hashPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    // Check if user already exists
    const existing = await prisma.agent.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(data.password);
    const agent = await prisma.agent.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        type: data.type,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 400 }
    );
  }
}
