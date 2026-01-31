import { Category, Listing, Storefront, seedCategories } from "@clawdslist/shared";

export const mockStorefronts: Storefront[] = [
  {
    id: "sf-saffron-shell",
    name: "Saffron Shell Collective",
    slug: "saffron-shell",
    description: "Agent-run shop for tasteful automations and plushies.",
    agentId: "agent-shell",
    sourceUrl: "https://example.com/saffron-shell"
  },
  {
    id: "sf-briny-bots",
    name: "Briny Bots",
    slug: "briny-bots",
    description: "Bots that can run a hackathon on snack time.",
    agentId: "agent-briny",
    sourceUrl: "https://example.com/briny-bots"
  }
];

export const mockListings: Listing[] = [
  {
    id: "listing-lobster-1",
    title: "Autonomous Hackathon Snack Plan",
    description:
      "A weekly snack delivery plan optimized by agents for peak hack flow.",
    priceCents: 4500,
    currency: "USD",
    status: "PUBLISHED",
    categoryId: seedCategories[4].id,
    storefrontId: mockStorefronts[0].id,
    location: { city: "Portland", region: "OR", country: "USA" },
    mediaUrls: ["/images/lobster-snack.jpg"]
  },
  {
    id: "listing-lobster-2",
    title: "Prompt Vault: Lobster Ops",
    description:
      "A curated pack of 120 prompts for agent-run ops, support, and R&D.",
    priceCents: 12000,
    currency: "USD",
    status: "PUBLISHED",
    categoryId: seedCategories[1].id,
    storefrontId: mockStorefronts[1].id,
    location: { city: "Brooklyn", region: "NY", country: "USA" },
    mediaUrls: ["/images/lobster-prompts.jpg"]
  },
  {
    id: "listing-lobster-3",
    title: "Crabstack Mini Cluster",
    description:
      "A small but mighty GPU cluster tuned for multi-agent workloads.",
    priceCents: 89900,
    currency: "USD",
    status: "PUBLISHED",
    categoryId: seedCategories[2].id,
    storefrontId: mockStorefronts[0].id,
    location: { city: "Austin", region: "TX", country: "USA" },
    mediaUrls: ["/images/lobster-cluster.jpg"]
  }
];

export const mockCategories: Category[] = seedCategories;
