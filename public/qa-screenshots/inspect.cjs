const pkg = require('/Users/eko/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js');
const { chromium } = pkg;
const path = require('path');

const BASE_URL = 'http://localhost:5174/chokepoints-project/';
const OUT = '/Users/eko/Documents/laravel-sites/chokepoints-project/critical-node-atlas/public/qa-screenshots';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const log = [];
  page.on('console', m => log.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', e => log.push(`[PAGEERROR] ${e.message}`));

  console.log('Navigating to', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Full app screenshot
  await page.screenshot({ path: `${OUT}/01-full-app.png`, fullPage: false });
  console.log('Screenshot 1: full app saved');

  // 2. Get page title
  const title = await page.title();
  console.log('Page title:', title);

  // 3. Look for Traffic Heat widget - scan DOM
  const trafficHeatInfo = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const matches = [];
    for (const el of allElements) {
      if (el.textContent && el.textContent.includes('Traffic Heat') && el.children.length < 5) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          matches.push({
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 100),
            rect: { top: Math.round(rect.top), left: Math.round(rect.left), w: Math.round(rect.width), h: Math.round(rect.height) },
            className: el.className ? el.className.toString().substring(0, 80) : '',
            id: el.id,
          });
        }
      }
    }
    return matches.slice(0, 20);
  });
  console.log('Traffic Heat elements found:', JSON.stringify(trafficHeatInfo, null, 2));

  // 4. Look for ModeBar / top bar / navigation
  const topBarText = await page.evaluate(() => {
    const selectors = [
      '[class*="modebar"]', '[class*="ModeBar"]', '[class*="mode-bar"]',
      '[class*="toolbar"]', '[class*="TopBar"]', '[class*="top-bar"]',
      '[class*="Header"]', '[class*="header"]', 'nav', 'header',
      '[class*="mode"]', '[class*="Mode"]',
    ];
    const results = [];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          results.push({
            selector: sel,
            text: el.textContent.trim().substring(0, 200),
            rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
            className: el.className ? el.className.toString().substring(0, 100) : '',
          });
        }
      }
    }
    return results;
  });
  console.log('ModeBar/Toolbar/Header elements:', JSON.stringify(topBarText, null, 2));

  // 5. Screenshot top-right quadrant of the map
  await page.screenshot({
    path: `${OUT}/02-top-right-area.png`,
    clip: { x: 700, y: 0, width: 700, height: 450 },
  });
  console.log('Screenshot 2: top-right area saved');

  // 6. Screenshot top bar (ModeBar area - first 120px height)
  await page.screenshot({
    path: `${OUT}/03-top-bar.png`,
    clip: { x: 0, y: 0, width: 1400, height: 120 },
  });
  console.log('Screenshot 3: top bar saved');

  // 7. Find all visible buttons
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button, [role="button"], [class*="btn"]');
    return Array.from(btns).map(b => {
      const r = b.getBoundingClientRect();
      return {
        text: b.textContent.trim().substring(0, 60),
        visible: r.width > 0 && r.height > 0,
        rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
        className: b.className ? b.className.toString().substring(0, 60) : '',
      };
    }).filter(b => b.visible);
  });
  console.log('Visible buttons:', JSON.stringify(buttons, null, 2));

  // 8. Find commodity-related elements
  const commodityEls = await page.evaluate(() => {
    const keywords = ['traffic', 'heat', 'heatmap', 'commodity', 'oil', 'gas', 'grain', 'coal', 'layer', 'widget', 'overlay'];
    const results = [];
    for (const el of document.querySelectorAll('[class]')) {
      const cls = el.className ? el.className.toString().toLowerCase() : '';
      const txt = el.textContent ? el.textContent.trim().toLowerCase().substring(0, 80) : '';
      const matches = keywords.filter(k => cls.includes(k) || txt.includes(k));
      if (matches.length > 0) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          results.push({
            tag: el.tagName,
            matchedKeywords: matches,
            class: el.className.toString().substring(0, 80),
            text: el.textContent.trim().substring(0, 80),
            rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
          });
        }
      }
    }
    return results.slice(0, 30);
  });
  console.log('Commodity/heat/traffic DOM elements:', JSON.stringify(commodityEls, null, 2));

  // 9. Try to click "All Traffic" button
  let clickedTraffic = false;
  try {
    const trafficBtn = page.getByText('All Traffic', { exact: false });
    const count = await trafficBtn.count();
    console.log('All Traffic button count:', count);
    if (count > 0) {
      await trafficBtn.first().click({ timeout: 3000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${OUT}/04-after-all-traffic-click.png` });
      console.log('Screenshot 4: after clicking All Traffic');
      clickedTraffic = true;
    }
  } catch(e) {
    console.log('Could not click All Traffic:', e.message);
  }

  // 10. Try clicking any commodity button found
  const commodityButtonLabels = ['All Traffic', 'All', 'Oil', 'Natural Gas', 'Coal', 'Grain', 'Iron Ore', 'LNG'];
  if (!clickedTraffic) {
    for (const label of commodityButtonLabels) {
      try {
        const btn = page.getByRole('button', { name: label, exact: false });
        const cnt = await btn.count();
        if (cnt > 0) {
          console.log(`Found button "${label}", clicking...`);
          await btn.first().click({ timeout: 2000 });
          await page.waitForTimeout(1500);
          await page.screenshot({ path: `${OUT}/04-after-${label.replace(/\s+/g, '-').toLowerCase()}-click.png` });
          console.log(`Screenshot: after clicking "${label}"`);
          break;
        }
      } catch(e) {
        // continue
      }
    }
  }

  // 11. Canvas / map info
  const canvasInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('canvas')).map(c => {
      const r = c.getBoundingClientRect();
      return {
        canvasW: c.width, canvasH: c.height,
        displayRect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
        id: c.id, class: c.className,
      };
    });
  });
  console.log('Canvas elements (map):', JSON.stringify(canvasInfo, null, 2));

  // 12. Get ALL leaf text in the top-right area (right half, top 500px)
  const topRightText = await page.evaluate(() => {
    const texts = [];
    for (const el of document.querySelectorAll('*')) {
      if (el.children.length === 0) {
        const r = el.getBoundingClientRect();
        if (r.left > 600 && r.top < 550 && r.top >= 0 && r.width > 0 && r.height > 0) {
          const t = el.textContent.trim();
          if (t.length > 0 && t.length < 100) {
            texts.push({ text: t, rect: { top: Math.round(r.top), left: Math.round(r.left) } });
          }
        }
      }
    }
    return texts.slice(0, 60);
  });
  console.log('Text content in top-right area (left>600, top<550):', JSON.stringify(topRightText, null, 2));

  // 13. Full page screenshot
  await page.screenshot({ path: `${OUT}/05-full-page.png`, fullPage: true });
  console.log('Screenshot 5: full page saved');

  // 14. Console logs from the page
  console.log('\n=== PAGE CONSOLE LOGS ===');
  log.forEach(l => console.log(l));

  await browser.close();
  console.log('\nDone.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
