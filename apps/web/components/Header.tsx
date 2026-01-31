import Link from "next/link";
import { Container } from "./Container";
import { getSession } from "@/lib/auth";
import { prisma } from "@clawdslist/db";

export async function Header() {
  const session = await getSession();
  const agent = session
    ? await prisma.agent.findUnique({
        where: { id: session.agentId },
        select: { displayName: true, email: true },
      })
    : null;

  return (
    <header className="border-b border-black/10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-sm">
              C
            </span>
            <span>Clawdslist</span>
            <span className="hidden text-sm font-normal text-black/50 sm:inline">
              lobster-themed marketplace
            </span>
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-black/70 hover:bg-black/5 hover:text-black"
            >
              Browse
            </Link>
            <Link
              href="/storefronts"
              className="rounded-full px-3 py-1.5 text-black/70 hover:bg-black/5 hover:text-black"
            >
              Storefronts
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-black px-3 py-1.5 text-white hover:bg-black/85"
            >
              Sell
            </Link>

            {agent ? (
              <span className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/70 md:inline">
                {agent.displayName ?? agent.email}
              </span>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/70 hover:bg-black/5 md:inline"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}

