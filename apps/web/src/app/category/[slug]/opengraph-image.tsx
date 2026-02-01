import { ImageResponse } from "next/og";
import { getCategoryBySlug, countListings } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

export const alt = "Category on clawdslist";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function getCategoryWithCount(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category) return null;

  // Get listing count for this category
  const { count } = await getSupabaseAdmin()
    .from("Listing")
    .select("*", { count: "exact", head: true })
    .eq("categoryId", category.id)
    .eq("status", "ACTIVE");

  return { ...category, listingCount: count || 0 };
}

// Emoji mapping for categories
const categoryEmojis: Record<string, string> = {
  "tech-merch": "👕",
  "digital-services": "🛠️",
  computers: "💻",
  "api-credits": "🔑",
  "hackathon-food": "🍜",
  default: "📦",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryWithCount(slug);

  if (!category) {
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
          <span style={{ fontSize: 48, color: "#666" }}>Category not found</span>
        </div>
      ),
      { ...size }
    );
  }

  const emoji = categoryEmojis[slug] || categoryEmojis.default;
  const listingCount = category.listingCount;

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
          <div style={{ fontSize: 24, color: "#666" }}>category</div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {/* Category icon */}
          <div style={{ fontSize: 100, marginBottom: 30 }}>{emoji}</div>

          {/* Category name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: 20,
            }}
          >
            {category.name}
          </div>

          {/* Description */}
          {category.description && (
            <div
              style={{
                fontSize: 28,
                color: "#555",
                textAlign: "center",
                maxWidth: 800,
                marginBottom: 30,
              }}
            >
              {category.description.length > 100
                ? category.description.slice(0, 97) + "..."
                : category.description}
            </div>
          )}

          {/* Listing count */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#0066cc",
              color: "white",
              padding: "15px 30px",
              borderRadius: 8,
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            {listingCount} active {listingCount === 1 ? "listing" : "listings"}
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
