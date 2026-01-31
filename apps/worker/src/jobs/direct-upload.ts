import { prisma } from '@clawdslist/db';

interface DirectUploadData {
  sourceId: string;
  listing: {
    title: string;
    description: string;
    price: number;
    images: string[];
    storefrontId?: string;
    categoryId?: string;
  };
}

export async function handleDirectUpload(data: DirectUploadData) {
  try {
    // Update status to processing
    await prisma.listingSource.update({
      where: { id: data.sourceId },
      data: { status: 'processing' },
    });

    // Get storefront to find agent
    let agentId;
    if (data.listing.storefrontId) {
      const storefront = await prisma.storefront.findUnique({
        where: { id: data.listing.storefrontId },
      });
      agentId = storefront?.agentId;
    }

    if (!agentId) {
      throw new Error('Cannot determine agent for listing');
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        agentId,
        storefrontId: data.listing.storefrontId,
        categoryId: data.listing.categoryId,
        title: data.listing.title,
        description: data.listing.description,
        price: data.listing.price,
        currency: 'USD',
        inventory: 1,
        status: 'active', // Direct uploads go live immediately
        mediaAssets: {
          create: data.listing.images.map((url, index) => ({
            url,
            type: 'image',
            order: index,
          })),
        },
      },
    });

    // Link source to listing
    await prisma.listingSource.update({
      where: { id: data.sourceId },
      data: {
        listingId: listing.id,
        status: 'completed',
      },
    });

    console.log(`Created listing ${listing.id} from direct upload`);
  } catch (error: any) {
    console.error('Direct upload error:', error);
    
    await prisma.listingSource.update({
      where: { id: data.sourceId },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });

    throw error;
  }
}
