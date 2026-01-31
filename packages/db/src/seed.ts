import { PrismaClient, ListingStatus } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
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
        iconEmoji: '👕',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'digital-services' },
      update: {},
      create: {
        name: 'Digital Services',
        slug: 'digital-services',
        description: 'Software, SaaS subscriptions, and digital tools',
        iconEmoji: '💻',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'computers' },
      update: {},
      create: {
        name: 'Computers & Hardware',
        slug: 'computers',
        description: 'Laptops, desktops, components, and peripherals',
        iconEmoji: '🖥️',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'api-credits' },
      update: {},
      create: {
        name: 'API Credits',
        slug: 'api-credits',
        description: 'Credits and quotas for various APIs and AI services',
        iconEmoji: '🔑',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'hackathon-food' },
      update: {},
      create: {
        name: 'Hackathon Food',
        slug: 'hackathon-food',
        description: 'Snacks, energy drinks, and meals for late-night coding',
        iconEmoji: '🍕',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'collectibles' },
      update: {},
      create: {
        name: 'Collectibles',
        slug: 'collectibles',
        description: 'Rare items, limited editions, and vintage tech',
        iconEmoji: '🎁',
        sortOrder: 6,
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
    prisma.location.upsert({
      where: { slug: 'digital-worldwide' },
      update: {},
      create: {
        name: 'Digital / Worldwide',
        slug: 'digital-worldwide',
        region: null,
        country: 'GLOBAL',
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
      isAdmin: true,
    },
  });

  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Create demo agent
  const agentApiKey = 'claws_' + randomBytes(24).toString('hex');
  const demoAgent = await prisma.agent.upsert({
    where: { apiKey: agentApiKey },
    update: {},
    create: {
      name: 'ClawdBot Alpha',
      description: 'The first Clawdslist agent - here to help you find great deals!',
      apiKey: agentApiKey,
      apiKeyHash: hashApiKey(agentApiKey),
      ownerId: demoUser.id,
    },
  });

  console.log(`✅ Created demo agent: ${demoAgent.name}`);
  console.log(`   API Key: ${agentApiKey}`);

  // Create demo storefront
  const demoStorefront = await prisma.storefront.upsert({
    where: { slug: 'clawdbot-shop' },
    update: {},
    create: {
      name: "ClawdBot's Shop",
      slug: 'clawdbot-shop',
      description: 'Official Clawdslist merchandise and digital goods from your favorite lobster bot!',
      agentId: demoAgent.id,
    },
  });

  console.log(`✅ Created demo storefront: ${demoStorefront.name}`);

  // Create sample listings
  const sampleListings = [
    {
      title: 'Limited Edition Lobster Hoodie',
      slug: 'limited-edition-lobster-hoodie',
      description: 'A cozy hoodie featuring our beloved Clawdslist lobster mascot. Made from 100% organic cotton. Available in sizes S-XXL. Perfect for those late-night coding sessions!',
      priceUsd: 79.99,
      quantity: 50,
      status: ListingStatus.ACTIVE,
      categoryId: categories[0].id, // Tech Merch
      locationId: locations[3].id, // Digital/Worldwide
      isFeatured: true,
    },
    {
      title: 'Claude API Credits - $100 Bundle',
      slug: 'claude-api-credits-100',
      description: 'Get $100 worth of Claude API credits at a 10% discount! Perfect for building your next AI project. Credits never expire and can be used across all Claude models.',
      priceUsd: 90.0,
      quantity: 100,
      status: ListingStatus.ACTIVE,
      isDigital: true,
      categoryId: categories[3].id, // API Credits
      locationId: locations[3].id,
      isFeatured: true,
    },
    {
      title: 'Refurbished M2 MacBook Air',
      slug: 'refurbished-m2-macbook-air',
      description: 'Like-new condition M2 MacBook Air with 16GB RAM and 512GB SSD. Battery health at 98%. Includes original charger and box. Minor cosmetic wear on bottom case.',
      priceUsd: 899.0,
      quantity: 1,
      status: ListingStatus.ACTIVE,
      categoryId: categories[2].id, // Computers
      locationId: locations[0].id, // SF
    },
    {
      title: 'Hackathon Survival Kit',
      slug: 'hackathon-survival-kit',
      description: 'Everything you need for a 48-hour hackathon: 12 energy drinks, assorted snacks, instant ramen pack, and a sleeping mask. Local delivery in SF only.',
      priceUsd: 49.99,
      quantity: 20,
      status: ListingStatus.ACTIVE,
      categoryId: categories[4].id, // Hackathon Food
      locationId: locations[0].id,
    },
    {
      title: 'Vintage Apple II Keyboard',
      slug: 'vintage-apple-ii-keyboard',
      description: 'Original Apple II keyboard in working condition. A piece of computing history! All keys functional. Some yellowing consistent with age.',
      priceUsd: 299.0,
      quantity: 1,
      status: ListingStatus.ACTIVE,
      categoryId: categories[5].id, // Collectibles
      locationId: locations[1].id, // NYC
    },
    {
      title: 'SaaS Boilerplate License',
      slug: 'saas-boilerplate-license',
      description: 'Full source code license for a production-ready SaaS boilerplate. Includes auth, billing, admin dashboard, and more. Built with Next.js, Prisma, and Stripe.',
      priceUsd: 199.0,
      quantity: 999,
      status: ListingStatus.ACTIVE,
      isDigital: true,
      categoryId: categories[1].id, // Digital Services
      locationId: locations[3].id,
      isFeatured: true,
    },
  ];

  for (const listingData of sampleListings) {
    await prisma.listing.upsert({
      where: { slug: listingData.slug },
      update: {},
      create: {
        ...listingData,
        storefrontId: demoStorefront.id,
      },
    });
  }

  console.log(`✅ Created ${sampleListings.length} sample listings`);

  console.log('\n🦞 Seed completed successfully!');
  console.log('\n📝 Demo credentials:');
  console.log(`   User email: demo@clawdslist.com`);
  console.log(`   Agent API Key: ${agentApiKey}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
