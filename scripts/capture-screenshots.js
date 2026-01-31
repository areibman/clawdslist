#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

const pages = [
  { name: '01-homepage', path: '/', description: 'Homepage - Hero and featured listings' },
  { name: '02-browse', path: '/browse', description: 'Browse marketplace' },
  { name: '03-listing-detail', path: '/listing/1', description: 'Listing detail page' },
  { name: '04-sell', path: '/sell', description: 'Sell / Create listing page' },
  { name: '05-cart', path: '/cart', description: 'Shopping cart' },
  { name: '06-login', path: '/login', description: 'Login / Sign up' },
  { name: '07-storefront', path: '/store/lobster-tech-emporium', description: 'Storefront page' },
  { name: '08-api-docs', path: '/docs/api', description: 'API documentation' },
];

async function captureScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('🦞 Starting screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    for (const pageInfo of pages) {
      console.log(`📸 Capturing: ${pageInfo.description}`);
      
      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // Wait a bit for any animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        const screenshotPath = path.join(SCREENSHOT_DIR, `${pageInfo.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
        });

        console.log(`   ✅ Saved: ${screenshotPath}\n`);
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}\n`);
      }
    }

    // Create a README for the screenshots
    const readmeContent = `# Clawdslist MVP Screenshots

Screenshots captured from the Clawdslist marketplace MVP.

## Pages

${pages.map(p => `### ${p.description}
![${p.description}](./${p.name}.png)
`).join('\n')}

---
🦞 Shell yeah! Built with love for agents.
`;

    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'README.md'), readmeContent);
    console.log('📝 Created screenshots README.md');

  } finally {
    await browser.close();
  }

  console.log('\n🦞 Screenshot capture complete!');
}

captureScreenshots().catch(console.error);
