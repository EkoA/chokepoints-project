const pkg = require('/Users/eko/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js');
const { chromium } = pkg;

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
  page.on('console', m => {
    if (!m.text().includes('WebGL') && !m.text().includes('GPU stall') && !m.text().includes('vite')) {
      log.push(`[${m.type()}] ${m.text()}`);
    }
  });
  page.on('pageerror', e => log.push(`[PAGEERROR] ${e.message}`));

  console.log('Navigating to', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click "Show me where the world breaks" to enter the map
  console.log('Clicking intro CTA button...');
  try {
    await page.click('button:has-text("Show me where the world breaks")', { timeout: 5000 });
    console.log('Clicked CTA button');
  } catch(e) {
    console.log('CTA click failed, trying text:', e.message.substring(0, 100));
    try {
      await page.getByText('Show me where the world breaks').click({ timeout: 3000 });
    } catch(e2) {
      console.log('Text click also failed:', e2.message.substring(0, 100));
    }
  }

  // Wait for map to render
  await page.waitForTimeout(4000);

  // Screenshot of the full map view
  await page.screenshot({ path: `${OUT}/06-map-view-full.png`, fullPage: false });
  console.log('Screenshot 6: full map view after CTA click');

  // Screenshot top bar (ModeBar) area
  await page.screenshot({
    path: `${OUT}/07-modebar.png`,
    clip: { x: 0, y: 0, width: 1400, height: 60 },
  });
  console.log('Screenshot 7: ModeBar / top nav (0-60px height)');

  // Screenshot the Traffic Heat widget area (top-right of map: x=650-1050, y=90-185)
  await page.screenshot({
    path: `${OUT}/08-traffic-heat-widget.png`,
    clip: { x: 650, y: 90, width: 400, height: 100 },
  });
  console.log('Screenshot 8: Traffic Heat widget area (x:650-1050, y:90-185)');

  // Screenshot the right sidebar/legend area
  await page.screenshot({
    path: `${OUT}/09-right-sidebar.png`,
    clip: { x: 990, y: 90, width: 410, height: 700 },
  });
  console.log('Screenshot 9: right sidebar / legend');

  // Get current page state
  const pageTitle = await page.title();
  console.log('Page title:', pageTitle);

  // Check what's now visible
  const mapViewButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .map(b => {
        const r = b.getBoundingClientRect();
        return {
          text: b.textContent.trim().substring(0, 60),
          rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
          visible: r.width > 0 && r.height > 0,
        };
      })
      .filter(b => b.visible && b.text.length > 0)
      .slice(0, 30);
  });
  console.log('Visible buttons after map open:', JSON.stringify(mapViewButtons, null, 2));

  // Check for Traffic Heat widget
  const trafficHeatPanel = await page.evaluate(() => {
    const results = [];
    for (const el of document.querySelectorAll('*')) {
      if (el.textContent && el.textContent.includes('Traffic Heat') && el.children.length < 10) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.width < 500) {
          results.push({
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 150),
            rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
            class: el.className ? el.className.toString().substring(0, 100) : '',
          });
        }
      }
    }
    return results;
  });
  console.log('Traffic Heat panel elements:', JSON.stringify(trafficHeatPanel, null, 2));

  // Try clicking "All Traffic" button using coordinates (from previous run: top:139, left:688)
  console.log('\nAttempting to click "All Traffic" button at coordinates...');
  try {
    // Use force:true to bypass pointer intercept
    await page.click('button:has-text("All Traffic")', { force: true, timeout: 3000 });
    console.log('Clicked All Traffic with force');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/10-after-all-traffic-force.png` });
    console.log('Screenshot 10: after force-clicking All Traffic');
  } catch(e) {
    console.log('Force click failed:', e.message.substring(0, 150));
    // Try direct coordinate click
    try {
      await page.mouse.click(720, 151); // center of All Traffic button (left:688, w:64 → center≈720; top:139, h:23 → center≈151)
      console.log('Clicked via mouse coordinates (720, 151)');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${OUT}/10-after-coordinate-click.png` });
      console.log('Screenshot 10: after coordinate click on All Traffic');
    } catch(e2) {
      console.log('Coordinate click failed:', e2.message.substring(0, 100));
    }
  }

  // Now check if heatmap layers appeared
  const mapLayers = await page.evaluate(() => {
    const results = [];
    const keywords = ['heatmap', 'heat', 'layer', 'traffic', 'density'];
    for (const el of document.querySelectorAll('[class]')) {
      const cls = el.className ? el.className.toString().toLowerCase() : '';
      for (const kw of keywords) {
        if (cls.includes(kw)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            results.push({ class: el.className.toString().substring(0, 80), tag: el.tagName });
            break;
          }
        }
      }
    }
    return results;
  });
  console.log('Heatmap/layer elements in DOM:', JSON.stringify(mapLayers, null, 2));

  // Try clicking each commodity button
  const commodityButtons = ['All Traffic', 'Oil & LNG', 'Containers', 'Bulk Cargo'];
  for (const label of commodityButtons) {
    try {
      const btn = page.getByRole('button', { name: label });
      const count = await btn.count();
      if (count > 0) {
        const rect = await btn.first().boundingBox();
        console.log(`Button "${label}" bounding box:`, rect);
        // Click via direct coordinates on the element
        if (rect) {
          await page.mouse.click(rect.x + rect.width/2, rect.y + rect.height/2);
          console.log(`Clicked "${label}" via mouse`);
          await page.waitForTimeout(1500);
          const fname = label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
          await page.screenshot({ path: `${OUT}/11-after-${fname}.png` });
          console.log(`Screenshot: after clicking "${label}"`);
        }
      }
    } catch(e) {
      console.log(`Error with "${label}":`, e.message.substring(0, 80));
    }
  }

  // Final full screenshot
  await page.screenshot({ path: `${OUT}/12-final-state.png`, fullPage: false });
  console.log('Screenshot 12: final state');

  // Detailed check of what element is intercepting clicks on the Traffic Heat buttons
  const interceptInfo = await page.evaluate(() => {
    // Check what's at position (720, 151) - where All Traffic button should be
    const el = document.elementFromPoint(720, 151);
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    return {
      found: true,
      tag: el.tagName,
      text: el.textContent.trim().substring(0, 100),
      class: el.className ? el.className.toString().substring(0, 100) : '',
      rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
    };
  });
  console.log('Element at (720, 151) - All Traffic button position:', JSON.stringify(interceptInfo, null, 2));

  // Check what intercepts at y=145 (midpoint) x=720
  const interceptors = await page.evaluate(() => {
    const points = [
      [720, 145], [760, 145], [850, 145], [920, 145], // traffic heat buttons
      [688, 120], // traffic heat label
    ];
    return points.map(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { x, y, found: false };
      return {
        x, y,
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 60),
        class: el.className ? el.className.toString().substring(0, 80) : '',
      };
    });
  });
  console.log('Elements intercepting at Traffic Heat button positions:', JSON.stringify(interceptors, null, 2));

  console.log('\n=== PAGE CONSOLE LOGS ===');
  log.forEach(l => console.log(l));

  await browser.close();
  console.log('\nDone.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
