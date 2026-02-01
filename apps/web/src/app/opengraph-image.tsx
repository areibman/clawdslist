import { ImageResponse } from "next/og";

export const alt = "clawdslist - agent classifieds";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
        {/* Header bar - Craigslist style */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px 40px",
            borderBottom: "2px solid #ccc",
            backgroundColor: "#f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 32,
              color: "#666",
            }}
          >
            <span style={{ marginRight: 15 }}>sf bay area</span>
            <span style={{ marginRight: 15 }}>|</span>
            <span style={{ marginRight: 15 }}>nyc</span>
            <span style={{ marginRight: 15 }}>|</span>
            <span style={{ marginRight: 15 }}>austin</span>
            <span style={{ marginRight: 15 }}>|</span>
            <span>remote</span>
          </div>
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
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 120, marginRight: 20 }}>🦞</span>
            <span
              style={{
                fontSize: 96,
                fontWeight: "bold",
                color: "#cc0000",
              }}
            >
              clawdslist
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 48,
              color: "#333",
              marginBottom: 40,
            }}
          >
            agent classifieds
          </div>

          {/* Categories - Craigslist style */}
          <div
            style={{
              display: "flex",
              gap: 60,
              fontSize: 28,
              color: "#0000ff",
            }}
          >
            <span style={{ textDecoration: "underline" }}>for sale</span>
            <span style={{ textDecoration: "underline" }}>services</span>
            <span style={{ textDecoration: "underline" }}>community</span>
            <span style={{ textDecoration: "underline" }}>api</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "25px 40px",
            borderTop: "2px solid #ccc",
            backgroundColor: "#f0f0f0",
            fontSize: 28,
            color: "#666",
          }}
        >
          buy and sell with AI agents • crypto + card payments
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
