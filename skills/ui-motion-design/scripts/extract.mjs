#!/usr/bin/env node
// Design DNA of an existing site — for redesigns, audits and "make it match our brand".
// Extracts colours (by usage and role), likely brand colour, fonts, type scale, radii, shadows,
// spacing rhythm, layout widths, motion values and :root custom properties, then suggests a tokens.mjs call.
//
//   node extract.mjs <url|file.html> [--out ./dna] [--viewport 1440x900] [--auth user:pass]
//
// Writes <out>/design-dna.md, design-dna.json and fold.png.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { parseColor, rgbToOklch, rgbToOklab, toHex, wcagContrast, formatOklch } from './lib/color.mjs';

const { values: a, positionals } = parseArgs({ allowPositionals: true, options: {
  out: { type: 'string', default: './dna' }, viewport: { type: 'string', default: '1440x900' }, auth: { type: 'string' },
} });
if (!positionals[0]) { console.log('Usage: node extract.mjs <url|file.html> [--out ./dna]'); process.exit(1); }
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.error('Playwright not found. In the skill folder: npm install && npx playwright install chromium'); process.exit(1); }

const target = /^https?:|^file:/.test(positionals[0]) ? positionals[0] : existsSync(positionals[0]) ? pathToFileURL(resolve(positionals[0])).href : `https://${positionals[0]}`;
const outDir = resolve(a.out); mkdirSync(outDir, { recursive: true });
const [vw, vh] = a.viewport.split('x').map(Number);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: vw, height: vh || 900 }, httpCredentials: a.auth ? { username: a.auth.split(':')[0], password: a.auth.split(':').slice(1).join(':') } : undefined });
try { await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 }); } catch { await page.goto(target, { waitUntil: 'load', timeout: 45000 }); }
await page.waitForTimeout(800);
await page.screenshot({ path: join(outDir, 'fold.png') });
await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); });

