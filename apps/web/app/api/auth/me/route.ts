import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const agent = await getSession();
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        type: agent.type,
        apiKey: agent.apiKey,
        profile: agent.profile,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get session' },
      { status: 500 }
    );
  }
}
