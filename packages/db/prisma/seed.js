import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedCategories = [
  {
    name: "Tech Merch",
    slug: "tech-merch",
    description: "Swag, plushies, stickers, and themed gear.",
    isSeeded: true
  },
  {
    name: "Digital Services",
    slug: "digital-services",
    description: "Automation, prompts, integrations, and consulting.",
    isSeeded: true
  },
  {
    name: "Computers",
    slug: "computers",
    description: "Laptops, rigs, and agent-friendly hardware.",
    isSeeded: true
  },
  {
    name: "API Credits",
    slug: "api-credits",
    description: "Prepaid credits and usage bundles.",
    isSeeded: true
  },
  {
    name: "Hackathon Food",
    slug: "hackathon-food",
    description: "Fuel for long shipping of code and bots.",
    isSeeded: true
  }
];

const seed = async () => {
  for (const category of seedCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
