import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const root = process.cwd();
const outDir = path.join(root, "screenshots");
const port = Number(process.env.PORT ?? 3010);
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForHealthy(url, timeoutMs = 90_000) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return;
    } catch {
      // ignore
    }
    if (Date.now() - start > timeoutMs) throw new Error(`Timed out waiting for ${url}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

function startNext() {
  const env = {
    ...process.env,
    PORT: String(port),
    NEXT_PUBLIC_APP_URL: baseUrl,
    DATABASE_URL:
      process.env.DATABASE_URL ??
      "postgresql://clawds:clawds@localhost:5432/clawdslist?schema=public",
    REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  };

  const child = spawn("npm", ["run", "dev", "-w", "apps/web", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (d) => process.stdout.write(d));
  child.stderr.on("data", (d) => process.stderr.write(d));
  return child;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  // Ensure Prisma client exists for Next server runtime.
  {
    const gen = spawnSync("npm", ["run", "db:generate"], {
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ??
          "postgresql://clawds:clawds@localhost:5432/clawdslist?schema=public",
      },
      stdio: "inherit",
    });
    if (gen.status !== 0) throw new Error("Failed to run prisma generate");
  }

  {
    const seed = spawnSync("npm", ["run", "db:seed"], {
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ??
          "postgresql://clawds:clawds@localhost:5432/clawdslist?schema=public",
      },
      stdio: "inherit",
    });
    if (seed.status !== 0) throw new Error("Failed to seed database");
  }

  const next = startNext();
  try {
    await waitForHealthy(`${baseUrl}/api/health`);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // Home
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "01-home.png"), fullPage: true });

    // Get one listing id
    const listingsRes = await fetch(`${baseUrl}/api/listings?take=1`, { cache: "no-store" });
    const listingsJson = await listingsRes.json();
    const listingId = listingsJson?.listings?.[0]?.id;
    if (!listingId) throw new Error("No listings found; did you seed the DB?");

    // Listing detail
    await page.goto(`${baseUrl}/l/${listingId}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "02-listing.png"), fullPage: true });

    // Storefront (seed slug is clawdbot)
    await page.goto(`${baseUrl}/s/clawdbot`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "03-storefront.png"), fullPage: true });

    // Seller login
    await page.goto(`${baseUrl}/sell/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, "04-seller-login.png"), fullPage: true });

    // Seller dashboard (login)
    await page.fill('input[name="apiKey"]', process.env.CLAWDS_DEMO_API_KEY ?? "CLWD_DEMO_KEY");
    await page.click('button:has-text("Enter seller dashboard")');
    await page.waitForURL(`${baseUrl}/sell`, { timeout: 30_000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "05-seller-dashboard.png"), fullPage: true });

    await browser.close();
  } finally {
    next.kill("SIGTERM");
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

