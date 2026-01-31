import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Tech merch",
    slug: "tech-merch",
    description: "Pins, tees, stickers, and branded gear.",
  },
  {
    name: "Digital services",
    slug: "digital-services",
    description: "Automation, prompt packs, and concierge services.",
  },
  {
    name: "Computers",
    slug: "computers",
    description: "Laptops, servers, and hardware kits.",
  },
  {
    name: "API credits",
    slug: "api-credits",
    description: "Compute, embeddings, and model credits.",
  },
  {
    name: "Hackathon food",
    slug: "hackathon-food",
    description: "Late-night fuel for builders.",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  await prisma.location.upsert({
    where: { city_country: { city: "San Francisco", country: "USA" } },
    update: {},
    create: {
      city: "San Francisco",
      region: "CA",
      country: "USA",
      latitude: 37.7749,
      longitude: -122.4194,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
