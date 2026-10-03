#!/usr/bin/env node
// Compose a complete, audit-ready page scaffold from the block library — brief → tokens → blocks → one HTML file.
// Every [bracketed] text is a placeholder to replace with real content; the script reports how many remain.
//
//   node compose.mjs "website für eine schreinerei in offenburg" --name "Holzwerk Seitz" --city Offenburg --phone "+49 781 123456" --out ./site
//   node compose.mjs --pattern saas-landing --name "Belegfix" --brand "#5b5bd6" --out ./site
//   node compose.mjs … --blocks nav,hero-center,bento,pricing,faq,footer      # custom order
//   flags: --skin <style-id> --cta "Angebot anfragen" --fonts <font-id> --dark --artifact (also writes artifact.html without doctype/head)
//   node compose.mjs --list                                                  # blocks and pattern recipes

import { readFileSync, writeFileSync, mkdirSync, readdirSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { parseColor, rgbToOklch } from './lib/color.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const blocksDir = join(root, 'blocks');

const { values: a, positionals } = parseArgs({ allowPositionals: true, options: {
  pattern: { type: 'string' }, name: { type: 'string' }, brand: { type: 'string' }, city: { type: 'string', default: '[Ort]' },
  phone: { type: 'string', default: '+49 000 000000' }, cta: { type: 'string' }, blocks: { type: 'string' }, skin: { type: 'string' },
  fonts: { type: 'string' }, out: { type: 'string', default: './site' }, dark: { type: 'boolean', default: false },
  artifact: { type: 'boolean', default: false }, list: { type: 'boolean', default: false }, help: { type: 'boolean', short: 'h', default: false },
} });

// pattern recipes → block order (patterns from data/patterns.json)
const RECIPES = {
  'saas-landing': ['nav', 'hero-split', 'logos', 'problem-outcome', 'bento', 'steps', 'testimonial', 'pricing', 'faq', 'cta-band', 'footer', 'mobile-bar'],
  'local-business': ['nav', 'hero-local', 'services', 'compare', 'testimonial', 'stats', 'contact-local', 'faq', 'footer', 'mobile-bar'],
  'agency-portfolio': ['nav', 'hero-center', 'logos', 'services', 'steps', 'testimonial', 'cta-band', 'contact-local', 'footer'],
  'product-launch': ['nav', 'hero-split', 'story-pinned', 'bento', 'stats', 'pricing', 'faq', 'cta-band', 'footer', 'mobile-bar'],
  'lead-magnet': ['nav', 'hero-split', 'problem-outcome', 'testimonial', 'contact-local', 'footer'],
  event: ['nav', 'hero-center', 'stats', 'steps', 'pricing', 'faq', 'cta-band', 'footer', 'mobile-bar'],
  ecommerce: ['nav', 'hero-center', 'bento', 'stats', 'testimonial', 'faq', 'footer'],
  'content-blog': ['nav', 'hero-center', 'bento', 'cta-band', 'footer'],
  waitlist: ['nav', 'hero-center', 'problem-outcome', 'cta-band', 'footer'],
};
const available = readdirSync(blocksDir).filter((f) => f.endsWith('.html')).map((f) => f.replace('.html', ''));

if (a.list || a.help) {
  console.log(`Blocks (${available.length}): ${available.join(', ')}\n\nRecipes:`);
  for (const [k, v] of Object.entries(RECIPES)) console.log(`  ${k.padEnd(18)} ${v.join(' → ')}`);
  console.log('\nUsage: node compose.mjs "<description>" --name "Name" [--city Ort] [--phone "+49 …"] [--brand "#hex"] [--out ./site] [--blocks a,b,c] [--skin id] [--artifact]');
  process.exit(0);
}

// ---------- direction: brief (if a description is given) ----------
let brief = null;
if (positionals.length) {
  const args = [join(here, 'brief.mjs'), positionals.join(' '), '--json'];
  if (a.name) args.push('--name', a.name);
  if (a.brand) args.push('--brand', a.brand);
  if (a.fonts) args.push('--fonts', a.fonts);
  brief = JSON.parse(execFileSync(process.execPath, args, { encoding: 'utf8' }));
}
const fontsData = JSON.parse(readFileSync(join(root, 'data', 'fonts.json'), 'utf8')).pairings;
const productsData = JSON.parse(readFileSync(join(root, 'data', 'products.json'), 'utf8')).products;
const patternId = a.pattern || brief?.product && productsData.find((p) => p.id === brief.product)?.pattern || 'saas-landing';
const blocks = (a.blocks ? a.blocks.split(',') : RECIPES[patternId] || RECIPES['saas-landing']).map((b) => b.trim());
for (const b of blocks) if (!available.includes(b)) { console.error(`Unknown block "${b}". Available: ${available.join(', ')}`); process.exit(1); }
const name = a.name || brief?.name || '[Name]';
const brand = a.brand || brief?.brand || '#4f46e5';
const fonts = (a.fonts && fontsData.find((f) => f.id === a.fonts)) || brief?.fonts || fontsData[0];
const skin = a.skin || brief?.style?.id || 'soft-premium';
const local = patternId === 'local-business' || blocks.includes('hero-local');
const cta = a.cta || (local ? 'Angebot anfragen' : patternId === 'product-launch' ? 'Auf die Warteliste' : patternId === 'event' ? 'Ticket sichern' : 'Kostenlos testen');
const dark = a.dark || skin === 'dark-glow';

// ---------- tokens ----------
const tmp = mkdtempSync(join(tmpdir(), 'compose-'));
execFileSync(process.execPath, [join(here, 'tokens.mjs'), '--brand', brand, '--out', tmp, '--format', 'css', '--quiet',
  '--font-sans', `'${fonts.body}', ui-sans-serif, system-ui, sans-serif`, '--font-display', `'${fonts.heading}', '${fonts.body}', ui-sans-serif, sans-serif`,
  '--font-mono', `'${fonts.mono}', ui-monospace, monospace`, ...(local || skin === 'warm-craft' ? ['--background-light', '0.975'] : [])]);
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n+/g, '\n');
const tokens = strip(readFileSync(join(tmp, 'tokens.css'), 'utf8'));
const hue = Math.round(rgbToOklch(parseColor(brand)).h);

