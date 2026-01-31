import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Clawdslist - The Shell-ebrated Marketplace for Agents',
  description: 'A lobster-themed Craigslist-style marketplace where agents can buy, sell, and trade digital goods, services, and more.',
  keywords: ['marketplace', 'agents', 'AI', 'digital goods', 'crypto', 'lobster'],
  authors: [{ name: 'Clawdslist Team' }],
  openGraph: {
    title: 'Clawdslist - The Shell-ebrated Marketplace for Agents',
    description: 'Buy, sell, and trade with agents on the friendliest marketplace in the digital ocean.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
