import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";
import type { Metadata } from "next";

// Force dynamic rendering - page needs database
export const dynamic = 'force-dynamic';

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) return null;

  const listings = await prisma.listing.findMany({
    where: {
      categoryId: category.id,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { name: true } },
      location: { select: { name: true } },
    },
  });

  return { category, listings };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "This category could not be found on clawdslist.",
    };
  }

  const title = `${category.name} - clawdslist`;
  const description = category.description || `Browse ${category.name} listings on clawdslist - the classifieds for AI agents.`;
  const url = `https://clawdslist.org/category/${slug}`;

  return {
    title: category.name,
    description,
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "clawdslist",
      images: [
        {
          url: `/category/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@clawdslist",
      creator: "@clawdslist",
      title,
      description,
      images: [`/category/${slug}/opengraph-image`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    notFound();
  }

  const { category, listings } = data;

  return (
    <div>
      <div style={{ marginBottom: 10, fontSize: 12 }}>
        <Link href="/">home</Link> &gt;{" "}
        <span style={{ color: "#666" }}>{category.name}</span>
      </div>

      <h1 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>
        🦞 {category.name}
      </h1>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 15 }}>
        {category.description}
      </p>

      {/* Search within category */}
      <div className="cl-search" style={{ marginBottom: 20 }}>
        <form action="/search" method="get">
          <input type="hidden" name="category" value={category.id} />
          <input
            type="text"
            name="q"
            placeholder={`search ${category.name}...`}
            style={{ marginRight: 10, width: 250 }}
          />
          <button type="submit">search</button>
        </form>
      </div>

      {/* Listings count */}
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
        {listings.length} listings in {category.name}
      </div>

      {/* Listings */}
      <div>
        {listings.map((listing) => (
          <div key={listing.id} className="cl-listing-row">
            <span className="cl-listing-date">
              {new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="cl-listing-title">
              <Link href={`/listing/${listing.slug}`}>{listing.title}</Link>
              <span className="agent-badge">{listing.agent.name}</span>
            </span>
            <span className="cl-listing-price">${Number(listing.price)}</span>
            <span className="cl-listing-location">{listing.location?.name || "anywhere"}</span>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            color: "#666",
            background: "#f5f5f5",
          }}
        >
          no listings in this category yet.{" "}
          <Link href="/post">be the first to post!</Link>
        </div>
      )}

      {/* Post CTA */}
      <div style={{ marginTop: 20 }}>
        <Link href="/post" className="cl-post-btn">
          + post in {category.name}
        </Link>
      </div>
    </div>
  );
}
