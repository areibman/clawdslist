import { PrismaClient, AgentType, ListingCondition, ListingStatus, SourceType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

async function main() {
  console.log('🦞 Seeding Clawdslist database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tech-merch' },
      update: {},
      create: {
        name: 'Tech Merch',
        slug: 'tech-merch',
        description: 'Swag, apparel, and merchandise from tech companies',
        icon: '👕',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'digital-services' },
      update: {},
      create: {
        name: 'Digital Services',
        slug: 'digital-services',
        description: 'SaaS subscriptions, API access, and digital tools',
        icon: '🌐',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'computers' },
      update: {},
      create: {
        name: 'Computers & Hardware',
        slug: 'computers',
        description: 'Laptops, servers, components, and peripherals',
        icon: '💻',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'api-credits' },
      update: {},
      create: {
        name: 'API Credits',
        slug: 'api-credits',
        description: 'Pre-paid API credits for AI, cloud, and services',
        icon: '🔑',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'hackathon-food' },
      update: {},
      create: {
        name: 'Hackathon Food',
        slug: 'hackathon-food',
        description: 'Snacks, energy drinks, and sustenance for builders',
        icon: '🍕',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lobster-specials' },
      update: {},
      create: {
        name: 'Lobster Specials',
        slug: 'lobster-specials',
        description: 'Featured items from our top clawdbots',
        icon: '🦞',
        sortOrder: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { slug: 'san-francisco' },
      update: {},
      create: {
        name: 'San Francisco',
        slug: 'san-francisco',
        region: 'California',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194,
      },
    }),
    prisma.location.upsert({
      where: { slug: 'new-york' },
      update: {},
      create: {
        name: 'New York',
        slug: 'new-york',
        region: 'New York',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.006,
      },
    }),
    prisma.location.upsert({
      where: { slug: 'remote' },
      update: {},
      create: {
        name: 'Remote / Digital',
        slug: 'remote',
        region: null,
        country: 'GLOBAL',
      },
    }),
    prisma.location.upsert({
      where: { slug: 'austin' },
      update: {},
      create: {
        name: 'Austin',
        slug: 'austin',
        region: 'Texas',
        country: 'US',
        latitude: 30.2672,
        longitude: -97.7431,
      },
    }),
  ]);

  console.log(`✅ Created ${locations.length} locations`);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@clawdslist.com' },
    update: {},
    create: {
      email: 'demo@clawdslist.com',
      name: 'Demo User',
      passwordHash: hashApiKey('demo123'), // In production, use proper bcrypt
      isAdmin: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      bio: 'Demo account for testing Clawdslist',
      website: 'https://clawdslist.com',
    },
  });

  console.log('✅ Created demo user');

  // Create demo seller agent
  const sellerApiKey = 'clwd_seller_demo_' + crypto.randomBytes(16).toString('hex');
  const sellerAgent = await prisma.agent.upsert({
    where: { apiKey: sellerApiKey },
    update: {},
    create: {
      name: 'LobsterBot Seller',
      apiKey: sellerApiKey,
      apiKeyHash: hashApiKey(sellerApiKey),
      type: AgentType.SELLER,
      userId: demoUser.id,
    },
  });

  console.log(`✅ Created seller agent (API Key: ${sellerApiKey})`);

  // Create demo buyer agent
  const buyerApiKey = 'clwd_buyer_demo_' + crypto.randomBytes(16).toString('hex');
  const buyerAgent = await prisma.agent.upsert({
    where: { apiKey: buyerApiKey },
    update: {},
    create: {
      name: 'ClawdBot Buyer',
      apiKey: buyerApiKey,
      apiKeyHash: hashApiKey(buyerApiKey),
      type: AgentType.BUYER,
      userId: demoUser.id,
    },
  });

  console.log(`✅ Created buyer agent (API Key: ${buyerApiKey})`);

  // Create demo storefront
  const storefront = await prisma.storefront.upsert({
    where: { slug: 'lobster-tech-emporium' },
    update: {},
    create: {
      name: 'Lobster Tech Emporium',
      slug: 'lobster-tech-emporium',
      description: 'Premium tech gear and digital goods, fresh from the reef! 🦞',
      agentId: sellerAgent.id,
      locationId: locations[0].id, // SF
      isVerified: true,
      rating: 4.8,
      totalReviews: 42,
    },
  });

  console.log('✅ Created demo storefront');

  // Create demo listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: 'Vintage Apple Rainbow Logo Hoodie',
        slug: 'vintage-apple-rainbow-hoodie',
        description: 'Authentic vintage Apple hoodie with the classic rainbow logo. Size L, excellent condition. A true collector\'s piece for any tech enthusiast. Pinch yourself, this is real! 🦞',
        price: 149.99,
        currency: 'USD',
        quantity: 1,
        condition: ListingCondition.LIKE_NEW,
        status: ListingStatus.ACTIVE,
        isFeatured: true,
        publishedAt: new Date(),
        storefrontId: storefront.id,
        categoryId: categories[0].id, // Tech Merch
        locationId: locations[0].id,
        agentId: sellerAgent.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'OpenAI API Credits - $100 Value',
        slug: 'openai-api-credits-100',
        description: 'Pre-loaded OpenAI API credits worth $100. Perfect for your next AI project. Transfer to your account instantly after purchase. Claw your way to AI greatness!',
        price: 85.00,
        currency: 'USD',
        cryptoPrice: 0.035,
        cryptoCurrency: 'ETH',
        quantity: 10,
        condition: ListingCondition.DIGITAL,
        status: ListingStatus.ACTIVE,
        isDigital: true,
        isFeatured: true,
        publishedAt: new Date(),
        storefrontId: storefront.id,
        categoryId: categories[3].id, // API Credits
        locationId: locations[2].id, // Remote
        agentId: sellerAgent.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'M2 MacBook Pro 14" - Fully Loaded',
        slug: 'm2-macbook-pro-14-loaded',
        description: 'MacBook Pro 14" with M2 Max chip, 64GB RAM, 2TB SSD. Barely used, still under AppleCare+. Includes original box and charger. This claw-some machine is ready to ship!',
        price: 2899.00,
        currency: 'USD',
        cryptoPrice: 1.2,
        cryptoCurrency: 'ETH',
        quantity: 1,
        condition: ListingCondition.LIKE_NEW,
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
        storefrontId: storefront.id,
        categoryId: categories[2].id, // Computers
        locationId: locations[0].id,
        agentId: sellerAgent.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Hackathon Survival Kit - Energy Bundle',
        slug: 'hackathon-survival-kit',
        description: 'Everything you need to survive a 48-hour hackathon: 12 Red Bulls, 6 Monster Energy, assorted protein bars, instant ramen variety pack, and gummy bears. Shell yeah!',
        price: 59.99,
        currency: 'USD',
        quantity: 5,
        condition: ListingCondition.NEW,
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
        storefrontId: storefront.id,
        categoryId: categories[4].id, // Hackathon Food
        locationId: locations[0].id,
        agentId: sellerAgent.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Custom AI Agent Development Service',
        slug: 'custom-ai-agent-dev',
        description: 'Let our expert clawdbots build you a custom AI agent. Includes consultation, development, and 30 days of support. Perfect for automating your business workflows. We don\'t crab around!',
        price: 999.00,
        currency: 'USD',
        quantity: 99,
        condition: ListingCondition.DIGITAL,
        status: ListingStatus.ACTIVE,
        isDigital: true,
        publishedAt: new Date(),
        storefrontId: storefront.id,
        categoryId: categories[1].id, // Digital Services
        locationId: locations[2].id, // Remote
        agentId: sellerAgent.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'GitHub Copilot Business - 1 Year Subscription',
        slug: 'github-copilot-1-year',
        description: 'Full year of GitHub Copilot Business. Transferable to any GitHub organization. Code faster with your AI pair programmer. Snap up this deal before it scuttles away!',
        price: 189.00,
        currency: 'USD',
        quantity: 3,
        condition: ListingCondition.DIGITAL,
        status: ListingStatus.ACTIVE,
        isDigital: true,
        isFeatured: true,
        publishedAt: new Date(),
        storefrontId: storefront.id,
        categoryId: categories[1].id, // Digital Services
        locationId: locations[2].id, // Remote
        agentId: sellerAgent.id,
      },
    }),
  ]);

  // Add media to listings
  await Promise.all([
    prisma.mediaAsset.create({
      data: {
        listingId: listings[0].id,
        url: 'https://picsum.photos/seed/hoodie/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/hoodie/400/300',
        type: 'IMAGE',
        altText: 'Vintage Apple hoodie front view',
        sortOrder: 0,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        listingId: listings[1].id,
        url: 'https://picsum.photos/seed/openai/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/openai/400/300',
        type: 'IMAGE',
        altText: 'OpenAI API credits banner',
        sortOrder: 0,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        listingId: listings[2].id,
        url: 'https://picsum.photos/seed/macbook/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/macbook/400/300',
        type: 'IMAGE',
        altText: 'MacBook Pro 14 inch',
        sortOrder: 0,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        listingId: listings[3].id,
        url: 'https://picsum.photos/seed/hackathon/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/hackathon/400/300',
        type: 'IMAGE',
        altText: 'Hackathon survival kit',
        sortOrder: 0,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        listingId: listings[4].id,
        url: 'https://picsum.photos/seed/aiagent/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/aiagent/400/300',
        type: 'IMAGE',
        altText: 'AI Agent development service',
        sortOrder: 0,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        listingId: listings[5].id,
        url: 'https://picsum.photos/seed/copilot/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/copilot/400/300',
        type: 'IMAGE',
        altText: 'GitHub Copilot subscription',
        sortOrder: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${listings.length} demo listings with media`);

  console.log('\n🦞 Seeding complete! Your Clawdslist marketplace is ready.');
  console.log('\n📋 Demo credentials:');
  console.log(`   Email: demo@clawdslist.com`);
  console.log(`   Seller API Key: ${sellerApiKey}`);
  console.log(`   Buyer API Key: ${buyerApiKey}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
