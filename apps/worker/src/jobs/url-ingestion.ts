import { prisma } from '@clawdslist/db';
import axios from 'axios';

interface UrlIngestionData {
  sourceId: string;
  url: string;
  storefrontId?: string;
}

export async function handleUrlIngestion(data: UrlIngestionData) {
  try {
    // Update status to processing
    await prisma.listingSource.update({
      where: { id: data.sourceId },
      data: { status: 'processing' },
    });

    // For MVP, we'll simulate ingestion without actual Firecrawl/Reducto API calls
    // In production, you would call the actual APIs here
    const mockData = await simulateIngestion(data.url);

    // Store raw payload
    await prisma.listingSource.update({
      where: { id: data.sourceId },
      data: { rawPayload: mockData },
    });

    // Normalize and create listing
    const normalized = normalizeData(mockData);

    // Get storefront if provided
    let storefront;
    if (data.storefrontId) {
      storefront = await prisma.storefront.findUnique({
        where: { id: data.storefrontId },
      });
    }

    const listing = await prisma.listing.create({
      data: {
        agentId: storefront?.agentId || mockData.agentId,
        storefrontId: data.storefrontId,
        title: normalized.title,
        description: normalized.description,
        price: normalized.price,
        currency: normalized.currency,
        inventory: normalized.inventory,
        condition: normalized.condition,
        status: 'draft', // Require review before going live
        mediaAssets: {
          create: normalized.images.map((url: string, index: number) => ({
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

    console.log(`Created listing ${listing.id} from URL ${data.url}`);
  } catch (error: any) {
    console.error('URL ingestion error:', error);
    
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

async function simulateIngestion(url: string) {
  // In production, this would call Firecrawl/Reducto APIs
  // For MVP, we'll return mock data
  
  console.log(`Simulating ingestion for URL: ${url}`);
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    agentId: 'mock-agent-id',
    title: 'Imported Product from ' + new URL(url).hostname,
    description: 'This is a product imported from a URL. In production, this would be extracted using Firecrawl/Reducto.',
    price: 99.99,
    currency: 'USD',
    inventory: 5,
    condition: 'new',
    images: [
      'https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Product+Image+1',
      'https://via.placeholder.com/600x400/4ecdc4/ffffff?text=Product+Image+2',
    ],
  };
}

function normalizeData(rawData: any) {
  // Normalize extracted data to our schema
  return {
    title: rawData.title || 'Untitled Product',
    description: rawData.description || 'No description available',
    price: parseFloat(rawData.price) || 0,
    currency: rawData.currency || 'USD',
    inventory: parseInt(rawData.inventory) || 1,
    condition: rawData.condition || 'new',
    images: Array.isArray(rawData.images) ? rawData.images : [],
  };
}
