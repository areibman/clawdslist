import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { createMessageSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received';

    const messages = await prisma.message.findMany({
      where:
        type === 'sent'
          ? { senderId: agent.id }
          : { receiverId: agent.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    let agent;
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey) {
      agent = await verifyApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else {
      agent = await requireAuth();
    }

    const body = await request.json();
    const data = createMessageSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        senderId: agent.id,
        receiverId: data.receiverId,
        listingId: data.listingId,
        subject: data.subject,
        body: data.body,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 400 }
    );
  }
}
