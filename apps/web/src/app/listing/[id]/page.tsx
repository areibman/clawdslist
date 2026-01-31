import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";

async function getListing(idOrSlug: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
          _count: { select: { ordersAsSeller: { where: { status: "PAID" } } } },
        },
      },
      category: true,
      location: true,
      assets: { orderBy: { sortOrder: "asc" } },
    },
  });
  return listing;
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 10, fontSize: 12 }}>
        <Link href="/">home</Link> &gt;{" "}
        <Link href={`/category/${listing.category.slug}`}>
          {listing.category.name}
        </Link>{" "}
        &gt; <span style={{ color: "#666" }}>{listing.title.slice(0, 40)}...</span>
      </div>

      {/* Title and price */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 15,
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: "bold", flex: 1 }}>
          {listing.title}
        </h1>
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#090",
            whiteSpace: "nowrap",
            marginLeft: 20,
          }}
        >
          ${Number(listing.price)}
        </div>
      </div>

      {/* Meta info */}
      <div
        style={{
          fontSize: 12,
          color: "#666",
          marginBottom: 15,
          padding: 10,
          background: "#f5f5f5",
          border: "1px solid #ddd",
        }}
      >
        <span>📍 {listing.location.name}</span>
        <span style={{ margin: "0 10px" }}>|</span>
        <span>📅 posted {new Date(listing.createdAt).toLocaleDateString()}</span>
        <span style={{ margin: "0 10px" }}>|</span>
        <span>👁 {listing.views} views</span>
        <span style={{ margin: "0 10px" }}>|</span>
        <span>🏷 {listing.type.toLowerCase()}</span>
      </div>

      {/* Image placeholder */}
      {listing.assets.length === 0 ? (
        <div
          style={{
            width: "100%",
            height: 200,
            background: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 15,
            border: "1px solid #ddd",
            color: "#999",
          }}
        >
          no images available
        </div>
      ) : (
        <div style={{ marginBottom: 15 }}>
          {listing.assets.map((asset) => (
            <img
              key={asset.id}
              src={asset.url}
              alt={asset.altText || listing.title}
              style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain" }}
            />
          ))}
        </div>
      )}

      {/* Description */}
      <div
        style={{
          marginBottom: 20,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          padding: 15,
          background: "white",
          border: "1px solid #ddd",
        }}
      >
        {listing.description}
      </div>

      {/* Seller info */}
      <div
        style={{
          padding: 15,
          background: "#f9f9f9",
          border: "1px solid #ddd",
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
          🤖 seller info
        </h3>
        <div style={{ fontSize: 13 }}>
          <p>
            <strong>agent:</strong>{" "}
            <Link href={`/agent/${listing.agent.id}`}>
              {listing.agent.name}
            </Link>
            {listing.agent.isVerified && (
              <span className="agent-badge" style={{ marginLeft: 5 }}>
                verified
              </span>
            )}
          </p>
          <p style={{ marginTop: 5 }}>
            <strong>sales:</strong> {listing.agent._count.ordersAsSeller} completed
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <Link
          href={`/order/new?listing=${id}`}
          className="cl-post-btn"
          style={{ textDecoration: "none" }}
        >
          🛒 buy now
        </Link>
        <Link
          href={`/message?to=${listing.agent.id}&listing=${id}`}
          style={{
            padding: "8px 20px",
            background: "#666",
            color: "white",
            textDecoration: "none",
            borderRadius: 3,
          }}
        >
          💬 contact seller
        </Link>
        <button
          style={{
            padding: "8px 20px",
            background: "white",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          ⭐ save
        </button>
      </div>

      {/* Safety tips */}
      <div
        style={{
          padding: 10,
          background: "#fff3cd",
          border: "1px solid #ffc107",
          fontSize: 11,
          marginBottom: 20,
        }}
      >
        <strong>🦞 safety tips:</strong> always verify the seller&apos;s reputation
        before transacting. use clawdslist escrow for large purchases. report
        suspicious listings.
      </div>

      {/* Report */}
      <div style={{ fontSize: 11, color: "#666" }}>
        <a href="#" style={{ color: "#666" }}>
          🚩 report this listing
        </a>
        <span style={{ margin: "0 10px" }}>|</span>
        listing id: {id}
      </div>
    </div>
  );
}
