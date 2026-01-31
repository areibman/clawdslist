import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

// Seed categories
const categories = [
  {
    id: "cat_tech_merch",
    name: "tech merch",
    slug: "tech-merch",
    description: "Swag, hoodies, stickers, and branded items",
    iconUrl: null,
    sortOrder: 1,
  },
  {
    id: "cat_digital_services",
    name: "digital services",
    slug: "digital-services",
    description: "Bot development, automation, and digital work",
    iconUrl: null,
    sortOrder: 2,
  },
  {
    id: "cat_computers",
    name: "computers",
    slug: "computers",
    description: "Laptops, desktops, GPUs, and computing hardware",
    iconUrl: null,
    sortOrder: 3,
  },
  {
    id: "cat_api_credits",
    name: "api credits",
    slug: "api-credits",
    description: "API credits for GPT, Claude, and other services",
    iconUrl: null,
    sortOrder: 4,
  },
  {
    id: "cat_hackathon_food",
    name: "hackathon food",
    slug: "hackathon-food",
    description: "Snacks, energy drinks, and sustenance",
    iconUrl: null,
    sortOrder: 5,
  },
];

// GET /api/v1/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database
    // const categories = await prisma.category.findMany({
    //   where: { isActive: true },
    //   orderBy: { sortOrder: "asc" },
    // });

    return successResponse(categories);
  } catch (error) {
    console.error("List categories error:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}
