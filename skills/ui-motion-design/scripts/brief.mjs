#!/usr/bin/env node
// Design brief generator: product description → design direction (style, palette seed, fonts,
// page pattern or app shell, motion level, signature effect, must-haves, anti-patterns, components to source).
// Optionally persists a MASTER.md (+ page overrides) and generates tokens with tokens.mjs.
//
//   node brief.mjs "zahnarztpraxis in offenburg, modern und ruhig"
//   node brief.mjs "ki assistent für steuerberater" --name "Belegfix" --brand "#5b5bd6" --out ./design-system --tokens
//   node brief.mjs "…" --out ./design-system --page checkout        # adds pages/checkout.md (override template)
//   node brief.mjs --list products|styles|fonts|patterns
//   node brief.mjs --catalog                                        # regenerate references/style-catalog.md
//   flags: --kind website|webapp  --style <id>  --fonts <id>  --json  --force
//
// Inspired by the "design system generator" idea of nextlevelbuilder/ui-ux-pro-max-skill (MIT);
// data and logic here are written from scratch and curated for this skill.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const data = (f) => JSON.parse(readFileSync(join(here, '..', 'data', f), 'utf8'));
const { products } = data('products.json');
const { styles } = data('styles.json');
const { pairings } = data('fonts.json');
const patterns = data('patterns.json');

const { values: a, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: 'string' }, brand: { type: 'string' }, style: { type: 'string' }, fonts: { type: 'string' },
    kind: { type: 'string' }, out: { type: 'string' }, page: { type: 'string' }, tokens: { type: 'boolean', default: false },
    list: { type: 'string' }, catalog: { type: 'boolean', default: false }, json: { type: 'boolean', default: false }, force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (a.list) {
  const rows = {
    products: products.map((p) => `${p.id.padEnd(20)} ${p.kind.padEnd(8)} ${p.name}`),
    styles: styles.map((s) => `${s.id.padEnd(16)} ${s.for.join('/').padEnd(16)} ${s.name} — ${s.summary}`),
    fonts: pairings.map((f) => `${f.id.padEnd(22)} ${f.heading} + ${f.body}  (${f.mood.join(', ')})`),
    patterns: [...Object.entries(patterns.website).map(([k, v]) => `website  ${k.padEnd(18)} ${v.name}`), ...Object.entries(patterns.webapp).map(([k, v]) => `webapp   ${k.padEnd(18)} ${v.name}`)],
  }[a.list];
  console.log(rows ? rows.join('\n') : 'Use --list products|styles|fonts|patterns');
  process.exit(0);
}

if (a.catalog) {
  let md = `# Style catalog\n\n> Generated from \`data/styles.json\` by \`node scripts/brief.mjs --catalog\` — edit the JSON, then regenerate. Pick **one** primary style per product; a secondary style may only flavour marketing accents. \`brief.mjs\` picks a style from the product type and mood words ("dunkel", "luxus", "verspielt", "minimal", "3d", "warm", "ruhig", "natur", "glas", "bento" …).\n\n| Style | For | Motion | A11y risk | Perf cost |\n|---|---|---|---|---|\n`;
  for (const s of styles) md += `| [${s.name}](#${s.id}) | ${s.for.join(', ')} | ${s.motion} | ${s.risk} | ${s.cost} |\n`;
  for (const s of styles) md += `\n<a id="${s.id}"></a>\n## ${s.name}\n\n${s.summary}\n\n- **Use for:** ${s.use.join(', ')}\n- **Avoid for:** ${s.avoid.join(', ')}\n- **Recipe:**\n${s.recipe.map((r) => '  - ' + r).join('\n')}\n- Motion level **${s.motion}** · accessibility risk **${s.risk}** · performance cost **${s.cost}**\n`;
  writeFileSync(join(here, '..', 'references', 'style-catalog.md'), md);
  console.log('Wrote references/style-catalog.md');
  process.exit(0);
}

const query = positionals.join(' ').trim();
if (a.help || !query) {
  console.log('Usage: node brief.mjs "<product description>" [--name "Project"] [--brand "#hex"] [--kind website|webapp] [--style id] [--fonts id] [--out ./design-system] [--page name] [--tokens] [--json]\n       node brief.mjs --list products|styles|fonts|patterns');
  process.exit(a.help ? 0 : 1);
}

// ---------- matching ----------
const q = query.toLowerCase();
const words = q.split(/[^a-z0-9äöüß+-]+/).filter((w) => w.length > 1);
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// alias must start at a word boundary; short aliases (≤ 4 chars, e.g. "ai", "ki", "bav") must be whole words
const hit = (al) => new RegExp(`(^|[^a-z0-9äöüß])${esc(al)}${al.length <= 4 ? '($|[^a-z0-9äöüß])' : ''}`).test(q);
const scoreProduct = (p) => {
  let s = 0;
  for (const al of p.aliases) if (hit(al)) s += al.length > 3 ? 4 : 3;
  for (const w of words) if (w.length > 4 && p.name.toLowerCase().split(/[^a-zäöüß]+/).includes(w)) s += 1;
  return s;
};
const ranked = products.map((p) => ({ p, s: scoreProduct(p) })).sort((x, y) => y.s - x.s);
const product = ranked[0].s > 0 ? ranked[0].p : products.find((p) => p.id === 'saas-b2b');
const alternatives = ranked.filter((r) => r.s > 0 && r.p !== product).slice(0, 2).map((r) => r.p.name);

