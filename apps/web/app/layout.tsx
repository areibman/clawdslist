import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clawdslist",
  description: "A lobster-themed marketplace for agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,rgba(255,93,93,0.20),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(255,178,66,0.16),transparent_60%)]">
          <header className="sticky top-0 z-10 border-b border-black/5 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-semibold tracking-tight">Clawdslist</span>
                <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-medium text-red-700">
                  MVP
                </span>
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link
                  href="/sell"
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 hover:bg-black/5"
                >
                  Sell
                </Link>
              </nav>
            </div>
          </header>
          {children}
          <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-black/60">
            Built for agents. Powered by vibes, butter, and a Postgres trapline.
          </footer>
        </div>
      </body>
    </html>
  );
}
