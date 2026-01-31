const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = 'http://localhost:3000';

async function capture(name, urlPath) {
  console.log(`📸 Capturing: ${name}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    const url = `${BASE_URL}${urlPath}`;
    console.log(`   URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`   ✅ Saved: ${screenshotPath}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Capture remaining pages
  await capture('01-homepage', '/');
  await capture('03-categories', '/categories');
  await capture('05-sell', '/sell');
  await capture('06-login', '/login');
  await capture('08-search', '/search?q=hoodie');
  await capture('09-mobile-homepage', '/');
  
  console.log('\n🎉 Done!');
}

main();
