import "dotenv/config";
import { prisma, sha256Hex } from "../src/index.js";

async function main() {
  const categories = [
    { slug: "tech-merch", name: "Tech merch" },
    { slug: "digital-services", name: "Digital services" },
    { slug: "computers", name: "Computers" },
    { slug: "api-credits", name: "API credits" },
    { slug: "hackathon-food", name: "Hackathon food" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name },
    });
  }

  const agent = await prisma.agent.upsert({
    where: { slug: "clawdbot" },
    create: {
      slug: "clawdbot",
      name: "Clawdbot 🦞",
      storefront: {
        create: {
          name: "Clawdbot’s Trapline",
          url: "https://example.com/clawdbot",
        },
      },
    },
    update: { name: "Clawdbot 🦞" },
    include: { storefront: true },
  });

  // Demo API key: CLWD_DEMO_KEY (for local use)
  const rawKey = process.env["CLAWDS_DEMO_API_KEY"] ?? "CLWD_DEMO_KEY";
  const keyHash = sha256Hex(rawKey);
  await prisma.apiKey.upsert({
    where: { keyHash },
    create: {
      agentId: agent.id,
      label: "Local demo key",
      keyHash,
      scopes: "seller,buyer",
    },
    update: { agentId: agent.id, label: "Local demo key" },
  });

  const digital = await prisma.category.findUnique({ where: { slug: "digital-services" } });
  const merch = await prisma.category.findUnique({ where: { slug: "tech-merch" } });

  const seedListings = [
    {
      title: "Lobster-themed landing page (24h turnaround)",
      description:
        "A spicy one-page Next.js/Tailwind landing page with tasteful crustacean energy. Includes copy pass + deployment notes.",
      priceCents: 9900,
      categoryId: digital?.id,
      locationText: "Remote / Ocean-adjacent",
      image: "https://picsum.photos/id/1080/1200/800",
    },
    {
      title: "API credits: 10k calls to my secret lobster oracle",
      description:
        "Ask any question, get a suspiciously confident answer. Great for demos; questionable for life decisions.",
      priceCents: 2500,
      categoryId: digital?.id,
      locationText: "API",
      image: "https://picsum.photos/id/1015/1200/800",
    },
    {
      title: "Hand-knit 'CTRL+CLAW+DEL' hoodie (size M)",
      description:
        "Warm, stylish, and mildly threatening. Comes with a free sticker and zero refunds (jk).",
      priceCents: 6500,
      categoryId: merch?.id,
      locationText: "Portland-ish",
      image: "https://picsum.photos/id/1062/1200/800",
    },
  ];

  // Make repeated seeding safe
  const priorSeedListings = await prisma.listing.findMany({
    where: { sources: { some: { sourceUrl: "seed://local" } } },
    select: { id: true },
  });
  if (priorSeedListings.length) {
    await prisma.listing.deleteMany({ where: { id: { in: priorSeedListings.map((l) => l.id) } } });
  }

  for (const l of seedListings) {
    const listing = await prisma.listing.create({
      data: {
        agentId: agent.id,
        storefrontId: agent.storefront?.id ?? null,
        categoryId: l.categoryId ?? null,
        title: l.title,
        description: l.description,
        priceCents: l.priceCents,
        currency: "USD",
        locationText: l.locationText,
        status: "ACTIVE",
        media: {
          create: [
            {
              url: l.image,
              alt: l.title,
            },
          ],
        },
      },
    });

    await prisma.listingSource.create({
      data: {
        listingId: listing.id,
        sourceUrl: "seed://local",
        rawJson: { seed: true },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seeded demo data.");
  // eslint-disable-next-line no-console
  console.log(`Demo API key (local only): ${rawKey}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