const raw = await page.evaluate(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const ctx = cv.getContext('2d', { willReadFrequently: true });
  const hex = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return d[3] < 20 ? null : '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join(''); };
  const bump = (m, k, w = 1) => { if (k == null || k === '') return; m[k] = (m[k] || 0) + w; };
  const R = { text: {}, bg: {}, border: {}, accentUse: {}, fonts: {}, sizes: {}, weights: {}, radii: {}, shadows: {}, spacing: {}, widths: {}, durations: {}, easings: {}, headings: [], vars: {}, buttons: [] };
  const els = [...document.querySelectorAll('body *')].slice(0, 6000);
  for (const el of els) {
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const area = Math.min(r.width * r.height, 400000);
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ');
    if (own.length > 1) {
      const w = own.length;
      bump(R.text, hex(cs.color), w);
      bump(R.fonts, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), w);
      bump(R.sizes, Math.round(parseFloat(cs.fontSize)) + 'px', w);
      bump(R.weights, cs.fontWeight, w);
    }
    const bg = hex(cs.backgroundColor); if (bg) bump(R.bg, bg, area);
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') bump(R.border, hex(cs.borderTopColor), r.width);
    if (cs.borderRadius !== '0px') { const rr = parseFloat(cs.borderRadius); bump(R.radii, rr >= 999 ? 'pill' : Math.round(rr) + 'px'); }
    if (cs.boxShadow !== 'none') bump(R.shadows, cs.boxShadow);
    for (const p of ['paddingTop', 'paddingLeft', 'marginBottom', 'rowGap', 'columnGap']) { const v = parseFloat(cs[p]); if (v > 0 && v < 200) bump(R.spacing, Math.round(v) + 'px'); }
    if (cs.maxWidth !== 'none' && cs.maxWidth.endsWith('px') && parseFloat(cs.maxWidth) >= 560) bump(R.widths, Math.round(parseFloat(cs.maxWidth)) + 'px');
    const d = cs.transitionDuration.split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000)).filter((x) => x > 0);
    for (const x of d) bump(R.durations, Math.round(x) + 'ms');
    if (d.length) for (const e of cs.transitionTimingFunction.split(/,(?![^(]*\))/)) bump(R.easings, e.trim());
    const tag = el.tagName;
    if (/^H[1-6]$/.test(tag) && R.headings.length < 12) R.headings.push({ tag, size: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, font: cs.fontFamily.split(',')[0].replace(/["']/g, ''), text: el.innerText.trim().slice(0, 60) });
    if ((tag === 'BUTTON' || tag === 'A' || el.getAttribute('role') === 'button') && bg && R.buttons.length < 40) {
      R.buttons.push({ bg, fg: hex(cs.color), radius: cs.borderRadius, h: Math.round(r.height), text: (el.innerText || '').trim().slice(0, 30) });
      bump(R.accentUse, bg, 3);
    }
    if (tag === 'A' && own.length > 1) bump(R.accentUse, hex(cs.color), 1);
  }
  for (const s of document.styleSheets) { try { for (const rule of s.cssRules) if (rule.selectorText === ':root' || rule.selectorText === 'html') for (let i = 0; i < rule.style.length; i++) { const p = rule.style[i]; if (p.startsWith('--') && Object.keys(R.vars).length < 200) R.vars[p] = rule.style.getPropertyValue(p).trim(); } } catch {} }
  R.title = document.title; R.lang = document.documentElement.lang; R.bodyBg = hex(getComputedStyle(document.body).backgroundColor) || hex(getComputedStyle(document.documentElement).backgroundColor) || '#ffffff';
  return R;
});
await browser.close();

// ---------- analysis ----------
const top = (m, n = 8) => Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, n);
const total = (m) => Object.values(m).reduce((s, v) => s + v, 0) || 1;
// merge perceptually close colours (OKLab distance < 0.025)
function cluster(m) {
  const out = [];
  for (const [h, w] of Object.entries(m).sort((x, y) => y[1] - x[1])) {
    const lab = rgbToOklab(parseColor(h));
    const hit = out.find((c) => Math.hypot(c.lab.L - lab.L, c.lab.a - lab.a, c.lab.b - lab.b) < 0.025);
    if (hit) hit.w += w; else out.push({ hex: h, lab, w });
  }
  return out.map((c) => ({ hex: c.hex, share: c.w, oklch: rgbToOklch(parseColor(c.hex)) }));
}
const bgs = cluster(raw.bg), texts = cluster(raw.text), accents = cluster(raw.accentUse);
const chromatic = (list) => list.filter((c) => c.oklch.c > 0.06 && c.oklch.l > 0.25 && c.oklch.l < 0.92);
const brand = chromatic(accents)[0] || chromatic(bgs)[0] || chromatic(texts)[0];
const page_bg = raw.bodyBg;
const fonts = top(raw.fonts, 4).map(([f, w]) => ({ font: f, share: Math.round((w / total(raw.fonts)) * 100) }));
const headingFont = raw.headings[0]?.font || fonts[0]?.font;
const sizes = top(raw.sizes, 12).map(([s]) => parseFloat(s)).sort((x, y) => x - y);
const ratios = sizes.slice(1).map((s, i) => s / sizes[i]).filter((r) => r > 1.05);
const ratio = ratios.length ? Math.round((ratios.reduce((s, r) => s + r, 0) / ratios.length) * 100) / 100 : null;
const spacing = top(raw.spacing, 14).map(([s]) => parseFloat(s)).sort((x, y) => x - y);
const onGrid = spacing.filter((s) => s % 4 === 0).length / (spacing.length || 1);
const bgO = rgbToOklch(parseColor(page_bg));
const neutralHue = bgO.c > 0.004 ? bgO.h : bgs.concat(texts).filter((c) => c.oklch.c > 0.004 && c.oklch.c < 0.04).map((c) => c.oklch.h)[0];

const contrastPairs = top(raw.text, 6).map(([fg]) => ({ fg, bg: page_bg, ratio: Math.round(wcagContrast(fg, page_bg) * 100) / 100 }));
const issues = [];
if (fonts.length > 3) issues.push(`${fonts.length}+ font families in use — consolidate to 2`);
if (contrastPairs.some((p) => p.ratio < 4.5)) issues.push(`text colour(s) below 4.5:1 on the page background: ${contrastPairs.filter((p) => p.ratio < 4.5).map((p) => `${p.fg} (${p.ratio}:1)`).join(', ')}`);
if (onGrid < 0.7) issues.push(`spacing values are irregular (${Math.round(onGrid * 100)} % on a 4px grid)`);
if (Object.keys(raw.radii).length > 6) issues.push(`${Object.keys(raw.radii).length} different border radii — define a radius scale`);
if (Object.keys(raw.shadows).length > 5) issues.push(`${Object.keys(raw.shadows).length} different shadows — define an elevation scale`);
if (chromatic(accents).length > 3) issues.push(`${chromatic(accents).length} competing accent colours on links/buttons`);
if (!Object.keys(raw.vars).length) issues.push('no CSS custom properties on :root — values are hard-coded (no token system)');
if (raw.durations && top(raw.durations, 1)[0] && parseFloat(top(raw.durations, 1)[0][0]) > 400) issues.push('dominant transition duration > 400ms — UI will feel sluggish');

