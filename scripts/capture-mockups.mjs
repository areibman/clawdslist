import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOCKUPS_DIR = join(__dirname, '..', 'screenshots', 'mockups');
const OUTPUT_DIR = join(__dirname, '..', 'screenshots');

async function captureScreenshots() {
  console.log('📸 Starting screenshot capture from HTML mockups...\n');
  
  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Get all HTML files
  const files = await readdir(MOCKUPS_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  
  // Capture each page
  for (const file of htmlFiles) {
    const name = file.replace('.html', '');
    const filePath = join(MOCKUPS_DIR, file);
    
    console.log(`📸 Capturing ${name}...`);
    
    try {
      await page.goto(`file://${filePath}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500)); // Wait for fonts/styles
      
      await page.screenshot({
        path: join(OUTPUT_DIR, `${name}.png`),
        fullPage: true,
      });
      
      console.log(`   ✅ Saved: screenshots/${name}.png`);
    } catch (error) {
      console.log(`   ⚠️ Failed: ${error.message}`);
    }
  }
  
  await browser.close();
  
  console.log('\n🎉 Screenshots complete!');
  console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
}

captureScreenshots().catch(console.error);
