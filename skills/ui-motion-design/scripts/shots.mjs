#!/usr/bin/env node
// Visual check in one image: screenshots of a page across viewports × colour schemes (× reduced motion),
// assembled into a labelled contact sheet. Use it after every build and attach it to reviews.
//
//   node shots.mjs <url|file.html> [--out ./shots] [--viewports 390x844,1440x900] [--themes light,dark]
//                  [--full] [--max-height 3200] [--section "#pricing"] [--reduced] [--auth user:pass] [--wait 900]
//
// Writes <out>/sheet.png plus one PNG per cell. --full captures the whole page (cropped to --max-height),
// otherwise the first screen. --section scrolls to a selector first. --reduced adds a reduced-motion column.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values: a, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', default: './shots' }, viewports: { type: 'string', default: '390x844,1440x900' },
    themes: { type: 'string', default: 'light,dark' }, full: { type: 'boolean', default: false },
    'max-height': { type: 'string', default: '3200' }, section: { type: 'string' }, reduced: { type: 'boolean', default: false },
    auth: { type: 'string' }, wait: { type: 'string', default: '900' },
  },
});
if (!positionals[0]) { console.log('Usage: node shots.mjs <url|file.html> [--out ./shots] [--viewports 390x844,1440x900] [--themes light,dark] [--full] [--section "#id"] [--reduced]'); process.exit(1); }

let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.error('Playwright not found. In the skill folder: npm install && npx playwright install chromium'); process.exit(1); }

const target = /^https?:|^file:/.test(positionals[0]) ? positionals[0] : existsSync(positionals[0]) ? pathToFileURL(resolve(positionals[0])).href : `https://${positionals[0]}`;
const outDir = resolve(a.out); mkdirSync(outDir, { recursive: true });
const vps = a.viewports.split(',').map((v) => { const [w, h] = v.split('x').map(Number); return { width: w, height: h || 900 }; });
const themes = a.themes.split(',');
const variants = themes.map((t) => ({ theme: t, reduced: false }));
if (a.reduced) variants.push({ theme: themes[0], reduced: true });
const maxH = Number(a['max-height']);
const httpCredentials = a.auth ? { username: a.auth.split(':')[0], password: a.auth.split(':').slice(1).join(':') } : undefined;

const browser = await chromium.launch();
const cells = [];
for (const vp of vps) {
  for (const v of variants) {
    const isMobile = vp.width < 768;
    const ctx = await browser.newContext({ viewport: vp, colorScheme: v.theme, reducedMotion: v.reduced ? 'reduce' : 'no-preference', isMobile, hasTouch: isMobile, deviceScaleFactor: 1, httpCredentials });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try { await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 }); } catch { await page.goto(target, { waitUntil: 'load', timeout: 45000 }); }
    await page.waitForTimeout(Number(a.wait));
    if (a.full) {
      // full-page captures show every section in its resting state (scroll-driven reveals would sit at their 'from' frame off-screen)
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important} header{position:relative!important;top:auto!important}' });
      // walk the page so lazy content and scroll-driven reveals reach their resting state
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
      await page.waitForTimeout(400);
    }
    if (a.section) {
      await page.evaluate((s) => { const el = document.querySelector(s); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - 72); }, a.section);
      await page.waitForTimeout(700);
    }
    const name = `${vp.width}x${vp.height}-${v.theme}${v.reduced ? '-reduced' : ''}.png`;
    const h = a.full ? Math.min(maxH, await page.evaluate(() => document.documentElement.scrollHeight)) : vp.height;
    const buf = a.full
      ? await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: vp.width, height: h } })
      : await page.screenshot();
    writeFileSync(join(outDir, name), buf);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    cells.push({ name, label: `${vp.width}×${vp.height} · ${v.theme}${v.reduced ? ' · reduced motion' : ''}`, b64: buf.toString('base64'), w: vp.width, h, overflow: scrollW > vp.width + 1 ? scrollW : 0, errors });
    await ctx.close();
  }
}

// contact sheet: one row per viewport, columns = variants, scaled to a common row height
const rowH = a.full ? 900 : 520;
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:28px;background:#1b1d22;color:#e8e9ec;font:14px/1.4 ui-sans-serif,system-ui,sans-serif}
h1{font-size:16px;margin:0 0 18px;font-weight:600;word-break:break-all} .row{display:flex;gap:20px;margin-bottom:28px;align-items:flex-start}
figure{margin:0;display:grid;gap:8px} img{height:${rowH}px;width:auto;border-radius:10px;box-shadow:0 0 0 1px #ffffff1f,0 10px 30px #0006;object-fit:cover;object-position:top}
figcaption{font:12px/1.3 ui-monospace,monospace;color:#aeb2bb} .bad{color:#ff8a7a}</style>
<h1>${target}</h1>
${vps.map((vp) => `<div class="row">${cells.filter((c) => c.w === vp.width).map((c) => `<figure><img src="data:image/png;base64,${c.b64}"><figcaption>${c.label}${c.overflow ? ` <span class="bad">· horizontal overflow ${c.overflow}px</span>` : ''}${c.errors.length ? ` <span class="bad">· ${c.errors.length} JS error(s)</span>` : ''}</figcaption></figure>`).join('')}</div>`).join('')}`;
const sheetPage = await browser.newPage({ viewport: { width: 2400, height: 900 } });
await sheetPage.setContent(html);
await sheetPage.waitForTimeout(200);
const width = await sheetPage.evaluate(() => Math.ceil(Math.max(...[...document.querySelectorAll('.row')].map((r) => r.scrollWidth))) + 56);
await sheetPage.setViewportSize({ width: Math.max(800, width), height: 900 });
await sheetPage.screenshot({ path: join(outDir, 'sheet.png'), fullPage: true });
await browser.close();

for (const c of cells) console.log(`${c.label.padEnd(36)} ${c.overflow ? `OVERFLOW ${c.overflow}px ` : ''}${c.errors.length ? `${c.errors.length} JS errors` : ''}`);
console.log(`Sheet: ${join(a.out, 'sheet.png')}`);
