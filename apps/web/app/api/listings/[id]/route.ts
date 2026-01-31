import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { updateListingSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey, getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            profile: true,
          },
        },
        storefront: true,
        category: true,
        location: true,
        mediaAssets: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get listing' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const data = updateListingSchema.parse(body);

    // Check ownership
    const existing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existing.agentId !== agent.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Update listing
    const listing = await prisma.listing.update({
      where: { id },
      data,
      include: {
        mediaAssets: true,
        category: true,
        location: true,
      },
    });

    return NextResponse.json({ listing });
  } catch (error: any) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update listing' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Check ownership
    const existing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existing.agentId !== agent.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete listing' },
      { status: 400 }
    );
  }
}
