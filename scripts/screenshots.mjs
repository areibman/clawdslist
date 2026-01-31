import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '..', 'screenshots');
const BASE_URL = 'http://localhost:3000';

// Pages to screenshot (static pages that don't require DB)
const pages = [
  { path: '/login', name: '01-login', description: 'Login/Register page' },
  { path: '/sell', name: '02-sell', description: 'Create listing page' },
  { path: '/cart', name: '03-cart', description: 'Shopping cart page' },
  { path: '/dashboard', name: '04-dashboard', description: 'Seller dashboard' },
  { path: '/docs/api', name: '05-api-docs', description: 'API documentation' },
];

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function takeScreenshots() {
  // Create screenshots directory
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  
  console.log('📸 Starting screenshot capture...\n');
  
  // Start the dev server
  console.log('🚀 Starting Next.js server...');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, '..', 'apps', 'web'),
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, DATABASE_URL: 'postgresql://placeholder:placeholder@localhost:5432/placeholder' },
  });
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server...');
  const serverReady = await waitForServer(BASE_URL, 60);
  
  if (!serverReady) {
    console.log('❌ Server failed to start');
    server.kill();
    process.exit(1);
  }
  
  console.log('✅ Server is ready!\n');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Take screenshots
  for (const pageInfo of pages) {
    try {
      console.log(`📸 Capturing ${pageInfo.name}: ${pageInfo.description}`);
      await page.goto(`${BASE_URL}${pageInfo.path}`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit for any animations
      await new Promise(r => setTimeout(r, 500));
      
      await page.screenshot({ 
        path: join(SCREENSHOTS_DIR, `${pageInfo.name}.png`),
        fullPage: true 
      });
      
      console.log(`   ✅ Saved: screenshots/${pageInfo.name}.png`);
    } catch (error) {
      console.log(`   ⚠️ Failed to capture ${pageInfo.name}: ${error.message}`);
    }
  }
  
  // Cleanup
  await browser.close();
  server.kill();
  
  console.log('\n🎉 Screenshots complete!');
  console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
}

takeScreenshots().catch(console.error);
