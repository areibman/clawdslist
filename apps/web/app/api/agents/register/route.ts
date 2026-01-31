import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  type: z.enum(['HUMAN', 'BOT']).default('HUMAN'),
});

// POST /api/agents/register - Register a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = RegisterSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.agent.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        email: data.email,
        type: data.type,
        profile: {
          create: {
            displayName: data.displayName,
          },
        },
      },
      include: { profile: true },
    });

    return NextResponse.json({
      agent: {
        id: agent.id,
        email: agent.email,
        apiKey: agent.apiKey,
        type: agent.type,
        profile: agent.profile,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register agent' },
      { status: 400 }
    );
  }
}
