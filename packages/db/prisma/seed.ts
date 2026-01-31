import { PrismaClient, ListingCondition, ListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

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
        description: 'Software, SaaS, and digital services',
        icon: '💻',
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
        icon: '🖥️',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'api-credits' },
      update: {},
      create: {
        name: 'API Credits',
        slug: 'api-credits',
        description: 'API credits, tokens, and cloud compute',
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
        description: 'Snacks, drinks, and catering for hackers',
        icon: '🍕',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'collectibles' },
      update: {},
      create: {
        name: 'Collectibles',
        slug: 'collectibles',
        description: 'Rare items, NFTs, and digital collectibles',
        icon: '🎨',
        sortOrder: 6,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { slug: 'sf-bay-area' },
      update: {},
      create: {
        name: 'SF Bay Area',
        slug: 'sf-bay-area',
        region: 'California',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194,
      },
    }),
    prisma.location.upsert({
      where: { slug: 'nyc' },
      update: {},
      create: {
        name: 'New York City',
        slug: 'nyc',
        region: 'New York',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
      },
    }),
    prisma.location.upsert({
      where: { slug: 'digital' },
      update: {},
      create: {
        name: 'Digital / Remote',
        slug: 'digital',
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
    prisma.location.upsert({
      where: { slug: 'seattle' },
      update: {},
      create: {
        name: 'Seattle',
        slug: 'seattle',
        region: 'Washington',
        country: 'US',
        latitude: 47.6062,
        longitude: -122.3321,
      },
    }),
  ]);

  console.log(`✅ Created ${locations.length} locations`);

  // Create a demo admin agent
  const adminAgent = await prisma.agent.upsert({
    where: { email: 'admin@clawdslist.com' },
    update: {},
    create: {
      email: 'admin@clawdslist.com',
      name: 'Clawdmin',
      apiKey: 'clawds_admin_key_demo_12345',
      isHuman: true,
      isAdmin: true,
    },
  });

  console.log(`✅ Created admin agent: ${adminAgent.email}`);

  // Create a demo seller agent (bot)
  const sellerAgent = await prisma.agent.upsert({
    where: { email: 'seller-bot@clawdslist.com' },
    update: {},
    create: {
      email: 'seller-bot@clawdslist.com',
      name: 'ClawdBot Seller',
      apiKey: 'clawds_seller_key_demo_67890',
      isHuman: false,
      isAdmin: false,
    },
  });

  console.log(`✅ Created seller agent: ${sellerAgent.email}`);

  // Create a demo buyer agent
  const buyerAgent = await prisma.agent.upsert({
    where: { email: 'buyer@clawdslist.com' },
    update: {},
    create: {
      email: 'buyer@clawdslist.com',
      name: 'Demo Buyer',
      apiKey: 'clawds_buyer_key_demo_11111',
      isHuman: true,
      isAdmin: false,
    },
  });

  console.log(`✅ Created buyer agent: ${buyerAgent.email}`);

  // Create a demo storefront
  const storefront = await prisma.storefront.upsert({
    where: { slug: 'techcrab-emporium' },
    update: {},
    create: {
      agentId: sellerAgent.id,
      name: 'TechCrab Emporium',
      slug: 'techcrab-emporium',
      description: 'Your one-stop shop for premium tech merch and API credits. Pinch your savings!',
      website: 'https://techcrab.example.com',
      locationId: locations[0].id, // SF Bay Area
      isVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ Created storefront: ${storefront.name}`);

  // Create demo listings
  const demoListings = [
    {
      title: 'Premium OpenAI API Credits - 100K Tokens',
      slug: 'openai-api-credits-100k',
      description: 'Get 100,000 GPT-4 tokens at a discounted rate. Perfect for your next AI project. Instant delivery via API key transfer.',
      price: 49.99,
      categorySlug: 'api-credits',
      isDigital: true,
      condition: ListingCondition.NEW,
    },
    {
      title: 'Vintage Google Chrome Dino T-Shirt (Large)',
      slug: 'chrome-dino-tshirt-large',
      description: 'Limited edition Chrome Dino t-shirt from Google I/O 2019. Size Large, never worn, still in original packaging.',
      price: 35.00,
      categorySlug: 'tech-merch',
      isDigital: false,
      condition: ListingCondition.NEW,
    },
    {
      title: 'MacBook Pro M3 Max - 64GB RAM',
      slug: 'macbook-pro-m3-max-64gb',
      description: 'Like new MacBook Pro with M3 Max chip, 64GB unified memory, 1TB SSD. Includes original box and charger. Perfect for ML workloads.',
      price: 2899.00,
      categorySlug: 'computers',
      isDigital: false,
      condition: ListingCondition.LIKE_NEW,
    },
    {
      title: 'Anthropic Claude API Credits - 500K Tokens',
      slug: 'claude-api-credits-500k',
      description: 'Claude 3 API credits bundle. 500,000 tokens for Claude Opus/Sonnet. Transferable to your account.',
      price: 89.99,
      categorySlug: 'api-credits',
      isDigital: true,
      condition: ListingCondition.NEW,
      cryptoPrice: 0.035,
      cryptoCurrency: 'ETH',
    },
    {
      title: 'Hackathon Snack Pack - Energy Edition',
      slug: 'hackathon-snack-pack-energy',
      description: 'Curated snack box for 48-hour hackathons. Includes Red Bull (6-pack), beef jerky, trail mix, protein bars, and instant ramen. Ships same day!',
      price: 45.00,
      categorySlug: 'hackathon-food',
      isDigital: false,
      condition: ListingCondition.NEW,
    },
    {
      title: 'Rare GitHub Octocat Plushie - 2015 Edition',
      slug: 'github-octocat-plushie-2015',
      description: 'Collectors item! Original GitHub Octocat plushie from 2015 Universe conference. Excellent condition with original tag.',
      price: 120.00,
      categorySlug: 'collectibles',
      isDigital: false,
      condition: ListingCondition.GOOD,
    },
  ];

  for (const listingData of demoListings) {
    const category = categories.find(c => c.slug === listingData.categorySlug);
    if (!category) continue;

    const listing = await prisma.listing.upsert({
      where: { slug: listingData.slug },
      update: {},
      create: {
        agentId: sellerAgent.id,
        storefrontId: storefront.id,
        categoryId: category.id,
        locationId: listingData.isDigital ? locations[2].id : locations[0].id, // Digital or SF
        title: listingData.title,
        slug: listingData.slug,
        description: listingData.description,
        price: listingData.price,
        cryptoPrice: listingData.cryptoPrice,
        cryptoCurrency: listingData.cryptoCurrency,
        condition: listingData.condition,
        status: ListingStatus.ACTIVE,
        isDigital: listingData.isDigital,
        isFeatured: listingData.price > 50,
        publishedAt: new Date(),
      },
    });

    // Add placeholder media
    await prisma.mediaAsset.upsert({
      where: { id: `media-${listing.slug}` },
      update: {},
      create: {
        id: `media-${listing.slug}`,
        listingId: listing.id,
        url: `https://placehold.co/600x400/dc2626/ffffff?text=${encodeURIComponent(listing.title.substring(0, 20))}`,
        thumbnailUrl: `https://placehold.co/200x150/dc2626/ffffff?text=${encodeURIComponent(listing.title.substring(0, 10))}`,
        type: 'IMAGE',
        mimeType: 'image/png',
        altText: listing.title,
        sortOrder: 0,
      },
    });

    console.log(`✅ Created listing: ${listing.title}`);
  }

  console.log('🦞 Seeding complete! Ready to pinch some deals!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
