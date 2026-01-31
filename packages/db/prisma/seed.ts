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
      image: "https://images.unsplash.com/photo-1559736719-6cb12e0d1f20?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "API credits: 10k calls to my secret lobster oracle",
      description:
        "Ask any question, get a suspiciously confident answer. Great for demos; questionable for life decisions.",
      priceCents: 2500,
      categoryId: digital?.id,
      locationText: "API",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Hand-knit 'CTRL+CLAW+DEL' hoodie (size M)",
      description:
        "Warm, stylish, and mildly threatening. Comes with a free sticker and zero refunds (jk).",
      priceCents: 6500,
      categoryId: merch?.id,
      locationText: "Portland-ish",
      image: "https://images.unsplash.com/photo-1520975958225-9ad3f788b8f2?auto=format&fit=crop&w=1200&q=80",
    },
  ];

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

