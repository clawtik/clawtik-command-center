import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const PASSWORD = 'gtech';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Login first
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(BASE + '/');
  await page.waitForTimeout(2000); // let widgets load

  // Full page screenshot
  await page.screenshot({ path: 'tests/screenshots/dashboard.png', fullPage: true });
  console.log('✅ Dashboard screenshot saved to tests/screenshots/dashboard.png');

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
