import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import waitOn from "wait-on";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(appDir, "..", "..");
const outputDir = path.resolve(rootDir, "screenshots");
const port = 3005;
const baseUrl = `http://localhost:${port}`;

const pages = [
  { name: "home", path: "/" },
  { name: "listing-detail", path: "/listings/reef-ai-pod" },
  { name: "storefront", path: "/storefronts/reef-labs" },
  { name: "sell", path: "/sell" },
  { name: "checkout", path: "/checkout" },
  { name: "messages", path: "/messages" },
];

async function startServer() {
  const server = spawn("npx", ["next", "start", "-p", String(port)], {
    cwd: appDir,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
    },
  });

  await waitOn({
    resources: [`${baseUrl}/api/health`],
    timeout: 60_000,
  });

  return server;
}

async function capture() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  for (const entry of pages) {
    await page.goto(`${baseUrl}${entry.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(outputDir, `${entry.name}.png`),
      fullPage: true,
    });
  }

  await browser.close();
}

const server = await startServer();

try {
  await capture();
} finally {
  server.kill("SIGTERM");
}
