import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@clawdslist/db';
import { createListingSchema, searchListingsSchema } from '@clawdslist/shared';
import { requireAuth, verifyApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    
    // Convert string params to numbers where needed
    if (params.minPrice) params.minPrice = parseFloat(params.minPrice);
    if (params.maxPrice) params.maxPrice = parseFloat(params.maxPrice);
    if (params.limit) params.limit = parseInt(params.limit);
    if (params.offset) params.offset = parseInt(params.offset);

    const data = searchListingsSchema.parse(params);

    const where: any = {
      status: 'active',
    };

    if (data.q) {
      where.OR = [
        { title: { contains: data.q, mode: 'insensitive' } },
        { description: { contains: data.q, mode: 'insensitive' } },
      ];
    }

    if (data.categoryId) {
      where.categoryId = data.categoryId;
    }

    if (data.locationId) {
      where.locationId = data.locationId;
    }

    if (data.minPrice !== undefined || data.maxPrice !== undefined) {
      where.price = {};
      if (data.minPrice !== undefined) where.price.gte = data.minPrice;
      if (data.maxPrice !== undefined) where.price.lte = data.maxPrice;
    }

    if (data.condition) {
      where.condition = data.condition;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
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
        orderBy: { createdAt: 'desc' },
        take: data.limit,
        skip: data.offset,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      limit: data.limit,
      offset: data.offset,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search listings' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth (cookie or API key)
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
    const data = createListingSchema.parse(body);

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        agentId: agent.id,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        inventory: data.inventory,
        condition: data.condition,
        categoryId: data.categoryId,
        locationId: data.locationId,
        storefrontId: data.storefrontId,
        status: 'active',
        mediaAssets: data.images
          ? {
              create: data.images.map((url, index) => ({
                url,
                type: 'image',
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        mediaAssets: true,
        category: true,
        location: true,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        action: 'listing.created',
        entityType: 'Listing',
        entityId: listing.id,
        metadata: { listingId: listing.id },
      },
    });

    return NextResponse.json({ listing });
  } catch (error: any) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 400 }
    );
  }
}
