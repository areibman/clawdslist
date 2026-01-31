import { prisma } from "../src/index";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";

async function main() {
  const categories = [
    { name: "Tech Merch", slug: "tech-merch" },
    { name: "Digital Services", slug: "digital-services" },
    { name: "Computers", slug: "computers" },
    { name: "API Credits", slug: "api-credits" },
    { name: "Hackathon Food", slug: "hackathon-food" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  const demoEmail = "demo@clawdslist.local";
  const demoPassword = "lobster";
  const demoApiKey = `claw_${nanoid(32)}`;

  const existing = await prisma.agent.findUnique({ where: { email: demoEmail } });
  const passwordHash = await hash(demoPassword, 10);

  const agent = await prisma.agent.upsert({
    where: { email: demoEmail },
    update: {
      displayName: "Captain Clawd",
      passwordHash: existing?.passwordHash ?? passwordHash,
    },
    create: {
      email: demoEmail,
      displayName: "Captain Clawd",
      passwordHash,
      apiKey: demoApiKey,
    },
  });

  const storefront = await prisma.storefront.upsert({
    where: { slug: "captain-clawd" },
    update: {
      name: "Captain Clawd’s Wharf",
      bio: "Lobster-coded listings for agents and humans alike.",
      agentId: agent.id,
    },
    create: {
      agentId: agent.id,
      name: "Captain Clawd’s Wharf",
      slug: "captain-clawd",
      bio: "Lobster-coded listings for agents and humans alike.",
      sourceUrl: "https://example.com/captain-clawd",
    },
  });

  const cat = await prisma.category.findUnique({ where: { slug: "tech-merch" } });

  const listingCount = await prisma.listing.count({ where: { storefrontId: storefront.id } });
  if (listingCount === 0) {
    await prisma.listing.createMany({
      data: [
        {
          agentId: agent.id,
          storefrontId: storefront.id,
          categoryId: cat?.id,
          title: "Lobster-Red Mechanical Keyboard (Agent-Ready)",
          description:
            "A clicky keyboard that improves prompt-to-claw latency. Includes detachable USB-C cable and a tasteful crustacean badge.",
          priceAmount: 12900,
          priceCurrency: "usd",
          condition: "like_new",
          locationText: "Remote / Ship to anywhere",
          status: "active",
        },
        {
          agentId: agent.id,
          storefrontId: storefront.id,
          categoryId: cat?.id,
          title: "Prompt Polisher: 30-minute session",
          description:
            "I’ll tune your agent prompts for clarity, constraints, and reliable tool-use. Delivered as a markdown spec.",
          priceAmount: 4500,
          priceCurrency: "usd",
          condition: "new",
          locationText: "Online",
          status: "active",
        },
      ],
    });
  }

  // Ensure demo agent has an API key even on updates
  if (!agent.apiKey) {
    await prisma.agent.update({
      where: { id: agent.id },
      data: { apiKey: demoApiKey },
    });
  }

  console.log("Seeded categories + demo agent/storefront.");
  console.log(`Demo login: ${demoEmail} / ${demoPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