// ---------- blocks ----------
const styles = [strip(readFileSync(join(blocksDir, '_base.css'), 'utf8')), strip(readFileSync(join(blocksDir, '_skins.css'), 'utf8'))];
const scripts = []; const markup = [];
for (const b of blocks) {
  let src = readFileSync(join(blocksDir, `${b}.html`), 'utf8');
  src = src.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => { styles.push(`/* block: ${b} */\n${css.trim()}`); return ''; });
  src = src.replace(/<script>([\s\S]*?)<\/script>/g, (_, js) => { scripts.push(`/* block: ${b} */\n${js.trim()}`); return ''; });
  markup.push(`<!-- block: ${b} -->\n${src.trim()}`);
}
if (!blocks.includes('nav')) markup.unshift('<main id="main">');
if (!blocks.includes('footer')) markup.push('</main>');

const phoneDisplay = a.phone;
const fill = (s) => s.replaceAll('{{name}}', name).replaceAll('{{city}}', a.city).replaceAll('{{phone}}', a.phone.replace(/[^\d+]/g, ''))
  .replaceAll('{{phoneDisplay}}', phoneDisplay).replaceAll('{{cta}}', cta).replaceAll('{{year}}', String(new Date().getFullYear()));

const fam = new Map();
const addF = (n, w) => fam.set(n, [...new Set([...(fam.get(n) || []), ...w])].sort((x, y) => x - y));
addF(fonts.heading, fonts.weights.heading); addF(fonts.body, fonts.weights.body); addF(fonts.mono, [400, 500]);
const fontHref = `https://fonts.googleapis.com/css2?${[...fam].map(([n, w]) => `family=${n.replace(/ /g, '+')}:wght@${w.join(';')}`).join('&')}&display=swap`;

const head = `<title>${name}</title>
<meta name="description" content="[Meta-Description ≤ 155 Zeichen: was, für wen, wo]">
<!-- Fonts: Google CDN for preview only. In production self-host (fontsource / next/font) — GDPR. -->
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<style>
/* Generated by ui-motion-design/scripts/compose.mjs · pattern ${patternId} · skin ${skin} · brand ${brand} · fonts ${fonts.heading} + ${fonts.body} */
${tokens}
:root { --b-h: ${hue}; }
${styles.join('\n')}
</style>`;
const body = fill(markup.join('\n\n'));
const js = `<script>\n${scripts.join('\n')}\n</script>`;
const htmlAttrs = `lang="de" data-skin="${skin}"${dark ? ' data-theme="dark"' : ''}`;
const full = `<!doctype html>\n<html ${htmlAttrs}>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${fill(head)}\n</head>\n<body>\n${body}\n${js}\n</body>\n</html>\n`;

const outDir = resolve(a.out); mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'index.html'), full);
if (a.artifact) {
  // Artifact pages get their skeleton from the host: no doctype/head/body; skin + theme set by a tiny script
  const frag = `${fill(head)}\n<script>document.documentElement.dataset.skin=${JSON.stringify(skin)};${dark ? "document.documentElement.dataset.theme='dark';" : ''}document.documentElement.lang='de';</script>\n${body}\n${js}\n`;
  writeFileSync(join(outDir, 'artifact.html'), frag);
}
const todo = (body.match(/\[[^\]\n]{2,}\]/g) || []).length + 1; // + meta description
console.log(`Composed ${blocks.length} blocks (${blocks.join(' → ')})`);
console.log(`Pattern ${patternId} · skin ${skin} · brand ${brand} · fonts ${fonts.heading} + ${fonts.body}${dark ? ' · dark' : ''}`);
console.log(`Wrote ${join(a.out, 'index.html')}${a.artifact ? ` and ${join(a.out, 'artifact.html')}` : ''}`);
console.log(`${todo} [placeholders] to replace with real content. Then: shots.mjs + audit.mjs.`);
