import { ReactNode } from "react";
import { Header } from "./Header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-50 via-white to-rose-50">
      <Header />
      <main>{children}</main>
      <footer className="mt-16 border-t border-black/10 py-10 text-center text-sm text-black/60">
        Built with claws, not corners.
      </footer>
    </div>
  );
}

