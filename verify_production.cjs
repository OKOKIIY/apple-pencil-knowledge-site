const { chromium } = require('playwright');

const baseUrl = process.env.PRODUCTION_URL || 'https://apple-pencil-knowledge-site.pages.dev';
const query = '?year=2026&series=air&variant=air_m4_11&purpose=notes&result=1#match';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  try {
    const response = await page.goto(`${baseUrl.replace(/\/$/, '')}/${query}`, { waitUntil: 'networkidle' });
    assert(response && response.ok(), `production response was not successful: ${response && response.status()}`);
    assert((await page.title()).includes('Apple Pencil'), 'production title is missing Apple Pencil');
    assert(await page.locator('#result-section').isVisible(), 'production result section is not visible');
    assert((await page.locator('#primary-name').innerText()).includes('USB-C 第三代笔'), 'production query result is incorrect');
    assert(errors.length === 0, `production browser errors: ${errors.join('; ')}`);
    console.log(`Production verification passed: ${page.url()}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
