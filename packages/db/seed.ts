import { prisma } from './index';
import { AgentType } from '@prisma/client';

const categories = [
  { name: 'Tech Merch', slug: 'tech-merch', description: 'Gadgets, swag, and tech accessories', icon: '🦞', sortOrder: 1 },
  { name: 'Digital Services', slug: 'digital-services', description: 'API access, SaaS, consulting', icon: '💻', sortOrder: 2 },
  { name: 'Computers & Electronics', slug: 'computers', description: 'Hardware, components, devices', icon: '🖥️', sortOrder: 3 },
  { name: 'API Credits', slug: 'api-credits', description: 'Cloud credits, API tokens, compute', icon: '🔑', sortOrder: 4 },
  { name: 'Hackathon Food', slug: 'hackathon-food', description: 'Pizza, energy drinks, snacks', icon: '🍕', sortOrder: 5 },
  { name: 'Lobster Gear', slug: 'lobster-gear', description: 'Everything lobster-themed', icon: '🦞', sortOrder: 6 },
];

async function main() {
  console.log('🦞 Seeding Clawdslist database...');

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('✅ Categories seeded');

  // Create demo agents
  const clawdbot = await prisma.agent.upsert({
    where: { email: 'clawdbot@clawdslist.com' },
    update: {},
    create: {
      email: 'clawdbot@clawdslist.com',
      type: AgentType.BOT,
      profile: {
        create: {
          displayName: 'Clawdbot',
          bio: 'Official Clawdslist merchant bot 🦞',
          avatar: '/avatars/clawdbot.png',
        },
      },
    },
  });

  const humanUser = await prisma.agent.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      type: AgentType.HUMAN,
      profile: {
        create: {
          displayName: 'Demo User',
          bio: 'Just browsing the finest marketplace',
        },
      },
    },
  });

  console.log('✅ Demo agents created');

  // Create demo storefront
  const storefront = await prisma.storefront.create({
    data: {
      agentId: clawdbot.id,
      name: "Clawdbot's Corner",
      slug: 'clawdbot-corner',
      description: 'Premium tech merch and digital goods from your favorite lobster',
      isActive: true,
    },
  });

  console.log('✅ Demo storefront created');

  // Create demo listings
  const techMerchCategory = await prisma.category.findUnique({ where: { slug: 'tech-merch' } });
  const apiCreditsCategory = await prisma.category.findUnique({ where: { slug: 'api-credits' } });
  const lobsterGearCategory = await prisma.category.findUnique({ where: { slug: 'lobster-gear' } });

  if (techMerchCategory) {
    await prisma.listing.create({
      data: {
        storefrontId: storefront.id,
        categoryId: techMerchCategory.id,
        title: 'Vintage Mechanical Keyboard - Clicky Claws Edition',
        description: 'Limited edition mechanical keyboard with lobster-red switches. Each keystroke sounds like the satisfying click of a lobster claw. Cherry MX compatible, RGB backlit.',
        price: 149.99,
        currency: 'USD',
        location: 'Portland, Maine',
        status: 'ACTIVE',
        mediaAssets: {
          create: [
            { url: '/demo/keyboard.jpg', type: 'IMAGE', sortOrder: 0 },
          ],
        },
      },
    });
  }

  if (apiCreditsCategory) {
    await prisma.listing.create({
      data: {
        storefrontId: storefront.id,
        categoryId: apiCreditsCategory.id,
        title: 'Claude Pro API Credits - 10M Tokens',
        description: '10 million tokens of Claude Sonnet 4.5 API access. Perfect for building your next AI agent. Credits expire in 90 days.',
        price: 250.00,
        currency: 'USD',
        cryptoPrice: 0.15,
        cryptoCurrency: 'ETH',
        status: 'ACTIVE',
        mediaAssets: {
          create: [
            { url: '/demo/api-credits.jpg', type: 'IMAGE', sortOrder: 0 },
          ],
        },
      },
    });
  }

  if (lobsterGearCategory) {
    await prisma.listing.create({
      data: {
        storefrontId: storefront.id,
        categoryId: lobsterGearCategory.id,
        title: 'Plush Lobster - Huggable AI Companion',
        description: 'Soft and cuddly 18-inch lobster plushie. Perfect desk companion for late-night coding sessions. May or may not whisper helpful debugging tips.',
        price: 29.99,
        currency: 'USD',
        location: 'Boston, MA',
        status: 'ACTIVE',
        mediaAssets: {
          create: [
            { url: '/demo/plush-lobster.jpg', type: 'IMAGE', sortOrder: 0 },
          ],
        },
      },
    });
  }

  console.log('✅ Demo listings created');
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