const kindHint = /\b(app|webapp|dashboard|tool|admin|portal|crm|backend|plattform)\b/.test(q) ? 'webapp'
  : /\b(website|webseite|homepage|landing|landingpage|seite|onepager|site)\b/.test(q) ? 'website' : null;
const kind = a.kind || (product.kind === 'both' ? (kindHint || 'both') : product.kind);

const MOODS = [
  [/(dunkel|dark|nacht|tech|futur)/, 'dark-glow'], [/(luxus|luxury|edel|premium|elegant)/, 'luxury-minimal'],
  [/(verspielt|playful|bunt|fun|kinder)/, 'playful-vibrant'], [/(brutal|roh|raw|laut|bold)/, 'neubrutalism'],
  [/(minimal|clean|schlicht|reduziert)/, 'swiss-minimal'], [/(3d|webgl|immersiv|immersive|krass|wow)/, 'immersive-3d'],
  [/(warm|handgemacht|regional|lokal|familiär|bodenständig)/, 'warm-craft'], [/(ruhig|calm|seriös|vertrauen|trust)/, 'trust-clean'],
  [/(natur|nachhaltig|bio|organic|eco)/, 'organic'], [/(editorial|magazin|redaktionell)/, 'editorial'],
  [/(glas|glass)/, 'liquid-glass'], [/(bento)/, 'bento'], [/(typo|kinetic|kinetisch)/, 'kinetic-type'],
];
const moodStyle = MOODS.find(([re]) => re.test(q))?.[1];
const fits = (id) => { const st = styles.find((x) => x.id === id); return st && (kind === 'both' || st.for.includes(kind)); };
const styleId = a.style || (moodStyle && !product.styles.includes(moodStyle) && fits(moodStyle) ? moodStyle : product.styles.find(fits) || product.styles[0]);
const style = styles.find((s) => s.id === styleId) || styles.find((s) => s.id === product.styles[0]);
const secondary = styles.find((s) => s.id === (product.styles.find((id) => id !== style.id) || product.styles[1]));
if (style.for.length === 1 && kind !== 'both' && !style.for.includes(kind)) {
  console.error(`Note: style "${style.id}" is meant for ${style.for[0]}s; using it for a ${kind} anyway.`);
}
const fonts = pairings.find((f) => f.id === (a.fonts || product.fonts)) || pairings[0];
const brand = a.brand || product.brand;
const motion = { calm: 'calm', standard: 'standard', expressive: 'expressive' }[style.motion === 'expressive' && product.motion === 'calm' ? 'standard' : (product.motion || style.motion)];
const pattern = product.pattern ? patterns.website[product.pattern] : null;
const shell = product.shell ? patterns.webapp[product.shell] : null;
const name = a.name || product.name;
const slug = name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const MOTION = {
  calm: { springs: 'snappy / smooth', durations: '100–200ms UI, ≤ 300ms overlays', effects: 'fades, origin-aware popovers, FLIP for lists — no decorative loops', budget: 'no signature effect needed' },
  standard: { springs: 'smooth (default), snappy for controls', durations: '150–300ms UI; marketing reveals ≤ 600ms', effects: 'scroll reveals, stagger ≤ 400ms total, view transitions, one ambient effect', budget: 'one signature effect on marketing pages' },
  expressive: { springs: 'smooth + bouncy for rare moments', durations: 'UI still ≤ 300ms; hero choreography up to ~1.2s once', effects: 'kinetic type, scroll storytelling, WebGL/shader hero, page transitions', budget: 'one bold signature idea; everything else calm; strict perf + reduced-motion fallbacks' },
}[motion];

const brief = { query, name, slug, product: product.id, productName: product.name, alternatives, kind, style, secondary, fonts, brand, motion, motionSpec: MOTION, pattern, shell, signature: product.signature, must: product.must, avoid: [...product.avoid, ...style.avoid.map((x) => `style "${style.name}" is wrong for: ${x}`)], components: product.components };

// ---------- markdown ----------
const gf = (f) => {
  const fam = new Map();
  const add = (name, w) => fam.set(name, [...new Set([...(fam.get(name) || []), ...w])].sort((x, y) => x - y));
  add(f.heading, f.weights.heading); add(f.body, f.weights.body); add(f.mono, [400, 500]);
  return `https://fonts.googleapis.com/css2?${[...fam].map(([n, w]) => `family=${n.replace(/ /g, '+')}:wght@${w.join(';')}`).join('&')}&display=swap`;
};

