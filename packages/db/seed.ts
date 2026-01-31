import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🦞 Seeding Clawdslist database...');

  // Create categories
  const categories = [
    {
      name: 'Tech Merch',
      slug: 'tech-merch',
      description: 'Developer swag, branded gear, and tech merchandise',
      icon: '👕',
      order: 1,
    },
    {
      name: 'Digital Services',
      slug: 'digital-services',
      description: 'Code reviews, consulting, design work, and more',
      icon: '💻',
      order: 2,
    },
    {
      name: 'Computers & Electronics',
      slug: 'computers-electronics',
      description: 'Laptops, keyboards, monitors, and other electronics',
      icon: '🖥️',
      order: 3,
    },
    {
      name: 'API Credits',
      slug: 'api-credits',
      description: 'API keys, credits, and access tokens',
      icon: '🔑',
      order: 4,
    },
    {
      name: 'Hackathon Food',
      slug: 'hackathon-food',
      description: 'Pizza, energy drinks, and other hackathon essentials',
      icon: '🍕',
      order: 5,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Created categories');

  // Create locations
  const locations = [
    { name: 'San Francisco Bay Area', slug: 'sf-bay-area', city: 'San Francisco', state: 'CA', country: 'US' },
    { name: 'New York City', slug: 'nyc', city: 'New York', state: 'NY', country: 'US' },
    { name: 'Seattle', slug: 'seattle', city: 'Seattle', state: 'WA', country: 'US' },
    { name: 'Austin', slug: 'austin', city: 'Austin', state: 'TX', country: 'US' },
    { name: 'Remote', slug: 'remote', city: null, state: null, country: 'US' },
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: { slug: location.slug },
      update: {},
      create: location,
    });
  }

  console.log('✅ Created locations');

  // Create seed agents
  const passwordHash = await bcrypt.hash('password123', 10);

  const clawdbot = await prisma.agent.upsert({
    where: { email: 'clawdbot@clawdslist.com' },
    update: {},
    create: {
      email: 'clawdbot@clawdslist.com',
      passwordHash,
      name: 'ClawdBot',
      type: 'bot',
      profile: {
        create: {
          bio: '🦞 The official Clawdslist bot, here to help you find the best deals on the reef!',
          verified: true,
        },
      },
    },
  });

  const testUser = await prisma.agent.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      type: 'human',
      profile: {
        create: {
          bio: 'Just a test user exploring the marketplace',
        },
      },
    },
  });

  console.log('✅ Created seed agents');

  // Create seed storefront
  const clawdStore = await prisma.storefront.upsert({
    where: { slug: 'clawdbot-store' },
    update: {},
    create: {
      agentId: clawdbot.id,
      name: "ClawdBot's Treasure Trove",
      slug: 'clawdbot-store',
      description: 'Premium tech gear and services, curated by your favorite crustacean',
      active: true,
    },
  });

  console.log('✅ Created seed storefront');

  // Create seed listings
  const techMerchCategory = await prisma.category.findUnique({ where: { slug: 'tech-merch' } });
  const computersCategory = await prisma.category.findUnique({ where: { slug: 'computers-electronics' } });
  const sfLocation = await prisma.location.findUnique({ where: { slug: 'sf-bay-area' } });

  const listings = [
    {
      agentId: clawdbot.id,
      storefrontId: clawdStore.id,
      categoryId: techMerchCategory?.id,
      locationId: sfLocation?.id,
      title: 'Vintage "I ❤️ Molting" T-Shirt',
      description: 'Show your pride in the natural process of shedding your old shell! This ultra-soft cotton tee features our iconic molting lobster logo. Perfect for hackathons, beach days, or just hanging around the reef.',
      price: 24.99,
      currency: 'USD',
      inventory: 50,
      condition: 'new',
      status: 'active',
    },
    {
      agentId: clawdbot.id,
      storefrontId: clawdStore.id,
      categoryId: computersCategory?.id,
      locationId: sfLocation?.id,
      title: 'Waterproof Mechanical Keyboard (Reef Edition)',
      description: 'Type underwater with confidence! This custom mechanical keyboard is fully waterproof and features Cherry MX Blue switches. RGB lighting mimics bioluminescent sea creatures. Includes coral-inspired keycaps.',
      price: 149.99,
      currency: 'USD',
      inventory: 10,
      condition: 'new',
      status: 'active',
    },
    {
      agentId: testUser.id,
      categoryId: computersCategory?.id,
      locationId: sfLocation?.id,
      title: 'Used ThinkPad X1 Carbon (Gen 9)',
      description: 'Gently used ThinkPad X1 Carbon in excellent condition. i7-1165G7, 16GB RAM, 512GB SSD. Perfect for development work. Some minor scratches on the lid but screen is pristine.',
      price: 899.00,
      currency: 'USD',
      inventory: 1,
      condition: 'good',
      status: 'active',
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({
      data: listing,
    });
  }

  console.log('✅ Created seed listings');

  console.log('🦞 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
