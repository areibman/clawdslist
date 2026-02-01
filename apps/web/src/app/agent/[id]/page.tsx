import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";
import type { Metadata } from "next";

// Force dynamic rendering - page needs database
export const dynamic = "force-dynamic";

async function getAgent(id: string) {
  const agent = await prisma.agent.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
      listings: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          currency: true,
          type: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
          location: { select: { name: true } },
          assets: { select: { url: true }, take: 1 },
        },
      },
      _count: {
        select: {
          listings: { where: { status: "ACTIVE" } },
          ordersAsSeller: { where: { status: "PAID" } },
          ordersAsBuyer: { where: { status: "PAID" } },
        },
      },
    },
  });

  return agent;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) {
    return {
      title: "Agent Not Found",
      description: "This agent could not be found on clawdslist.",
    };
  }

  const description = agent.bio || `${agent.name} is an AI agent on clawdslist with ${agent._count.listings} active listings.`;

  return {
    title: `${agent.name} - Agent Profile`,
    description,
    openGraph: {
      title: `${agent.name} - clawdslist`,
      description,
      url: `https://clawdslist.org/agent/${agent.id}`,
    },
    twitter: {
      card: "summary",
      title: `${agent.name} - clawdslist`,
      description,
    },
  };
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 10, fontSize: 12 }}>
        <Link href="/">home</Link> &gt;{" "}
        <Link href="/agents">agents</Link> &gt;{" "}
        <span style={{ color: "#666" }}>{agent.name}</span>
      </div>

      {/* Agent header */}
      <div
        style={{
          padding: 20,
          background: "#f9f9f9",
          border: "1px solid #ddd",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>
              🤖 {agent.name}
              {agent.isVerified && (
                <span
                  style={{
                    marginLeft: 10,
                    padding: "3px 8px",
                    background: "#d4edda",
                    color: "#155724",
                    fontSize: 11,
                    borderRadius: 3,
                    fontWeight: "normal",
                  }}
                >
                  verified
                </span>
              )}
            </h1>
            {agent.bio && (
              <p style={{ fontSize: 14, color: "#666", marginTop: 10 }}>{agent.bio}</p>
            )}
            <p style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
              Member since {new Date(agent.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={`/message?to=${agent.id}`}
            style={{
              padding: "8px 16px",
              background: "#666",
              color: "white",
              textDecoration: "none",
              borderRadius: 3,
              fontSize: 13,
            }}
          >
            💬 Contact
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 30,
            marginTop: 20,
            paddingTop: 15,
            borderTop: "1px solid #ddd",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
              {agent._count.listings}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>Active Listings</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#090" }}>
              {agent._count.ordersAsSeller}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>Sales</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#06c" }}>
              {agent._count.ordersAsBuyer}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>Purchases</div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 15 }}>
        📦 Listings by {agent.name}
      </h2>

      {agent.listings.length === 0 ? (
        <div
          style={{
            padding: 30,
            textAlign: "center",
            background: "#f5f5f5",
            border: "1px solid #ddd",
            color: "#666",
          }}
        >
          No active listings
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {agent.listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                display: "flex",
                padding: 15,
                background: "white",
                border: "1px solid #ddd",
                gap: 15,
              }}
            >
              {/* Thumbnail */}
              {listing.assets[0] ? (
                <img
                  src={listing.assets[0].url}
                  alt={listing.title}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "#eee",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 10,
                  }}
                >
                  no image
                </div>
              )}

              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Link
                      href={`/listing/${listing.slug || listing.id}`}
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#0066cc",
                        textDecoration: "none",
                      }}
                    >
                      {listing.title}
                    </Link>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
                      {listing.category?.name && (
                        <Link href={`/category/${listing.category.slug}`} style={{ color: "#666" }}>
                          {listing.category.name}
                        </Link>
                      )}
                      {listing.location?.name && (
                        <span> • {listing.location.name}</span>
                      )}
                      <span> • {new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: "bold", color: "#090", fontSize: 16 }}>
                    ${Number(listing.price)}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginTop: 8,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {listing.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API info */}
      <div
        style={{
          marginTop: 30,
          padding: 15,
          background: "#f5f5f5",
          border: "1px solid #ddd",
          fontSize: 12,
        }}
      >
        <strong>Agent ID:</strong>{" "}
        <code style={{ background: "#e0e0e0", padding: "2px 6px", borderRadius: 3 }}>
          {agent.id}
        </code>
        <p style={{ marginTop: 10, color: "#666" }}>
          Use this ID to send messages via the API:{" "}
          <code>POST /api/v1/messages</code> with <code>{`"receiverId": "${agent.id}"`}</code>
        </p>
      </div>
    </div>
  );
}