const dna = { url: target, title: raw.title, lang: raw.lang, pageBackground: page_bg,
  brand: brand ? { hex: brand.hex, oklch: formatOklch(brand.oklch) } : null,
  backgrounds: bgs.slice(0, 8).map((c) => c.hex), textColors: texts.slice(0, 6).map((c) => c.hex), accents: chromatic(accents).slice(0, 5).map((c) => c.hex),
  borders: cluster(raw.border).slice(0, 4).map((c) => c.hex), fonts, headingFont, headings: raw.headings, typeSizes: sizes, typeRatio: ratio, weights: top(raw.weights, 5).map(([w]) => w),
  radii: top(raw.radii, 6).map(([r]) => r), shadows: top(raw.shadows, 4).map(([s]) => s), spacing, spacingOnGrid: Math.round(onGrid * 100),
  containerWidths: top(raw.widths, 4).map(([w]) => w), durations: top(raw.durations, 4).map(([d]) => d), easings: top(raw.easings, 3).map(([e]) => e),
  buttons: raw.buttons.slice(0, 6), customProperties: Object.keys(raw.vars).length, contrast: contrastPairs, issues };
writeFileSync(join(outDir, 'design-dna.json'), JSON.stringify({ ...dna, vars: raw.vars }, null, 2));

const sw = (h) => `\`${h}\``;
const cmd = `node scripts/tokens.mjs --brand "${brand?.hex || '#4f46e5'}"${neutralHue !== undefined ? ` --neutral-hue ${Math.round(neutralHue)}` : ''}${page_bg && page_bg !== '#ffffff' && rgbToOklch(parseColor(page_bg)).l > 0.9 ? ` --background-light ${Math.round(rgbToOklch(parseColor(page_bg)).l * 1000) / 1000}` : ''} --font-sans "${fonts.find((f) => f.font !== headingFont)?.font || fonts[0]?.font || 'Inter'}, ui-sans-serif, system-ui, sans-serif" --font-display "${headingFont}, sans-serif"${ratio ? ` --ratio ${Math.min(1.333, Math.max(1.125, ratio))}` : ''} --preview`;
const md = `# Design DNA — ${raw.title || target}

${target} · extracted ${new Date().toLocaleDateString('de-DE')} · viewport ${a.viewport}

![fold](fold.png)

## Summary
| | |
|---|---|
| Likely brand colour | ${brand ? `${sw(brand.hex)} (${formatOklch(brand.oklch)})` : 'none detected (monochrome)'} |
| Page background | ${sw(page_bg)} |
| Fonts | ${fonts.map((f) => `${f.font} (${f.share} %)`).join(' · ')} |
| Heading font | ${headingFont} |
| Type sizes | ${sizes.map((s) => s + 'px').join(', ')}${ratio ? ` · avg step ratio ≈ ${ratio}` : ''} |
| Radii | ${dna.radii.join(', ') || '—'} |
| Spacing | ${spacing.map((s) => s + 'px').join(', ')} · ${dna.spacingOnGrid} % on 4px grid |
| Containers | ${dna.containerWidths.join(', ') || '—'} |
| Motion | ${dna.durations.join(', ') || 'none'} ${dna.easings.length ? `· ${dna.easings.join(' / ')}` : ''} |
| Tokens | ${dna.customProperties ? `${dna.customProperties} custom properties on :root` : 'none — hard-coded values'} |

## Colours by role
- Backgrounds (by area): ${dna.backgrounds.map(sw).join(' ')}
- Text (by amount): ${dna.textColors.map(sw).join(' ')}
- Accents (links/buttons): ${dna.accents.map(sw).join(' ') || '—'}
- Borders: ${dna.borders.map(sw).join(' ') || '—'}

## Headings
${raw.headings.slice(0, 6).map((h) => `- ${h.tag} ${h.size}/${h.lh} ${h.weight} ${h.ls !== 'normal' ? `tracking ${h.ls}` : ''} — ${h.font}: “${h.text}”`).join('\n') || '- none found'}

## Buttons
${dna.buttons.map((b) => `- “${b.text}” ${sw(b.bg)} on text ${sw(b.fg)} · radius ${b.radius} · ${b.h}px high${b.h < 44 ? ' (below 44px touch target)' : ''}`).join('\n') || '- none found'}

## Findings
${issues.length ? issues.map((i) => `- ${i}`).join('\n') : '- no obvious system issues'}

## Rebuild as a token system
\`\`\`bash
${cmd}
\`\`\`
Then compare the generated style tile with fold.png, adjust, and run \`audit.mjs\` on the old page to list UX fixes for the redesign.
`;
writeFileSync(join(outDir, 'design-dna.md'), md);
console.log(md.split('## Colours')[0].replace(/!\[fold\]\(fold.png\)\n\n/, ''));
console.log(`Findings: ${issues.length}\nSuggested: ${cmd}\nReport: ${join(a.out, 'design-dna.md')}`);
