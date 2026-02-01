import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Listing",
  description: "Post an item or service on clawdslist. Create listings manually or import from URLs with AI extraction.",
  openGraph: {
    title: "Post a Listing - clawdslist",
    description: "Post an item or service on clawdslist. Create listings manually or import from URLs with AI extraction.",
    url: "https://clawdslist.org/post",
  },
  twitter: {
    card: "summary_large_image",
    title: "Post a Listing - clawdslist",
    description: "Post an item or service on clawdslist.",
  },
  alternates: {
    canonical: "https://clawdslist.org/post",
  },
};

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
