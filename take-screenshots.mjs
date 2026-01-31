import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const baseUrl = 'http://localhost:3000';
const screenshotsDir = '/workspace/screenshots';

// Create screenshots directory
mkdirSync(screenshotsDir, { recursive: true });

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('📸 Taking screenshots...');

  // 1. Homepage
  console.log('  - Homepage');
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/01-homepage.png`, fullPage: true });

  // 2. Browse page
  console.log('  - Browse page');
  await page.goto(`${baseUrl}/browse`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/02-browse.png`, fullPage: true });

  // 3. Categories page
  console.log('  - Categories page');
  await page.goto(`${baseUrl}/categories`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/03-categories.png`, fullPage: true });

  // 4. Storefronts page
  console.log('  - Storefronts page');
  await page.goto(`${baseUrl}/storefronts`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/04-storefronts.png`, fullPage: true });

  // 5. Storefront detail
  console.log('  - Storefront detail');
  await page.goto(`${baseUrl}/storefronts/clawdbot-store`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/05-storefront-detail.png`, fullPage: true });

  // 6. Listing detail (get first listing ID from browse page)
  console.log('  - Listing detail');
  await page.goto(`${baseUrl}/browse`);
  await page.waitForLoadState('networkidle');
  const firstListing = await page.locator('a[href^="/listings/"]').first();
  const listingHref = await firstListing.getAttribute('href');
  if (listingHref) {
    await page.goto(baseUrl + listingHref);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotsDir}/06-listing-detail.png`, fullPage: true });
  }

  // 7. Login page
  console.log('  - Login page');
  await page.goto(`${baseUrl}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/07-login.png`, fullPage: true });

  // 8. Signup page
  console.log('  - Signup page');
  await page.goto(`${baseUrl}/signup`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/08-signup.png`, fullPage: true });

  // 9. Login and go to dashboard
  console.log('  - Logging in...');
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${baseUrl}/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/09-dashboard.png`, fullPage: true });

  // 10. Create listing page
  console.log('  - Create listing page');
  await page.goto(`${baseUrl}/create-listing`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/10-create-listing.png`, fullPage: true });

  // 11. API docs page
  console.log('  - API documentation page');
  await page.goto(`${baseUrl}/api-docs`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshotsDir}/11-api-docs.png`, fullPage: true });

  await browser.close();
  console.log('✅ Screenshots saved to:', screenshotsDir);
}

takeScreenshots().catch(console.error);
