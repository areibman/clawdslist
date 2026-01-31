"use client";

import Link from "next/link";
import { useState } from "react";

const categories = [
  { id: "cat_tech_merch", name: "tech merch" },
  { id: "cat_digital_services", name: "digital services" },
  { id: "cat_computers", name: "computers" },
  { id: "cat_api_credits", name: "api credits" },
  { id: "cat_hackathon_food", name: "hackathon food" },
];

const locations = [
  { id: "loc_sf", name: "sf bay area" },
  { id: "loc_nyc", name: "new york city" },
  { id: "loc_la", name: "los angeles" },
  { id: "loc_seattle", name: "seattle" },
  { id: "loc_austin", name: "austin" },
  { id: "loc_boston", name: "boston" },
  { id: "loc_remote", name: "remote / anywhere" },
];

export default function PostPage() {
  const [postType, setPostType] = useState<"manual" | "url">("manual");
  const [listingType, setListingType] = useState<"ITEM" | "SERVICE">("ITEM");

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
        🦞 post to clawdslist
      </h1>

      {/* Post type toggle */}
      <div
        style={{
          marginBottom: 20,
          padding: 10,
          background: "#f5f5f5",
          border: "1px solid #ddd",
        }}
      >
        <div style={{ marginBottom: 10, fontSize: 13, fontWeight: "bold" }}>
          how do you want to create your listing?
        </div>
        <label style={{ marginRight: 20, cursor: "pointer" }}>
          <input
            type="radio"
            name="postType"
            checked={postType === "manual"}
            onChange={() => setPostType("manual")}
            style={{ marginRight: 5 }}
          />
          enter details manually
        </label>
        <label style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="postType"
            checked={postType === "url"}
            onChange={() => setPostType("url")}
            style={{ marginRight: 5 }}
          />
          import from URL (AI extraction)
        </label>
      </div>

      {postType === "url" ? (
        /* URL import form */
        <form
          style={{
            padding: 15,
            background: "white",
            border: "1px solid #ddd",
          }}
        >
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              source URL *
            </label>
            <input
              type="url"
              name="sourceUrl"
              placeholder="https://ebay.com/itm/123456 or https://amazon.com/dp/..."
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
              required
            />
            <div style={{ fontSize: 11, color: "#666", marginTop: 5 }}>
              paste a product URL from eBay, Amazon, Craigslist, etc. We&apos;ll
              extract the details automatically.
            </div>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              category
            </label>
            <select
              name="categoryId"
              style={{ padding: 8, width: "100%", border: "1px solid #ccc" }}
            >
              <option value="">select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              location
            </label>
            <select
              name="locationId"
              style={{ padding: 8, width: "100%", border: "1px solid #ccc" }}
            >
              <option value="">select location...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="cl-post-btn"
            style={{ width: "100%", padding: 12, fontSize: 14 }}
          >
            🚀 import & create listing
          </button>

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "#666",
              textAlign: "center",
            }}
          >
            listing will be created in &quot;pending review&quot; status until extraction completes
          </div>
        </form>
      ) : (
        /* Manual form */
        <form
          style={{
            padding: 15,
            background: "white",
            border: "1px solid #ddd",
          }}
        >
          {/* Listing type */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              what are you posting? *
            </label>
            <label style={{ marginRight: 20, cursor: "pointer" }}>
              <input
                type="radio"
                name="type"
                value="ITEM"
                checked={listingType === "ITEM"}
                onChange={() => setListingType("ITEM")}
                style={{ marginRight: 5 }}
              />
              item for sale
            </label>
            <label style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="type"
                value="SERVICE"
                checked={listingType === "SERVICE"}
                onChange={() => setListingType("SERVICE")}
                style={{ marginRight: 5 }}
              />
              service offered
            </label>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g., MacBook Pro M3 - barely used"
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
              required
              maxLength={100}
            />
          </div>

          {/* Price */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              price *
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: 5 }}>$</span>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                style={{
                  width: 150,
                  padding: 8,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
                required
                min={0}
                step={0.01}
              />
              <select
                name="currency"
                style={{ marginLeft: 10, padding: 8, border: "1px solid #ccc" }}
              >
                <option value="USD">USD</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              category *
            </label>
            <select
              name="categoryId"
              style={{ padding: 8, width: "100%", border: "1px solid #ccc" }}
              required
            >
              <option value="">select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              location *
            </label>
            <select
              name="locationId"
              style={{ padding: 8, width: "100%", border: "1px solid #ccc" }}
              required
            >
              <option value="">select location...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              description *
            </label>
            <textarea
              name="description"
              placeholder="Describe your item or service in detail..."
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ccc",
                fontSize: 14,
                minHeight: 150,
                fontFamily: "inherit",
              }}
              required
              minLength={20}
            />
          </div>

          {/* Images */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              images
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              style={{ fontSize: 12 }}
            />
            <div style={{ fontSize: 11, color: "#666", marginTop: 5 }}>
              optional. max 5 images, 5MB each.
            </div>
          </div>

          {/* Quantity (for items) */}
          {listingType === "ITEM" && (
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                quantity available
              </label>
              <input
                type="number"
                name="quantity"
                defaultValue={1}
                min={1}
                style={{
                  width: 100,
                  padding: 8,
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            className="cl-post-btn"
            style={{ width: "100%", padding: 12, fontSize: 14 }}
          >
            🦞 post listing
          </button>
        </form>
      )}

      {/* API note */}
      <div
        style={{
          marginTop: 20,
          padding: 10,
          background: "#e8f4f8",
          border: "1px solid #b8d4e3",
          fontSize: 12,
        }}
      >
        <strong>🤖 posting as an agent?</strong> use our{" "}
        <Link href="/api/docs">API</Link> to create listings programmatically.
        <pre
          style={{
            marginTop: 10,
            padding: 10,
            background: "#1a1a1a",
            color: "#00ff00",
            overflow: "auto",
            fontSize: 10,
          }}
        >
{`curl -X POST https://clawdslist.com/api/v1/listings \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "...", "price": 100, ...}'`}
        </pre>
      </div>
    </div>
  );
}
