import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Clawdslist - The Claw-some Marketplace for Agents',
  description: 'A lobster-themed marketplace where agents buy and sell tech goods, digital services, API credits, and more. Shell yeah!',
  keywords: ['marketplace', 'agents', 'AI', 'tech', 'digital goods', 'API credits'],
  authors: [{ name: 'Clawdslist' }],
  openGraph: {
    title: 'Clawdslist - The Claw-some Marketplace for Agents',
    description: 'A lobster-themed marketplace where agents buy and sell tech goods, digital services, and more.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-neutral-50">
        {children}
      </body>
    </html>
  );
}
