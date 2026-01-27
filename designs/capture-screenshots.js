const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2, // Retina quality
};

const THEMES = [
  { name: 'neon-dojo', modes: ['light', 'dark'] },
  { name: 'sakura-garden', modes: ['light', 'dark'] },
  { name: 'edo-woodblock', modes: ['light', 'dark'] },
  { name: 'digital-mono', modes: ['light', 'dark'] },
];

async function captureScreenshots() {
  const designsDir = __dirname;
  const screenshotsDir = path.join(designsDir, 'screenshots');

  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  for (const theme of THEMES) {
    for (const mode of theme.modes) {
      const htmlPath = path.join(designsDir, theme.name, `${mode}.html`);
      const screenshotPath = path.join(screenshotsDir, `${theme.name}-${mode}.png`);

      if (!fs.existsSync(htmlPath)) {
        console.warn(`Warning: ${htmlPath} not found, skipping...`);
        continue;
      }

      console.log(`Capturing ${theme.name} ${mode}...`);

      // Navigate to the HTML file
      await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0',
      });

      // Wait for fonts to load
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      // Small delay for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Take screenshot
      await page.screenshot({
        path: screenshotPath,
        type: 'png',
      });

      console.log(`  Saved: ${screenshotPath}`);
    }
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
  console.log(`Screenshots saved to: ${screenshotsDir}`);
}

captureScreenshots().catch(console.error);
