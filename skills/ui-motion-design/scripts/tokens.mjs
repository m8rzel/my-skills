#!/usr/bin/env node
// Generate a complete design-token set from one brand color:
// OKLCH color ramps, shadcn-compatible semantic tokens (light + dark, contrast-checked),
// fluid type scale, spacing, radius, shadows and motion tokens (durations, easings, springs).
//
//   node tokens.mjs --brand "#6d28d9" [--name brand] [--out ./design-tokens] [--format all]
//                   [--ratio 1.25] [--ratio-min 1.2] [--base 16] [--radius 0.625rem]
//                   [--neutral-chroma 0.012] [--neutral-hue 230] [--background-light 0.975] [--font-sans "Geist"] [--font-display "…"] [--preview]
//
// Formats: css (tokens.css), tailwind (tailwind.css, Tailwind v4 + shadcn layout),
//          json (tokens.json), ts (tokens.ts — React / React Native / Motion / Reanimated), all.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import {
  parseColor, rgbToOklch, oklchToRgb, formatOklch, toHex, wcagContrast, apcaContrast, maxChroma, round,
} from './lib/color.mjs';
import { EASINGS, DURATIONS, SPRINGS, springToLinear } from './lib/spring.mjs';

const { values: args } = parseArgs({
  options: {
    brand: { type: 'string' },
    name: { type: 'string', default: 'brand' },
    out: { type: 'string', default: './design-tokens' },
    format: { type: 'string', default: 'all' },
    ratio: { type: 'string', default: '1.25' },
    'ratio-min': { type: 'string', default: '1.2' },
    base: { type: 'string', default: '16' },
    radius: { type: 'string', default: '0.625rem' },
    'neutral-chroma': { type: 'string', default: '0.012' },
    'neutral-hue': { type: 'string' },
    'background-light': { type: 'string' },
    'font-sans': { type: 'string', default: 'ui-sans-serif, system-ui, sans-serif' },
    'font-display': { type: 'string' },
    'font-mono': { type: 'string', default: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
    preview: { type: 'boolean', default: false },
    quiet: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help || !args.brand) {
  console.log(`Usage: node tokens.mjs --brand "#6d28d9" [--name brand] [--out ./design-tokens]
       [--format all|css|tailwind|json|ts] [--ratio 1.25] [--ratio-min 1.2] [--base 16]
       [--radius 0.625rem] [--neutral-chroma 0.012] [--neutral-hue <deg>] [--background-light <L 0–1>] [--font-sans "Geist, sans-serif"]
       [--font-display "…"] [--preview]`);
  process.exit(args.help ? 0 : 1);
}

const NAME = args.name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const L_TARGETS = [0.977, 0.948, 0.896, 0.825, 0.735, 0.645, 0.565, 0.49, 0.42, 0.36, 0.27];
const C_CURVE = [0.1, 0.22, 0.42, 0.68, 0.9, 1, 0.98, 0.88, 0.74, 0.6, 0.45];

// ---------- color ramps ----------
const brandRgb = parseColor(args.brand);
const brand = rgbToOklch(brandRgb);

function ramp({ h, c }, { snap } = {}) {
  const out = {};
  STEPS.forEach((step, i) => {
    const l = L_TARGETS[i];
    const chroma = Math.min(c * C_CURVE[i], maxChroma(l, h));
    out[step] = { l, c: chroma, h };
  });
  if (snap) {
    // put the exact brand color on the closest step so the brand survives untouched
    let best = 0;
    STEPS.forEach((s, i) => { if (Math.abs(L_TARGETS[i] - snap.l) < Math.abs(L_TARGETS[best] - snap.l)) best = i; });
    out[STEPS[best]] = { l: snap.l, c: snap.c, h: snap.h };
    out._brandStep = STEPS[best];
  }
  return out;
}

const brandPeakC = Math.max(brand.c, 0.04);
const brandRamp = ramp({ h: brand.h, c: brandPeakC }, { snap: brand });
const brandStep = brandRamp._brandStep; delete brandRamp._brandStep;
// neutrals default to the brand hue; --neutral-hue lets them run cooler/warmer than the accent (e.g. cool stone + ember)
const NH = args['neutral-hue'] !== undefined ? Number(args['neutral-hue']) : brand.h;
const neutralRamp = ramp({ h: NH, c: 0 });
// neutral ramp uses a flat, tiny chroma (tinted gray)
for (const s of STEPS) neutralRamp[s].c = Math.min(Number(args['neutral-chroma']), maxChroma(neutralRamp[s].l, NH));

const ok = (o) => formatOklch(o);
const hex = (o) => toHex(oklchToRgb(o));
const WHITE = { l: 1, c: 0, h: 0 };
const INK = (h) => ({ l: 0.2, c: 0.01, h });

/** pick white or ink as foreground for a fill: prefer the one reaching WCAG 4.5, then the larger APCA |Lc| */
function onColor(fill) {
  const fr = oklchToRgb(fill);
  const cands = [WHITE, INK(fill.h)].map((c) => {
    const rgb = oklchToRgb(c);
    return { c, wcag: wcagContrast(rgb, fr), apca: Math.abs(apcaContrast(rgb, fr)) };
  });
  const passing = cands.filter((x) => x.wcag >= 4.5);
  const pool = passing.length ? passing : cands;
  pool.sort((a, b) => (passing.length ? b.apca - a.apca : b.wcag - a.wcag));
  return pool[0].c;
}

/** the exact brand step first, then safer steps, until the fill carries a 4.5:1 label */
function primaryFill(mode) {
  const order = mode === 'light'
    ? [brandStep >= 300 ? brandStep : null, 600, 700, 800]
    : [brandStep >= 200 && brandStep <= 500 ? brandStep : null, 400, 300, 200];
  for (const s of order.filter(Boolean)) {
    const fill = brandRamp[s];
    const fg = onColor(fill);
    if (wcagContrast(oklchToRgb(fg), oklchToRgb(fill)) >= 4.5) return { step: s, fill, fg };
  }
  const s = mode === 'light' ? 600 : 400;
  return { step: s, fill: brandRamp[s], fg: onColor(brandRamp[s]) };
}

const N = neutralRamp, B = brandRamp;
const lightPrimary = primaryFill('light');
const darkPrimary = primaryFill('dark');
const NC = Number(args['neutral-chroma']);
// surfaces use fixed lightness (not ramp steps) so contrast holds for every brand
const n = (l, cScale = 1) => ({ l, c: Math.min(NC * cScale, maxChroma(l, NH)), h: NH });
const BG_L = args['background-light'] ? Number(args['background-light']) : null; // tinted page background instead of pure white

const status = {
  destructive: { light: { l: 0.577, c: 0.245, h: 27.3 }, dark: { l: 0.704, c: 0.191, h: 22.2 } },
  success: { light: { l: 0.52, c: 0.14, h: 150 }, dark: { l: 0.72, c: 0.17, h: 150 } },
  warning: { light: { l: 0.78, c: 0.16, h: 75 }, dark: { l: 0.8, c: 0.15, h: 75 } },
  info: { light: { l: 0.53, c: 0.17, h: 250 }, dark: { l: 0.72, c: 0.14, h: 240 } },
};

/** focus ring needs 3:1 against the page — walk the ramp if the primary fill is too pale/dark */
function ringFor(fill, bg, isLight) {
  if (wcagContrast(oklchToRgb(fill), oklchToRgb(bg)) >= 3) return fill;
  const order = isLight ? [500, 600, 700, 800] : [400, 300, 200, 100];
  for (const s of order) if (wcagContrast(oklchToRgb(B[s]), oklchToRgb(bg)) >= 3) return B[s];
  return isLight ? B[800] : B[200];
}

function semantic(mode) {
  const L = mode === 'light';
  const P = L ? lightPrimary : darkPrimary;
  const s = {
    background: L ? (BG_L ? n(BG_L, 1.2) : WHITE) : n(0.16),
    foreground: L ? n(0.17, 1.5) : n(0.985, 0.3),
    card: L ? WHITE : n(0.2),
    'card-foreground': L ? n(0.17, 1.5) : n(0.985, 0.3),
    popover: L ? WHITE : n(0.22),
    'popover-foreground': L ? n(0.17, 1.5) : n(0.985, 0.3),
    primary: P.fill,
    'primary-foreground': P.fg,
    secondary: L ? n(0.967) : n(0.27),
    'secondary-foreground': L ? n(0.21, 1.5) : n(0.985, 0.3),
    muted: L ? n(0.967) : n(0.27),
    'muted-foreground': L ? n(0.5) : n(0.72),
    accent: L ? n(0.955) : n(0.29),
    'accent-foreground': L ? n(0.21, 1.5) : n(0.985, 0.3),
    'primary-subtle': L ? B[50] : { l: 0.28, c: Math.min(0.06, B[900].c), h: brand.h },
    'primary-subtle-foreground': L ? { ...B[800], l: Math.min(B[800].l, 0.45) } : B[200],
    border: L ? n(0.922) : n(0.3),
    input: L ? n(0.88) : n(0.34),
    ring: ringFor(P.fill, L ? (BG_L ? n(BG_L, 1.2) : WHITE) : n(0.16), L),
  };
  for (const [k, v] of Object.entries(status)) {
    s[k] = v[mode];
    s[`${k}-foreground`] = onColor(v[mode]);
  }
  return s;
}
const light = semantic('light');
const dark = semantic('dark');

// ---------- contrast report ----------
const PAIRS = [
  ['foreground', 'background', 'text'], ['muted-foreground', 'background', 'text'], ['muted-foreground', 'muted', 'text'],
  ['card-foreground', 'card', 'text'], ['primary-foreground', 'primary', 'text'], ['secondary-foreground', 'secondary', 'text'],
  ['primary-subtle-foreground', 'primary-subtle', 'text'], ['destructive-foreground', 'destructive', 'text'],
  ['success-foreground', 'success', 'text'], ['warning-foreground', 'warning', 'text'], ['info-foreground', 'info', 'text'],
  ['primary', 'background', 'fill'], ['border', 'background', 'decorative'], ['ring', 'background', 'ui'],
];
function contrastRows(sem) {
  return PAIRS.map(([fg, bg, kind]) => {
    const f = oklchToRgb(sem[fg]), b = oklchToRgb(sem[bg]);
    const ratio = wcagContrast(f, b), lc = apcaContrast(f, b);
    const need = kind === 'text' ? 4.5 : kind === 'ui' ? 3 : 1; // fill/decorative: informational only
    return { fg, bg, kind, ratio: round(ratio, 2), apca: round(lc, 1), pass: ratio >= need };
  });
}
const report = { light: contrastRows(light), dark: contrastRows(dark) };

// ---------- type, space, radius, shadow ----------
const base = Number(args.base), rMax = Number(args.ratio), rMin = Number(args['ratio-min']);
const VW_MIN = 360, VW_MAX = 1280;
const TYPE_STEPS = { xs: -2, sm: -1, base: 0, lg: 1, xl: 2, '2xl': 3, '3xl': 4, '4xl': 5, '5xl': 6 };
const rem = (px) => `${round(px / 16, 4)}rem`;
const type = Object.fromEntries(Object.entries(TYPE_STEPS).map(([k, n]) => {
  // small steps get a legibility floor (12px / 14px) instead of shrinking with the ratio
  const floor = n === -2 ? 12 : n === -1 ? 14 : 0;
  const min = Math.max(floor, base * rMin ** n), max = Math.max(floor, base * rMax ** n);
  const slope = (max - min) / (VW_MAX - VW_MIN);
  const size = Math.abs(max - min) < 0.5
    ? rem(max)
    : `clamp(${rem(Math.min(min, max))}, ${rem(min - slope * VW_MIN)} + ${round(slope * 100, 4)}vw, ${rem(Math.max(min, max))})`;
  const lineHeight = n <= 0 ? 1.5 : n === 1 ? 1.45 : n === 2 ? 1.35 : n === 3 ? 1.25 : n === 4 ? 1.15 : 1.05;
  const tracking = n <= -2 ? '0.01em' : n >= 5 ? '-0.03em' : n >= 3 ? '-0.02em' : n >= 2 ? '-0.01em' : '0em';
  return [k, { size, min: round(min, 2), max: round(max, 2), lineHeight, tracking }];
}));

const SPACE = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];
const space = Object.fromEntries(SPACE.map((n) => [String(n).replace('.', '_'), rem(n * 4)]));

const radiusBase = args.radius;
const radius = {
  sm: `calc(${radiusBase} - 4px)`, md: `calc(${radiusBase} - 2px)`, lg: radiusBase,
  xl: `calc(${radiusBase} + 4px)`, '2xl': `calc(${radiusBase} + 8px)`, full: '9999px',
};

const sh = (a, mode) => `oklch(${mode === 'light' ? 0.2 : 0} 0.02 ${round(NH, 1)} / ${a})`;
const shadows = (mode) => {
  const k = mode === 'light' ? 1 : 2.4;
  const c = (a) => sh(round(Math.min(0.6, a * k), 3), mode);
  return {
    xs: `0 1px 2px ${c(0.05)}`,
    sm: `0 1px 2px ${c(0.06)}, 0 1px 3px ${c(0.08)}`,
    md: `0 2px 4px ${c(0.05)}, 0 4px 12px ${c(0.08)}`,
    lg: `0 4px 8px ${c(0.04)}, 0 12px 24px ${c(0.1)}`,
    xl: `0 8px 16px ${c(0.05)}, 0 24px 48px ${c(0.14)}`,
  };
};

// ---------- motion ----------
const springs = Object.fromEntries(Object.entries(SPRINGS).map(([k, v]) => {
  const lin = springToLinear(v);
  return [k, { stiffness: round(v.stiffness, 1), damping: round(v.damping, 1), mass: 1, duration: lin.duration, easing: lin.easing, use: v.use }];
}));

// ---------- writers ----------
const brandVars = (fmt) => STEPS.map((s) => `  --${NAME}-${s}: ${fmt(B[s])};`).join('\n');
const neutralVars = (fmt) => STEPS.map((s) => `  --neutral-${s}: ${fmt(N[s])};`).join('\n');
const semVars = (sem, indent = '  ') => Object.entries(sem).map(([k, v]) => `${indent}--${k}: ${ok(v)};`).join('\n');
const shadowVars = (mode, indent = '  ') => Object.entries(shadows(mode)).map(([k, v]) => `${indent}--shadow-${k}: ${v};`).join('\n');

const staticVars = () => [
  '  /* type — fluid between 360px and 1280px viewport */',
  `  --font-sans: ${args['font-sans']};`,
  `  --font-display: ${args['font-display'] || 'var(--font-sans)'};`,
  `  --font-mono: ${args['font-mono']};`,
  ...Object.entries(type).flatMap(([k, t]) => [
    `  --text-${k}: ${t.size};`, `  --leading-${k}: ${t.lineHeight};`, `  --tracking-${k}: ${t.tracking};`]),
  '',
  '  /* space — 4px grid */',
  ...Object.entries(space).map(([k, v]) => `  --space-${k}: ${v};`),
  '',
  '  /* radius */',
  `  --radius: ${radiusBase};`,
  ...Object.entries(radius).map(([k, v]) => `  --radius-${k}: ${v};`),
  '',
  '  /* motion — durations */',
  ...Object.entries(DURATIONS).map(([k, [ms, use]]) => `  --duration-${k}: ${ms}ms; /* ${use} */`),
  '',
  '  /* motion — easings */',
  ...Object.entries(EASINGS).map(([k, [a, b, c, d, use]]) => `  --ease-${k}: cubic-bezier(${a}, ${b}, ${c}, ${d}); /* ${use} */`),
  '',
  '  /* motion — springs as CSS linear(); pair each with its duration */',
  ...Object.entries(springs).flatMap(([k, s]) => [
    `  --spring-${k}: ${s.easing};`, `  --spring-${k}-duration: ${s.duration}ms; /* ${s.use} */`]),
].join('\n');

const reducedMotion = `
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms; --duration-fast: 0ms; --duration-base: 0ms;
    --duration-moderate: 0ms; --duration-slow: 0ms; --duration-slower: 0ms;
${Object.keys(springs).map((k) => `    --spring-${k}-duration: 0ms;`).join('\n')}
  }
}`;

function cssFile() {
  return `/* Design tokens — generated by ui-motion-design/scripts/tokens.mjs
   brand ${args.brand} → ${ok(brand)} (sits on ${NAME}-${brandStep})
   Dark mode: prefers-color-scheme (unless data-theme="light"), or data-theme="dark" / .dark */

:root {
  color-scheme: light dark;

  /* ramps */
${brandVars(ok)}

${neutralVars(ok)}

  /* semantic — light */
${semVars(light)}
${shadowVars('light')}

${staticVars()}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not(.light) {
    color-scheme: dark;
${semVars(dark, '    ')}
${shadowVars('dark', '    ')}
  }
}

:root[data-theme="dark"], .dark {
  color-scheme: dark;
${semVars(dark)}
${shadowVars('dark')}
}
${reducedMotion}
`;
}

function tailwindFile() {
  const semKeys = Object.keys(light);
  return `/* Tailwind v4 + shadcn/ui token file — generated by ui-motion-design/scripts/tokens.mjs
   Usage: in your global CSS, after @import "tailwindcss"; add @import "./tailwind.tokens.css";
   Brand ${args.brand} sits on ${NAME}-${brandStep}. */

@custom-variant dark (&:where(.dark, .dark *));

:root {
${semVars(light)}
${shadowVars('light')}
  --radius: ${radiusBase};
${Object.entries(DURATIONS).map(([k, [ms]]) => `  --duration-${k}: ${ms}ms;`).join('\n')}
${Object.entries(springs).flatMap(([k, s]) => [`  --spring-${k}: ${s.easing};`, `  --spring-${k}-duration: ${s.duration}ms;`]).join('\n')}
}

.dark {
${semVars(dark)}
${shadowVars('dark')}
}
${reducedMotion}

@theme inline {
${semKeys.map((k) => `  --color-${k}: var(--${k});`).join('\n')}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
${['xs', 'sm', 'md', 'lg', 'xl'].map((k) => `  --shadow-${k}: var(--shadow-${k});`).join('\n')}
}

@theme {
${brandVars(ok).replace(new RegExp(`--${NAME}-`, 'g'), `--color-${NAME}-`)}
${neutralVars(ok).replace(/--neutral-/g, '--color-neutral-')}
  --font-sans: ${args['font-sans']};
  --font-display: ${args['font-display'] || args['font-sans']};
  --font-mono: ${args['font-mono']};
${Object.entries(type).flatMap(([k, t]) => [`  --text-${k}: ${t.size};`, `  --text-${k}--line-height: ${t.lineHeight};`, `  --text-${k}--letter-spacing: ${t.tracking};`]).join('\n')}
${Object.entries(EASINGS).map(([k, [a, b, c, d]]) => `  --ease-${k}: cubic-bezier(${a}, ${b}, ${c}, ${d});`).join('\n')}
${Object.keys(springs).map((k) => `  --ease-spring-${k}: var(--spring-${k});`).join('\n')}
}
/* Durations: duration-(--duration-base), springs: ease-spring-smooth duration-(--spring-smooth-duration) */
`;
}

function dataObject() {
  const hexMap = (r) => Object.fromEntries(STEPS.map((s) => [s, hex(r[s])]));
  const semHex = (sem) => Object.fromEntries(Object.entries(sem).map(([k, v]) => [k, hex(v)]));
  const semOk = (sem) => Object.fromEntries(Object.entries(sem).map(([k, v]) => [k, ok(v)]));
  return {
    meta: { brand: args.brand, brandOklch: ok(brand), brandStep: `${NAME}-${brandStep}`, generator: 'ui-motion-design/tokens.mjs' },
    color: {
      [NAME]: hexMap(B), neutral: hexMap(N),
      light: semHex(light), dark: semHex(dark),
      oklch: { light: semOk(light), dark: semOk(dark) },
    },
    type: { families: { sans: args['font-sans'], display: args['font-display'] || args['font-sans'], mono: args['font-mono'] }, scale: type },
    space, radius,
    shadow: { light: shadows('light'), dark: shadows('dark') },
    motion: {
      duration: Object.fromEntries(Object.entries(DURATIONS).map(([k, [ms]]) => [k, ms])),
      easing: Object.fromEntries(Object.entries(EASINGS).map(([k, [a, b, c, d]]) => [k, [a, b, c, d]])),
      spring: Object.fromEntries(Object.entries(springs).map(([k, s]) => [k, { stiffness: s.stiffness, damping: s.damping, mass: 1 }])),
      springCss: Object.fromEntries(Object.entries(springs).map(([k, s]) => [k, { easing: s.easing, duration: s.duration }])),
    },
    contrast: report,
  };
}

function tsFile() {
  const d = dataObject();
  delete d.contrast;
  return `// Design tokens — generated by ui-motion-design/scripts/tokens.mjs. Do not edit by hand; re-run the script.
// Colors are hex so they work in React Native too.
//
// Motion (motion.dev / framer-motion):
//   <motion.div transition={{ type: "spring", ...tokens.motion.spring.smooth }} />
//   <motion.div transition={{ duration: tokens.motion.duration.base / 1000, ease: tokens.motion.easing.out }} />
// Reanimated (Expo):
//   withSpring(1, tokens.motion.spring.snappy)
//   withTiming(1, { duration: tokens.motion.duration.base, easing: Easing.bezier(...tokens.motion.easing.out) })

export const tokens = ${JSON.stringify(d, null, 2)} as const;

export type SpringName = keyof typeof tokens.motion.spring;
export type EasingName = keyof typeof tokens.motion.easing;
export default tokens;
`;
}

// ---------- preview ----------
function previewFile(css) {
  const swatch = (name, r) => STEPS.map((s) => {
    const fill = oklchToRgb(r[s]); const fg = onColor(r[s]);
    const lc = Math.abs(apcaContrast(oklchToRgb(fg), fill)).toFixed(0);
    return `<div class="sw" style="background:var(--${name}-${s});color:${ok(fg)}"><b>${s}${name === NAME && s === brandStep ? ' ★' : ''}</b><span>${hex(r[s])}</span><span>Lc ${lc}</span></div>`;
  }).join('');
  const semRow = (keys) => keys.map((k) => `<div class="sem" style="background:var(--${k});color:var(--${k}-foreground, var(--foreground))"><code>--${k}</code></div>`).join('');
  const contrastTable = (rows) => rows.map((r) => `<tr class="${r.pass ? '' : 'bad'}"><td><code>${r.fg}</code> on <code>${r.bg}</code></td><td>${r.kind}</td><td>${r.ratio}:1</td><td>Lc ${r.apca}</td><td>${r.pass ? '✓' : '✗'}</td></tr>`).join('');
  const typeRows = Object.keys(type).reverse().map((k) => `<div class="tr"><code>${k}</code><span style="font-size:var(--text-${k});line-height:var(--leading-${k});letter-spacing:var(--tracking-${k})">Grundriss, Gefühl & Geschwindigkeit</span><small>${type[k].min}–${type[k].max}px</small></div>`).join('');
  const motionRows = [
    ...Object.entries(EASINGS).filter(([k]) => k !== 'linear').map(([k]) => [`ease-${k}`, `var(--ease-${k})`, 'var(--duration-slow)']),
    ...Object.keys(springs).map((k) => [`spring-${k}`, `var(--spring-${k})`, `var(--spring-${k}-duration)`]),
  ].map(([n, e, d]) => `<div class="mr"><code>${n}</code><div class="track"><div class="dot" style="transition-timing-function:${e};transition-duration:${d}"></div></div></div>`).join('');

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Style Tile</title>
<style>
${css}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-sans);background:var(--background);color:var(--foreground);font-size:var(--text-base);line-height:1.5}
.page{max-width:1120px;margin:0 auto;padding:var(--space-10) 16px var(--space-24)}
header{display:flex;justify-content:space-between;align-items:end;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-12)}
h1{font-family:var(--font-display);font-size:var(--text-4xl);line-height:var(--leading-4xl);letter-spacing:var(--tracking-4xl);margin:0}
h2{font-size:var(--text-xl);margin:var(--space-12) 0 var(--space-4)}
p.lede{color:var(--muted-foreground);margin:var(--space-2) 0 0;max-width:60ch}
.btn{font:inherit;font-weight:500;min-height:44px;border:1px solid var(--border);background:var(--card);color:var(--foreground);border-radius:var(--radius-md);padding:var(--space-2) var(--space-4);cursor:pointer;transition:background var(--duration-instant) var(--ease-standard),transform var(--duration-instant) var(--ease-standard)}
.btn:hover{background:var(--accent)}.btn:active{transform:scale(.97)}
.btn.primary{background:var(--primary);color:var(--primary-foreground);border-color:transparent}
.btn:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
.ramp{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));border-radius:var(--radius-lg);overflow:hidden}
.sw{padding:var(--space-3) var(--space-2);min-height:96px;display:flex;flex-direction:column;justify-content:end;gap:2px;font-size:var(--text-xs)}
.sw span{font-family:var(--font-mono)}
.semgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-2)}
.sem{border:1px solid var(--border);border-radius:var(--radius-md);padding:var(--space-4) var(--space-3);font-size:var(--text-xs)}.sem code,.mr code{font-size:1em}
.modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:var(--space-6)}
.mode{border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-6);background:var(--background);color:var(--foreground)}
.card{background:var(--card);color:var(--card-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-5);box-shadow:var(--shadow-sm)}
.card h3{margin:0 0 var(--space-1);font-size:var(--text-lg)}.card p{margin:0 0 var(--space-4);color:var(--muted-foreground);font-size:var(--text-sm)}
.row{display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center}
.badge{font-size:var(--text-xs);font-weight:500;padding:2px var(--space-2);border-radius:var(--radius-full)}
table{width:100%;border-collapse:collapse;font-size:var(--text-sm)}td{padding:var(--space-2);border-bottom:1px solid var(--border)}tr.bad td{color:var(--destructive);font-weight:600}
.tr{display:grid;grid-template-columns:48px 1fr auto;gap:var(--space-4);align-items:baseline;padding:var(--space-2) 0;border-bottom:1px solid var(--border)}
.tr span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tr small{color:var(--muted-foreground);font-family:var(--font-mono)}
.boxes{display:flex;gap:var(--space-6);flex-wrap:wrap;align-items:end}
.box{width:96px;height:96px;background:var(--card);border:1px solid var(--border);display:grid;place-items:center;font-size:var(--text-xs);color:var(--muted-foreground)}
.mr{display:grid;grid-template-columns:140px 1fr;gap:var(--space-4);align-items:center;padding:var(--space-2) 0}
.track{position:relative;height:24px;background:var(--muted);border-radius:var(--radius-full)}
.track{container-type:inline-size}
.dot{position:absolute;left:4px;top:4px;width:16px;height:16px;border-radius:50%;background:var(--primary);transition-property:transform}
.play .dot{transform:translateX(calc(100cqw - 24px))}
code{font-family:var(--font-mono);font-size:.9em}
@media (max-width:640px){.ramp{grid-template-columns:repeat(4,minmax(0,1fr))}.mr{grid-template-columns:1fr}}
</style>
<script>try{var t=localStorage.getItem('tile-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head><body><div class="page">
<header><div><h1>Style Tile</h1><p class="lede">Generated from <code>${args.brand}</code> (${ok(brand)}). The brand color sits unchanged on <code>${NAME}-${brandStep}</code>; all other steps are derived in OKLCH.</p></div>
<div class="row"><button class="btn" id="theme">Theme wechseln</button><button class="btn primary" id="play">Motion abspielen</button></div></header>

<h2>${NAME}</h2><div class="ramp">${swatch(NAME, B)}</div>
<h2>neutral</h2><div class="ramp">${swatch('neutral', N)}</div>

<h2>Semantic tokens</h2>
<div class="semgrid">${semRow(['background', 'card', 'primary', 'secondary', 'muted', 'accent', 'primary-subtle', 'destructive', 'success', 'warning', 'info'])}</div>

<h2>In use</h2>
<div class="modes">
${['light', 'dark'].map((m) => `<div class="mode" data-theme="${m}" style="color-scheme:${m}">
<div class="card"><h3>Angebot an Kunde senden</h3><p>Das PDF wird mit deinem Briefkopf erzeugt und per Mail verschickt.</p>
<div class="row"><button class="btn primary">Senden</button><button class="btn">Vorschau</button>
<span class="badge" style="background:var(--success);color:var(--success-foreground)">bezahlt</span>
<span class="badge" style="background:var(--warning);color:var(--warning-foreground)">offen</span>
<span class="badge" style="background:var(--primary-subtle);color:var(--primary-subtle-foreground)">neu</span></div></div></div>`).join('\n')}
</div>

<h2>Contrast — light</h2><table>${contrastTable(report.light)}</table>
<h2>Contrast — dark</h2><table>${contrastTable(report.dark)}</table>

<h2>Type scale</h2><div>${typeRows}</div>

<h2>Radius & elevation</h2>
<div class="boxes">${['sm', 'md', 'lg', 'xl', '2xl'].map((r, i) => `<div class="box" style="border-radius:var(--radius-${r});box-shadow:var(--shadow-${['xs', 'sm', 'md', 'lg', 'xl'][i]})">${r}</div>`).join('')}</div>

<h2>Motion</h2><p class="lede">Easings run at --duration-slow; springs at their own settle duration. Reduced-motion users see no movement.</p>
<div id="motion">${motionRows}</div>
</div>
<script>
document.getElementById('play').onclick=()=>{const m=document.getElementById('motion');m.classList.toggle('play')};
document.getElementById('theme').onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=dark?'light':'dark';try{localStorage.setItem('tile-theme',r.dataset.theme)}catch(e){}};
</script>
</body></html>`;
}

// The preview's .mode containers set data-theme; make tokens respond to it on any element.
function scopedModeCss() {
  return `[data-theme="light"]{\n${semVars(light)}\n${shadowVars('light')}\n}\n[data-theme="dark"]{\n${semVars(dark)}\n${shadowVars('dark')}\n}`;
}

// ---------- run ----------
const outDir = resolve(args.out);
mkdirSync(outDir, { recursive: true });
const want = (f) => args.format === 'all' || args.format.split(',').includes(f);
const written = [];
const css = cssFile();
if (want('css')) { writeFileSync(join(outDir, 'tokens.css'), css); written.push('tokens.css'); }
if (want('tailwind')) { writeFileSync(join(outDir, 'tailwind.tokens.css'), tailwindFile()); written.push('tailwind.tokens.css'); }
if (want('json')) { writeFileSync(join(outDir, 'tokens.json'), JSON.stringify(dataObject(), null, 2)); written.push('tokens.json'); }
if (want('ts')) { writeFileSync(join(outDir, 'tokens.ts'), tsFile()); written.push('tokens.ts'); }
if (args.preview) { writeFileSync(join(outDir, 'style-tile.html'), previewFile(css + '\n' + scopedModeCss())); written.push('style-tile.html'); }

if (!args.quiet) {
  console.log(`Brand ${args.brand} → ${ok(brand)} on ${NAME}-${brandStep}`);
  console.log(`Primary: light ${NAME}-${lightPrimary.step}, dark ${NAME}-${darkPrimary.step}`);
  for (const mode of ['light', 'dark']) {
    const bad = report[mode].filter((r) => !r.pass);
    console.log(`Contrast ${mode}: ${bad.length ? bad.map((r) => `✗ ${r.fg}/${r.bg} ${r.ratio}:1`).join(', ') : 'all pairs pass'}`);
  }
  console.log(`Wrote ${written.map((f) => join(args.out, f)).join(', ')}`);
}
