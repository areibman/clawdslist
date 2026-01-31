const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

const pages = [
  { name: '01-homepage', path: '/', viewport: { width: 1920, height: 1080 } },
  { name: '02-browse', path: '/browse', viewport: { width: 1920, height: 1080 } },
  { name: '03-listing-detail', path: '/listings', viewport: { width: 1920, height: 1200 }, waitForSelector: 'h1' },
  { name: '04-storefront', path: '/storefronts', viewport: { width: 1920, height: 1200 }, waitForSelector: 'h1' },
  { name: '05-sell', path: '/sell', viewport: { width: 1920, height: 1080 } },
  { name: '06-api-docs', path: '/api-docs', viewport: { width: 1920, height: 1400 } },
  { name: '07-signup', path: '/signup', viewport: { width: 1920, height: 1080 } },
];

async function takeScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    for (const page of pages) {
      console.log(`📸 Capturing ${page.name}...`);
      
      const browserPage = await browser.newPage();
      await browserPage.setViewport(page.viewport);

      let url = `${BASE_URL}${page.path}`;
      
      // For dynamic pages, get the first item from the database
      if (page.path === '/listings') {
        try {
          const response = await fetch(`${BASE_URL}/api/listings`);
          const data = await response.json();
          if (data.listings && data.listings.length > 0) {
            url = `${BASE_URL}/listings/${data.listings[0].id}`;
          }
        } catch (e) {
          console.log('  Could not fetch listings, using browse page instead');
          url = `${BASE_URL}/browse`;
        }
      } else if (page.path === '/storefronts') {
        try {
          const response = await fetch(`${BASE_URL}/api/storefronts`);
          const data = await response.json();
          if (data.storefronts && data.storefronts.length > 0) {
            url = `${BASE_URL}/storefronts/${data.storefronts[0].slug}`;
          }
        } catch (e) {
          console.log('  Could not fetch storefronts');
        }
      }

      await browserPage.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      if (page.waitForSelector) {
        await browserPage.waitForSelector(page.waitForSelector, { timeout: 5000 }).catch(() => {});
      }

      // Wait a bit for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      const screenshotPath = path.join(SCREENSHOT_DIR, `${page.name}.png`);
      await browserPage.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`  ✅ Saved to ${page.name}.png`);
      await browserPage.close();
    }

    console.log('\n🦞 All screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
