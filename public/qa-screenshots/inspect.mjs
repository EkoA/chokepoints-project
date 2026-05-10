import { chromium } from '/Users/eko/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';

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
  console.log('Screenshot 1: full app');

  // 2. Get page title and visible text
  const title = await page.title();
  console.log('Page title:', title);

  // 3. Look for Traffic Heat widget - scan DOM
  const trafficHeatInfo = await page.evaluate(() => {
    // Search all elements for "Traffic Heat" text
    const allElements = document.querySelectorAll('*');
    const matches = [];
    for (const el of allElements) {
      if (el.childNodes) {
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Traffic Heat')) {
            const rect = el.getBoundingClientRect();
            matches.push({
              tag: el.tagName,
              text: el.textContent.trim().substring(0, 100),
              visible: rect.width > 0 && rect.height > 0,
              rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
              className: el.className,
              id: el.id,
            });
          }
        }
      }
    }
    return matches;
  });
  console.log('Traffic Heat elements found:', JSON.stringify(trafficHeatInfo, null, 2));

  // 4. Look for ModeBar
  const modeBarInfo = await page.evaluate(() => {
    // Look for modebar or top navigation bar
    const selectors = [
      '[class*="modebar"]',
      '[class*="ModeBar"]',
      '[class*="mode-bar"]',
      '[class*="toolbar"]',
      '[class*="TopBar"]',
      '[class*="top-bar"]',
      '[class*="header"]',
      '[class*="Header"]',
      'nav',
    ];
    const results = {};
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        results[sel] = Array.from(els).map(el => ({
          text: el.textContent.trim().substring(0, 150),
          rect: (() => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, w: r.width, h: r.height }; })(),
          className: el.className.toString().substring(0, 80),
        }));
      }
    }
    return results;
  });
  console.log('ModeBar/Toolbar elements:', JSON.stringify(modeBarInfo, null, 2));

  // 5. Screenshot top-right area of the map - crop to top-right quadrant
  await page.screenshot({
    path: `${OUT}/02-top-right-area.png`,
    clip: { x: 700, y: 0, width: 700, height: 450 },
  });
  console.log('Screenshot 2: top-right area');

  // 6. Screenshot top portion (ModeBar area)
  await page.screenshot({
    path: `${OUT}/03-top-bar.png`,
    clip: { x: 0, y: 0, width: 1400, height: 120 },
  });
  console.log('Screenshot 3: top bar / ModeBar');

  // 7. Find all buttons and controls in the app
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button, [role="button"], [class*="btn"], [class*="Button"]');
    return Array.from(btns).map(b => ({
      text: b.textContent.trim().substring(0, 60),
      visible: (() => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; })(),
      rect: (() => { const r = b.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left) }; })(),
      className: b.className.toString().substring(0, 60),
      disabled: b.disabled,
    })).filter(b => b.visible);
  });
  console.log('Visible buttons:', JSON.stringify(buttons, null, 2));

  // 8. Full DOM structure summary - look for key components
  const domSummary = await page.evaluate(() => {
    const interesting = [];
    // Look for commodity-related, heatmap, traffic keywords
    const keywords = ['heat', 'traffic', 'commodity', 'heatmap', 'widget', 'panel', 'map', 'legend'];
    const allEls = document.querySelectorAll('[class]');
    for (const el of allEls) {
      const cls = el.className.toString().toLowerCase();
      const text = el.textContent.trim().substring(0, 80).toLowerCase();
      for (const kw of keywords) {
        if (cls.includes(kw) || text.includes(kw)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            interesting.push({
              tag: el.tagName,
              class: el.className.toString().substring(0, 80),
              text: el.textContent.trim().substring(0, 80),
              rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
            });
            break;
          }
        }
      }
    }
    return interesting.slice(0, 40);
  });
  console.log('Interesting DOM elements (heat/traffic/map/commodity):', JSON.stringify(domSummary, null, 2));

  // 9. Try to find and click "All Traffic" button
  const allTrafficBtn = await page.$('button:has-text("All Traffic"), [class*="traffic"]:has-text("All"), button:has-text("All")');
  if (allTrafficBtn) {
    console.log('Found "All Traffic" button - clicking...');
    await allTrafficBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/04-after-all-traffic-click.png` });
    console.log('Screenshot 4: after All Traffic click');
  } else {
    console.log('No "All Traffic" button found directly');
    // Try text-based search
    const textBtn = await page.getByText('All Traffic', { exact: false }).first();
    try {
      await textBtn.click({ timeout: 2000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${OUT}/04-after-all-traffic-click.png` });
      console.log('Screenshot 4: after All Traffic text-click');
    } catch(e) {
      console.log('Could not click All Traffic:', e.message);
    }
  }

  // 10. Look for any commodity buttons
  const commodityButtons = await page.evaluate(() => {
    const commodities = ['All Traffic', 'Oil', 'Gas', 'Coal', 'Grain', 'Shipping', 'Trade', 'Iron', 'Steel'];
    const found = [];
    for (const c of commodities) {
      const els = Array.from(document.querySelectorAll('button, [role="button"]'));
      for (const el of els) {
        if (el.textContent.includes(c)) {
          const r = el.getBoundingClientRect();
          found.push({
            commodity: c,
            text: el.textContent.trim().substring(0, 50),
            visible: r.width > 0 && r.height > 0,
            rect: { top: Math.round(r.top), left: Math.round(r.left) },
          });
        }
      }
    }
    return found;
  });
  console.log('Commodity buttons found:', JSON.stringify(commodityButtons, null, 2));

  // 11. Screenshot entire page scrolled - look for the Traffic Heat panel
  // Scroll down a bit to ensure full render
  await page.screenshot({ path: `${OUT}/05-full-page.png`, fullPage: true });
  console.log('Screenshot 5: full page');

  // 12. Console log summary
  console.log('\n=== CONSOLE LOGS ===');
  log.forEach(l => console.log(l));

  // 13. Check if there's a canvas (map element)
  const canvasInfo = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    return Array.from(canvases).map(c => ({
      width: c.width, height: c.height,
      rect: (() => { const r = c.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; })(),
    }));
  });
  console.log('Canvas elements (map):', JSON.stringify(canvasInfo, null, 2));

  // 14. Get all text content in top-right quadrant (700-1400 x, 0-400 y)
  const topRightText = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const texts = [];
    for (const el of elements) {
      const r = el.getBoundingClientRect();
      if (r.left > 650 && r.top < 500 && r.width > 0 && r.height > 0 && el.children.length === 0) {
        const t = el.textContent.trim();
        if (t.length > 0 && t.length < 100) {
          texts.push({ text: t, rect: { top: Math.round(r.top), left: Math.round(r.left) } });
        }
      }
    }
    return texts.slice(0, 50);
  });
  console.log('Text in top-right area:', JSON.stringify(topRightText, null, 2));

  await browser.close();
  console.log('\nDone. Screenshots saved to:', OUT);
})();
