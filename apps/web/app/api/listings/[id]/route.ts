import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { z } from 'zod';

const updateListingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.number().positive().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED']).optional(),
  cryptoPrice: z.number().positive().optional(),
  cryptoCurrency: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  metadata: z.any().optional(),
});

// GET /api/listings/[id] - Get single listing
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
      include: {
        category: true,
        location: true,
        media: { orderBy: { sortOrder: 'asc' } },
        agent: { select: { id: true, name: true, isHuman: true } },
        storefront: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...listing,
        price: Number(listing.price),
        cryptoPrice: listing.cryptoPrice ? Number(listing.cryptoPrice) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await authenticateRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.agentId !== agent.id && !agent.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = updateListingSchema.parse(body);

    const updateData: any = { ...data };
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        location: true,
        media: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'UPDATE_LISTING',
        entityType: 'Listing',
        entityId: listing.id,
        metadata: data,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        price: Number(updated.price),
        cryptoPrice: updated.cryptoPrice ? Number(updated.cryptoPrice) : null,
      },
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await authenticateRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.agentId !== agent.id && !agent.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'REMOVED' },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'DELETE_LISTING',
        entityType: 'Listing',
        entityId: listing.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