const md = `# Design brief — ${name}

> Generated by \`ui-motion-design/scripts/brief.mjs\` from: “${query}”. This is the **master**: pages may override it in \`pages/<page>.md\`. Treat it as a starting point — confirm brand colour, fonts and tone with the client.

| | |
|---|---|
| Product type | **${product.name}**${alternatives.length ? ` (also considered: ${alternatives.join(', ')})` : ''} |
| Deliverable | **${kind === 'both' ? 'website + webapp' : kind}** |
| Style | **${style.name}** — ${style.summary}${secondary ? `<br>Secondary (marketing accents only): ${secondary.name}` : ''} |
| Brand seed | \`${brand}\` → run \`tokens.mjs --brand "${brand}"\` (contrast-checked light/dark) |
| Fonts | **${fonts.heading}** (headings) + **${fonts.body}** (body) + ${fonts.mono} (mono) |
| Motion level | **${motion}** — ${MOTION.budget} |
| Signature idea | ${product.signature} |

## Style rules — ${style.name}
${style.recipe.map((r) => `- ${r}`).join('\n')}
- Use for: ${style.use.join(', ')}
- Accessibility risk: **${style.risk}** · performance cost: **${style.cost}**${style.risk !== 'low' ? ' → follow the guardrails in references/ui-craft.md §5 and signature-effects.md' : ''}

## Typography
- Headings: ${fonts.heading} ${fonts.weights.heading.join('/')} · Body: ${fonts.body} ${fonts.weights.body.join('/')} · Mono: ${fonts.mono}
- Mood: ${fonts.mood.join(', ')}${fonts.notes ? `\n- Note: ${fonts.notes}` : ''}
- **Self-host** (fontsource / \`next/font\`) — loading from Google's CDN without consent is a GDPR risk in Germany. Reference link for testing: ${gf(fonts)}
- Tokens: \`tokens.mjs --font-sans "${fonts.body}, ui-sans-serif, system-ui, sans-serif" --font-display "${fonts.heading}, serif"\`

${pattern && kind !== 'webapp' ? `## Website pattern — ${pattern.name}
${pattern.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

- CTA placement: ${pattern.cta}
- ${pattern.notes}
- Details per section: references/website-playbook.md
` : ''}
${shell && kind !== 'website' ? `## App shell — ${shell.name}
${shell.layout.map((s) => `- ${s}`).join('\n')}
- Typical use: ${shell.use} · Mobile: ${shell.mobile}
- Details: references/webapp-playbook.md, references/ui-patterns.md
` : ''}
## Motion — ${motion}
- Springs: ${MOTION.springs} · Durations: ${MOTION.durations}
- Effects: ${MOTION.effects}
- Always: transform/opacity only, exits shorter than enters, \`prefers-reduced-motion\` in CSS **and** JS (references/motion-principles.md)

## Must-haves
${product.must.map((m) => `- [ ] ${m}`).join('\n')}

## Anti-patterns
${brief.avoid.map((m) => `- ✗ ${m}`).join('\n')}

## Components to source
21st.dev categories worth browsing: ${product.components.join(' · ')} — vet license, reduced motion, contrast and bundle size before installing (references/component-sourcing.md).

## Definition of done
- [ ] \`audit.mjs\` → 0 errors, 0 warnings (mobile 390 + desktop 1440)
- [ ] \`contrast.mjs --css <tokens>\` passes in light and dark
- [ ] Every data view: empty / loading / error / long content
- [ ] Review with references/review-checklist.md (top 3–5 findings fixed)
`;

if (a.json) { console.log(JSON.stringify({ ...brief, markdown: undefined }, null, 2)); process.exit(0); }

if (!a.out) { console.log(md); process.exit(0); }

const dir = resolve(a.out, slug);
mkdirSync(join(dir, 'pages'), { recursive: true });
const master = join(dir, 'MASTER.md');
if (existsSync(master) && !a.force) console.error(`Kept existing ${master} (use --force to overwrite)`);
else { writeFileSync(master, md); console.log(`Wrote ${master}`); }

if (a.page) {
  const p = join(dir, 'pages', `${a.page.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`);
  if (existsSync(p) && !a.force) console.error(`Kept existing ${p}`);
  else {
    writeFileSync(p, `# Page override — ${a.page}

> Rules here **override** MASTER.md for this page only. Delete sections you don't need.

## Job of this page
- Who arrives here, from where, and what is the one primary action?

## Deviations from master
- Layout:
- Density:
- Motion:
- Colour / emphasis:

## Components & states
- Components:
- Empty / loading / error states:

## Content
- Headline / key copy:
`);
    console.log(`Wrote ${p}`);
  }
}

if (a.tokens) {
  const tokDir = join(dir, 'tokens');
  const out = execFileSync(process.execPath, [join(here, 'tokens.mjs'), '--brand', brand, '--out', tokDir, '--preview',
    '--font-sans', `${fonts.body}, ui-sans-serif, system-ui, sans-serif`, '--font-display', `${fonts.heading}, ${fonts.body}, serif`,
    '--font-mono', `${fonts.mono}, ui-monospace, monospace`], { encoding: 'utf8' });
  console.log(out.trim());
}
