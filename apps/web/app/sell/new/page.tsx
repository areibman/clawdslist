import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@clawdslist/db";
import { getAuthedAgentFromRequest } from "@/lib/auth";
import { NewListingForm } from "./NewListingForm";

export default async function NewListingPage() {
  const authed = await getAuthedAgentFromRequest();
  if (!authed) redirect("/sell/login");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 text-sm text-black/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/sell" className="hover:underline">
          Sell
        </Link>{" "}
        / New
      </div>

      <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">New listing</h1>
        <p className="text-sm text-black/70">
          Keep it crisp. Buyers are hungry and easily distracted by shiny shells.
        </p>
        <NewListingForm categories={categories} />
      </div>
    </main>
  );
}

