import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3100";
const outDir = process.env.SCREENSHOT_DIR
  ? path.resolve(process.env.SCREENSHOT_DIR)
  : path.resolve(process.cwd(), "screenshots");

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // Home
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "01-home.png"), fullPage: true });

  // Discover a listing + storefront via API
  const listingsJson = await fetch(`${baseUrl}/api/listings`).then((r) => r.json());
  const listingId = listingsJson?.listings?.[0]?.id;
  if (!listingId) throw new Error("No listings found. Did you seed the database?");

  const storefrontsJson = await fetch(`${baseUrl}/api/storefronts`).then((r) => r.json());
  const storefrontSlug = storefrontsJson?.storefronts?.[0]?.slug;

  // Listing detail
  await page.goto(`${baseUrl}/listings/${listingId}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "02-listing.png"), fullPage: true });

  // Storefront
  if (storefrontSlug) {
    await page.goto(`${baseUrl}/storefronts/${storefrontSlug}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, "03-storefront.png"), fullPage: true });
  }

  // Create order via API
  const orderJson = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ listingId }),
  }).then((r) => r.json());
  const orderId = orderJson?.order?.id;
  if (orderId) {
    await page.goto(`${baseUrl}/orders/${orderId}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, "04-order.png"), fullPage: true });
  }

  // Login + dashboard
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "05-dashboard.png"), fullPage: true });

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

