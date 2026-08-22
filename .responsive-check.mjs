import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = process.argv[2];
const BASE = 'http://localhost:5173';

const WIDTHS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'signup', path: '/signup' },
  { name: 'pricing-anchor', path: '/#pricing' },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const vp of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + String(e).slice(0, 200)));

  for (const p of PAGES) {
    try {
      await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await page.waitForTimeout(900);

    // Horizontal overflow is the classic responsive break.
    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const offenders = [];
      for (const el of Array.from(document.querySelectorAll('*'))) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > de.clientWidth + 2) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className || '').slice(0, 90),
            right: Math.round(r.right),
          });
        }
      }
      return {
        scrollW: de.scrollWidth,
        clientW: de.clientWidth,
        bodyText: (document.body.innerText || '').trim().length,
        offenders: offenders.slice(0, 6),
      };
    });

    const overflow = metrics.scrollW > metrics.clientW + 2;
    if (overflow || metrics.bodyText < 50) {
      problems.push({ vp: vp.name, page: p.name, ...metrics, overflow });
    }

    await page.screenshot({
      path: `${OUT}/${p.name}-${vp.name}.png`,
      fullPage: false,
    });
    console.log(
      `${p.name.padEnd(16)} ${vp.name.padEnd(8)} scrollW=${metrics.scrollW} clientW=${metrics.clientW}` +
        `${overflow ? '  ⚠ H-OVERFLOW' : ''}${metrics.bodyText < 50 ? '  ⚠ EMPTY' : ''}`
    );
  }

  if (consoleErrors.length) {
    console.log(`  console errors @${vp.name}: ${[...new Set(consoleErrors)].slice(0, 4).join(' | ')}`);
  }
  await ctx.close();
}

await browser.close();

console.log('\n=== PROBLEMS ===');
if (!problems.length) console.log('none');
for (const p of problems) {
  console.log(`${p.page} @ ${p.vp}: scrollW ${p.scrollW} vs ${p.clientW}`);
  for (const o of p.offenders) console.log(`    <${o.tag} class="${o.cls}"> right=${o.right}`);
}
