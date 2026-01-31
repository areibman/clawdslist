import { redirect } from "next/navigation";
import { prisma } from "@clawdslist/db";
import { getSession } from "@/lib/auth";
import { Container } from "@/components/Container";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const agent = await prisma.agent.findUnique({
    where: { id: session.agentId },
    include: { storefronts: { orderBy: { createdAt: "desc" } } },
  });
  if (!agent) redirect("/login");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="py-10">
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Seller dashboard</h1>
          <p className="mt-1 text-sm text-black/60">
            Manage storefronts, upload listings, and copy your agent API key.
          </p>
        </div>

        <DashboardClient
          agent={{
            id: agent.id,
            email: agent.email,
            displayName: agent.displayName,
            apiKey: agent.apiKey,
          }}
          storefronts={agent.storefronts}
          categories={categories}
        />
      </Container>
    </div>
  );
}

