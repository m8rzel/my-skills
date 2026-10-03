#!/usr/bin/env node
// Contrast checker: WCAG 2.x ratio + APCA Lc for color pairs or a whole token file.
//
//   node contrast.mjs "#6b7280" "#ffffff"              # text, background
//   node contrast.mjs "oklch(55% 0.2 260)" white --json
//   node contrast.mjs --css app/globals.css            # checks shadcn-style --x / --x-foreground pairs, light + dark
//   node contrast.mjs --css tokens.css --pairs "muted-foreground:card,primary:background"
//
// Exit code 1 when any text pair is below 4.5:1 (useful in CI).

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { parseColor, wcagContrast, apcaContrast, apcaVerdict, wcagVerdict, toHex, round } from './lib/color.mjs';

const { values: a, positionals } = parseArgs({
  allowPositionals: true,
  options: { css: { type: 'string' }, pairs: { type: 'string' }, json: { type: 'boolean', default: false } },
});

function check(fg, bg) {
  const f = parseColor(fg), b = parseColor(bg);
  const ratio = wcagContrast(f, b), lc = apcaContrast(f, b);
  return { fg: String(fg), bg: String(bg), fgHex: toHex(f), bgHex: toHex(b), ratio: round(ratio, 2), apca: round(lc, 1), wcag: wcagVerdict(ratio), apcaUse: apcaVerdict(lc) };
}

if (!a.css) {
  if (positionals.length < 2) {
    console.log('Usage: node contrast.mjs <text-color> <background-color> [--json]\n       node contrast.mjs --css <file.css> [--pairs "a:b,c:d"] [--json]');
    process.exit(1);
  }
  const r = check(positionals[0], positionals[1]);
  if (a.json) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  console.log(`${r.fg} on ${r.bg}  (${r.fgHex} / ${r.bgHex})`);
  console.log(`WCAG 2.x  ${r.ratio}:1`);
  for (const [k, v] of Object.entries(r.wcag)) console.log(`  ${v ? '✓' : '✗'} ${k}`);
  console.log(`APCA      Lc ${r.apca}  → ${r.apcaUse}`);
  process.exit(r.ratio >= 4.5 ? 0 : 1);
}

// ---------- token file mode ----------
const css = readFileSync(a.css, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
// tiny block parser: remembers enclosing at-rules so @media (prefers-color-scheme: dark) counts as dark
const blocks = [];
{
  const stack = []; let buf = '';
  for (const ch of css) {
    if (ch === '{') { stack.push(buf.split(';').pop().trim()); buf = ''; }
    else if (ch === '}') {
      const selector = stack.pop() ?? '';
      const vars = {};
      for (const v of buf.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[v[1]] = v[2].trim();
      if (Object.keys(vars).length) blocks.push({ selector: [...stack, selector].join(' '), vars });
      buf = '';
    } else buf += ch;
  }
}
const isDark = (s) => /dark/.test(s);
const isTheme = (s) => /:root\b|\bhtml\b|\.light\b|\[data-theme|\.dark\b/.test(s) && !/@theme/.test(s);
const lightVars = Object.assign({}, ...blocks.filter((b) => isTheme(b.selector) && !isDark(b.selector)).map((b) => b.vars));
const darkVars = Object.assign({}, lightVars, ...blocks.filter((b) => isDark(b.selector)).map((b) => b.vars));
const hasDark = blocks.some((b) => isDark(b.selector));

function resolveVar(vars, value, depth = 0) {
  if (depth > 10 || value == null) return null;
  const m = value.match(/^var\(--([\w-]+)(?:\s*,\s*(.+))?\)$/);
  if (m) return resolveVar(vars, vars[m[1]] ?? m[2], depth + 1);
  // bare HSL channels (shadcn v3 style: "222.2 84% 4.9%")
  if (/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/.test(value)) return `hsl(${value})`;
  return value;
}

function pairsFor(vars) {
  if (a.pairs) return a.pairs.split(',').map((p) => p.split(':').map((s) => s.trim().replace(/^--/, '')).concat('text'));
  const out = [];
  for (const k of Object.keys(vars)) {
    if (k.endsWith('-foreground')) {
      const base = k.replace(/-foreground$/, '');
      if (base === 'muted') { out.push([k, 'background', 'text'], [k, 'muted', 'text'], [k, 'card', 'text']); continue; }
      if (vars[base] !== undefined) out.push([k, base, 'text']);
      else if (base === '' || base === 'foreground') out.push([k, 'background', 'text']);
    }
  }
  if (vars.foreground && vars.background) out.unshift(['foreground', 'background', 'text']);
  if (vars.ring && vars.background) out.push(['ring', 'background', 'ui']);
  if (vars.border && vars.background) out.push(['border', 'background', 'decorative']);
  if (vars.input && vars.background) out.push(['input', 'background', 'ui']); // 1.4.11 only if the border alone identifies the field
  return out.filter(([f, b]) => vars[f] !== undefined && vars[b] !== undefined);
}

const results = {};
let failed = 0;
for (const [mode, vars] of [['light', lightVars], ...(hasDark ? [['dark', darkVars]] : [])]) {
  results[mode] = [];
  for (const [f, b, kind] of pairsFor(vars)) {
    const fv = resolveVar(vars, vars[f]), bv = resolveVar(vars, vars[b]);
    try {
      const r = check(fv, bv);
      const need = kind === 'text' ? 4.5 : kind === 'ui' ? 3 : 0;
      const pass = r.ratio >= need;
      if (!pass && kind === 'text') failed++;
      results[mode].push({ pair: `${f} on ${b}`, kind, ratio: r.ratio, apca: r.apca, pass, need });
    } catch (e) {
      results[mode].push({ pair: `${f} on ${b}`, kind, error: e.message });
    }
  }
}

if (a.json) console.log(JSON.stringify(results, null, 2));
else {
  for (const [mode, rows] of Object.entries(results)) {
    console.log(`\n${mode.toUpperCase()}`);
    for (const r of rows) {
      if (r.error) { console.log(`  ?  ${r.pair.padEnd(48)} ${r.error}`); continue; }
      const mark = r.kind === 'decorative' ? '·' : r.pass ? '✓' : r.kind === 'ui' ? '!' : '✗';
      console.log(`  ${mark}  ${r.pair.padEnd(48)} ${String(r.ratio).padStart(5)}:1  Lc ${String(r.apca).padStart(6)}  ${r.kind}${!r.pass && r.need ? ` (needs ${r.need}:1)` : ''}`);
    }
  }
  console.log(failed ? `\n${failed} text pair(s) below 4.5:1` : '\nAll text pairs reach 4.5:1');
}
process.exit(failed ? 1 : 0);
