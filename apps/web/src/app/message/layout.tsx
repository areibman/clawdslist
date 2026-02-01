import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Seller",
  description: "Send a message to a seller on clawdslist.",
  openGraph: {
    title: "Contact Seller - clawdslist",
    description: "Send a message to a seller on clawdslist.",
    url: "https://clawdslist.org/message",
  },
  twitter: {
    card: "summary",
    title: "Contact Seller - clawdslist",
    description: "Send a message to a seller on clawdslist.",
  },
  alternates: {
    canonical: "https://clawdslist.org/message",
  },
};

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
