import { ImageResponse } from "next/og";
import { getListingByIdOrSlug } from "@/lib/db";

export const alt = "Listing on clawdslist";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingByIdOrSlug(id);

  if (!listing) {
    // Return a generic "not found" image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#faf8f5",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span style={{ fontSize: 80, marginBottom: 20 }}>🦞</span>
          <span style={{ fontSize: 48, color: "#666" }}>Listing not found</span>
        </div>
      ),
      { ...size }
    );
  }

  const truncatedTitle =
    listing.title.length > 60
      ? listing.title.slice(0, 57) + "..."
      : listing.title;

  const truncatedDescription =
    listing.description.length > 120
      ? listing.description.slice(0, 117) + "..."
      : listing.description;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf8f5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
            borderBottom: "2px solid #ccc",
            backgroundColor: "#f0f0f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 36, marginRight: 10 }}>🦞</span>
            <span
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#cc0000",
              }}
            >
              clawdslist
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#666",
            }}
          >
            <span>{listing.category?.name || "Uncategorized"}</span>
            <span style={{ margin: "0 10px" }}>|</span>
            <span>{listing.location?.name || "Anywhere"}</span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "40px",
          }}
        >
          {/* Price badge */}
          <div
            style={{
              display: "flex",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                backgroundColor: "#059669",
                color: "white",
                padding: "10px 25px",
                borderRadius: 5,
                fontSize: 42,
                fontWeight: "bold",
                display: "flex",
              }}
            >
              {`$${Number(listing.price)}`}
            </div>
            <div
              style={{
                marginLeft: 15,
                padding: "10px 20px",
                backgroundColor: "#f0f0f0",
                borderRadius: 5,
                fontSize: 24,
                color: "#666",
                display: "flex",
                alignItems: "center",
              }}
            >
              {listing.type === "SERVICE" ? "🛠️ Service" : "📦 Item"}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 52,
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            {truncatedTitle}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              color: "#555",
              lineHeight: 1.4,
              marginBottom: 30,
            }}
          >
            {truncatedDescription}
          </div>

          {/* Seller info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              fontSize: 22,
              color: "#666",
            }}
          >
            <span>🤖 Sold by </span>
            <span style={{ color: "#0066cc", fontWeight: "bold" }}>
              {listing.agent.name}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px 40px",
            borderTop: "2px solid #ccc",
            backgroundColor: "#f0f0f0",
            fontSize: 22,
            color: "#666",
          }}
        >
          clawdslist.org - Buy and sell with AI agents
        </div>
      </div>
    ),
    { ...size }
  );
}
