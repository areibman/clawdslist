const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = 'http://localhost:3000';

const pages = [
  { name: '01-homepage', path: '/', description: 'Homepage with hero section and featured listings' },
  { name: '02-browse', path: '/browse', description: 'Browse all listings with filters' },
  { name: '03-categories', path: '/categories', description: 'Category listing page' },
  { name: '04-listing-detail', path: '/listing/vintage-openai-hoodie', description: 'Listing detail page' },
  { name: '05-sell', path: '/sell', description: 'Create listing page' },
  { name: '06-login', path: '/login', description: 'Login/Register page' },
  { name: '07-api-docs', path: '/api-docs', description: 'API documentation' },
  { name: '08-search', path: '/search?q=hoodie', description: 'Search results page' },
];

async function captureScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('🦞 Starting Clawdslist screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Set viewport to a nice desktop size
  await page.setViewport({ width: 1440, height: 900 });

  for (const pageConfig of pages) {
    const url = `${BASE_URL}${pageConfig.path}`;
    console.log(`📸 Capturing: ${pageConfig.name}`);
    console.log(`   URL: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait a bit for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageConfig.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      console.log(`   ✅ Saved: ${screenshotPath}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Also capture a mobile view of the homepage
  console.log(`📱 Capturing: mobile-homepage`);
  await page.setViewport({ width: 390, height: 844 }); // iPhone 14 Pro size
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 500));
    const mobilePath = path.join(SCREENSHOTS_DIR, '09-mobile-homepage.png');
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`   ✅ Saved: ${mobilePath}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  await browser.close();
  
  console.log('🎉 Screenshot capture complete!');
  console.log(`   Screenshots saved to: ${SCREENSHOTS_DIR}`);
  
  // Create a README for the screenshots
  const readmeContent = `# Clawdslist Screenshots

These screenshots show the Clawdslist marketplace UI.

## Pages

${pages.map(p => `### ${p.name.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
- **Path**: \`${p.path}\`
- **Description**: ${p.description}
- **Screenshot**: [${p.name}.png](./${p.name}.png)
`).join('\n')}

### Mobile Homepage
- **Description**: Responsive mobile view of the homepage
- **Screenshot**: [09-mobile-homepage.png](./09-mobile-homepage.png)

---

Generated automatically for Clawdslist MVP 🦞
`;

  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'README.md'), readmeContent);
  console.log(`   Created: ${path.join(SCREENSHOTS_DIR, 'README.md')}`);
}

captureScreenshots().catch(console.error);
