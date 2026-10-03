#!/usr/bin/env node
// UX / UI / motion audit of a running page with Playwright.
//
//   node audit.mjs <url|file.html> [--out ./ux-audit] [--viewports 390x844,1440x900]
//                  [--auth user:pass] [--wait 800] [--focus-steps 25] [--no-screenshots]
//
// Checks per viewport: horizontal overflow, text contrast (WCAG + APCA, with real
// backgrounds), touch-target size, accessible names, labels, alt text, headings, zoom lock,
// small text, line length/height, focus visibility (real Tab presses), layout shift (CLS),
// LCP, and motion hygiene (transition: all, layout-property animation, long durations,
// infinite loops, prefers-reduced-motion support — verified by reloading with reduce).
// Writes report.md, report.json and full-page screenshots.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values: a, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', default: './ux-audit' },
    viewports: { type: 'string', default: '390x844,1440x900' },
    auth: { type: 'string' },
    wait: { type: 'string', default: '800' },
    'focus-steps': { type: 'string', default: '25' },
    'no-screenshots': { type: 'boolean', default: false },
    'max-per-type': { type: 'string', default: '12' },
  },
});

if (!positionals[0]) {
  console.log('Usage: node audit.mjs <url|file.html> [--out ./ux-audit] [--viewports 390x844,1440x900] [--auth user:pass]');
  process.exit(1);
}

let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  console.error('Playwright not found. Run once inside the skill folder:\n  npm install && npx playwright install chromium');
  process.exit(1);
}

const target = /^https?:|^file:/.test(positionals[0]) ? positionals[0]
  : existsSync(positionals[0]) ? pathToFileURL(resolve(positionals[0])).href : `https://${positionals[0]}`;
const outDir = resolve(a.out);
mkdirSync(outDir, { recursive: true });
const viewports = a.viewports.split(',').map((v) => { const [w, h] = v.split('x').map(Number); return { width: w, height: h || 900 }; });
const httpCredentials = a.auth ? { username: a.auth.split(':')[0], password: a.auth.split(':').slice(1).join(':') } : undefined;
const MAX = Number(a['max-per-type']);

// ---------------- in-page code ----------------
const INIT = () => {
  window.__ux = { cls: 0, lcp: 0, shifts: [] };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__ux.cls += e.value;
        if (e.value > 0.01) window.__ux.shifts.push({ value: e.value, sources: (e.sources || []).map((s) => s.node && s.node.nodeType === 1 ? (s.node.id ? '#' + s.node.id : s.node.tagName.toLowerCase() + (s.node.className && typeof s.node.className === 'string' ? '.' + s.node.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : '?') });
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => { const e = list.getEntries().at(-1); if (e) window.__ux.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
};

const AUDIT = ({ isMobile }) => {
  const issues = [];
  const stats = {};
  const LAYOUT = /^(width|height|top|left|right|bottom|inset|margin|padding|font-size|max-width|max-height|min-width|min-height|flex-basis|border-width)/; // grid-template-rows 0fr→1fr is the sanctioned height:auto technique;
  const sel = (el) => {
    if (!el || el.nodeType !== 1) return '';
    const parts = [];
    for (let n = el, i = 0; n && n.nodeType === 1 && i < 3; n = n.parentElement, i++) {
      if (n.id) { parts.unshift('#' + CSS.escape(n.id)); break; }
      let p = n.tagName.toLowerCase();
      const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).filter((c) => c && c.length < 30).slice(0, 2) : [];
      if (cls.length) p += '.' + cls.map((c) => CSS.escape(c)).join('.');
      parts.unshift(p);
    }
    return parts.join(' > ');
  };
  const snip = (el) => ['HTML', 'BODY', 'HEAD'].includes(el?.tagName) ? '' : (el?.innerText || el?.getAttribute?.('aria-label') || el?.value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const add = (type, severity, msg, el, extra = {}) => issues.push({ type, severity, msg, selector: sel(el), text: snip(el), ...extra });
  const visible = (el) => {
    if (!el.checkVisibility) { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // --- color helpers
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, al] = ctx.getImageData(0, 0, 1, 1).data; return [r / 255, g / 255, b / 255, al / 255];
  };
  const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (f, b) => { const x = lum(f), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const apca = (t, b) => {
    const Y = (c) => 0.2126729 * c[0] ** 2.4 + 0.7151522 * c[1] ** 2.4 + 0.072175 * c[2] ** 2.4;
    const cl = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
    const yt = cl(Y(t)), yb = cl(Y(b));
    if (Math.abs(yb - yt) < 0.0005) return 0;
    if (yb > yt) { const s = (yb ** 0.56 - yt ** 0.57) * 1.14; return s < 0.1 ? 0 : (s - 0.027) * 100; }
    const s = (yb ** 0.65 - yt ** 0.62) * 1.14; return s > -0.1 ? 0 : (s + 0.027) * 100;
  };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { unknown: 'background image/gradient' };
      const c = rgba(cs.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    let base = [1, 1, 1, 1];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return { color: base };
  };
  const opacityChain = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };

  // --- document-level
  if (!document.documentElement.lang) add('lang', 'warn', '<html> has no lang attribute (screen readers guess the language)', document.documentElement);
  const vp = document.querySelector('meta[name=viewport]')?.content || '';
  if (!vp) add('zoom', 'error', 'No <meta name="viewport"> — mobile browsers render a zoomed-out desktop page', document.head);
  else if (/user-scalable\s*=\s*(no|0)/.test(vp) || /maximum-scale\s*=\s*1(\.0)?\b/.test(vp)) add('zoom', 'error', `Viewport blocks zoom (${vp}) — WCAG 1.4.4`, document.head);

  // --- running animations
  const anims = document.getAnimations();
  const running = anims.filter((x) => x.playState === 'running');
  const infinite = running.filter((x) => x.effect?.getTiming?.().iterations === Infinity);
  stats.runningAnimations = running.length; stats.infiniteAnimations = infinite.length;
  const loops = new Map();
  for (const x of infinite) { const n = x.animationName || x.id || 'web-animation'; const e = loops.get(n); if (e) e.count++; else loops.set(n, { count: 1, target: x.effect?.target }); }
  for (const [n, { count, target }] of [...loops].slice(0, 6)) {
    if (/shimmer|skeleton|spin|rotate|pulse|load/i.test(n)) continue; // loaders are fine
    add('motion-loop', 'info', `Infinite animation "${n}"${count > 1 ? ` on ${count} elements` : ''} — fine for loaders, distracting for decoration (WCAG 2.2.2: needs pause if > 5s)`, target);
  }
  for (const x of running) {
    const kf = x.effect?.getKeyframes?.() || [];
    const lay = [...new Set(kf.flatMap((k) => Object.keys(k)).filter((p) => LAYOUT.test(p.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()))))];
    if (lay.length && !x.animationName) add('motion-layout', 'warn', `Web animation animates ${lay.join(', ')} — use transform/opacity`, x.effect?.target);
  }

  // measure final visual states: cancel finite/scroll-driven animations (fades mid-flight would fake low contrast)
  for (const x of document.getAnimations()) { if (x.effect?.getTiming?.().iterations !== Infinity) { try { x.cancel(); } catch {} } }

  // --- overflow
  const vw = document.documentElement.clientWidth;
  stats.scrollWidth = document.documentElement.scrollWidth;
  if (document.documentElement.scrollWidth > vw + 1) {
    const culprits = [];
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0 && visible(el)) {
        let clipped = false;
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const ox = getComputedStyle(n).overflowX; if (ox !== 'visible') { clipped = true; break; }
        }
        if (!clipped && ![...el.children].some((c) => c.getBoundingClientRect().right > vw + 1)) culprits.push(el);
      }
      if (culprits.length >= 5) break;
    }
    add('overflow', 'error', `Page scrolls horizontally: ${document.documentElement.scrollWidth}px content in ${vw}px viewport`, document.body, { culprits: culprits.map(sel) });
  }

  // --- text: contrast, size, line length
  const seen = new Map();
  let small = 0, textEls = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (t) => t.textContent.trim().length > 1 ? 1 : 2 });
  const textParents = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) if (t.parentElement) textParents.add(t.parentElement);
  for (const el of textParents) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE', 'OPTION'].includes(el.tagName) || el.closest('[aria-hidden=true],svg')) continue;
    if (!visible(el)) continue;
    textEls++;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize), fw = Number(cs.fontWeight) || 400;
    if (fs < 12) { small++; if (small <= 3) add('small-text', 'warn', `Text at ${fs}px is hard to read; keep ≥ 12px (labels) and ≥ 16px (body on mobile)`, el); }
    const bg = bgOf(el);
    if (bg.unknown) continue;
    const fg = rgba(cs.color); fg[3] *= opacityChain(el);
    const fgc = over(fg, bg.color);
    const r = ratio(fgc, bg.color), lc = apca(fgc, bg.color);
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const need = large ? 3 : 4.5;
    if (r < need) {
      const key = hex(fgc) + hex(bg.color) + large;
      const e = seen.get(key);
      if (e) e.count++;
      else {
        const issue = { type: 'contrast', severity: r < need - 1 ? 'error' : 'warn', msg: `Contrast ${r.toFixed(2)}:1 (needs ${need}:1${large ? ', large text' : ''}) · APCA Lc ${lc.toFixed(0)} · ${hex(fgc)} on ${hex(bg.color)} · ${fs}px/${fw}`, selector: sel(el), text: snip(el), count: 1 };
        seen.set(key, issue); issues.push(issue);
      }
    }
    if (el.tagName === 'P' && el.innerText.length > 120) {
      const chars = el.getBoundingClientRect().width / (fs * 0.5);
      if (chars > 90) add('measure', 'warn', `Paragraph line length ≈ ${Math.round(chars)} characters — aim for 45–75 (max-width: 65ch)`, el);
      const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs;
      if (lh < 1.35) add('leading', 'warn', `Paragraph line-height ${lh.toFixed(2)} — body text reads best at 1.45–1.7`, el);
      if (isMobile && fs < 16) add('body-size', 'info', `Body text ${fs}px on mobile — 16px avoids zooming and iOS input zoom`, el);
    }
  }
  stats.textElements = textEls; stats.smallText = small;

  // --- interactive: names, targets
  const interactive = document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=switch],[role=tab],[role=menuitem],[tabindex]:not([tabindex="-1"])');
  let tooSmall = 0, smallMobile = 0;
  const targets = [];
  stats.interactive = interactive.length;
  for (const el of interactive) {
    if (!visible(el)) continue;
    const tag = el.tagName;
    // accessible name
    const labelled = el.getAttribute('aria-labelledby')?.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim();
    const imgAlt = [...el.querySelectorAll('img[alt],svg title')].map((n) => n.getAttribute?.('alt') || n.textContent).join(' ').trim();
    let name = (el.getAttribute('aria-label') || labelled || el.innerText || el.getAttribute('title') || imgAlt || el.value || '').trim();
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
      const lbl = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest('label');
      name = (el.getAttribute('aria-label') || labelled || lbl?.innerText || el.getAttribute('title') || '').trim();
      if (!name && !['submit', 'button', 'reset', 'image'].includes(el.type)) {
        add('label', el.placeholder ? 'warn' : 'error', el.placeholder ? `Field uses placeholder "${el.placeholder}" as its only label — it disappears on input` : 'Form field has no label', el);
      }
    } else if (!name) add('name', 'error', `${tag.toLowerCase()} has no accessible name (icon-only? add aria-label)`, el);
    // target size
    const r = el.getBoundingClientRect();
    const inlineLink = tag === 'A' && getComputedStyle(el).display === 'inline' || (tag === 'A' && el.parentElement && getComputedStyle(el.parentElement).display === 'block' && getComputedStyle(el).display.startsWith('inline') && el.parentElement.innerText.length > el.innerText.length + 20); // WCAG 2.5.8 inline exception
    if (inlineLink || ['checkbox', 'radio'].includes(el.type)) continue;
    if (r.width <= 2 || r.height <= 2) continue; // visually hidden (sr-only / skip link)
    targets.push({ el, r });
  }
  // WCAG 2.5.8: an undersized target passes if a 24px circle around its center hits no other target
  const nearOther = (t) => {
    const cx = t.r.left + t.r.width / 2, cy = t.r.top + t.r.height / 2;
    return targets.some((o) => o !== t && !o.el.contains(t.el) && !t.el.contains(o.el) &&
      Math.max(o.r.left - cx, 0, cx - o.r.right) ** 2 + Math.max(o.r.top - cy, 0, cy - o.r.bottom) ** 2 < 12 * 12);
  };
  for (const t of targets) {
    const { el, r } = t;
    const m = Math.min(r.width, r.height);
    if (m < 24) {
      tooSmall++;
      if (tooSmall <= MAXT) {
        const crowded = nearOther(t);
        add('target', crowded ? 'error' : 'warn', `Target ${Math.round(r.width)}×${Math.round(r.height)}px — below 24×24${crowded ? ' and crowded by a neighbour (fails WCAG 2.5.8)' : ' (passes 2.5.8 only via spacing; hard to hit on touch)'}`, el);
      }
    } else if (isMobile && m < 44) { smallMobile++; if (smallMobile <= MAXT) add('target', 'warn', `Touch target ${Math.round(r.width)}×${Math.round(r.height)}px — aim for 44×44 on touch`, el); }
  }
  stats.targetsBelow24 = tooSmall; stats.targetsBelow44 = smallMobile;

  // --- inputs: iOS zooms on focus below 16px; disabled submit hides what's missing
  if (isMobile) {
    const small = [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]),select,textarea')].filter((el) => visible(el) && parseFloat(getComputedStyle(el).fontSize) < 16);
    if (small.length) add('input-zoom', 'warn', `${small.length} form field(s) under 16px — iOS Safari zooms in on focus`, small[0]);
  }
  for (const b of document.querySelectorAll('button[type=submit][disabled], form button:not([type])[disabled]')) {
    if (visible(b)) add('disabled-submit', 'info', 'Disabled submit button — let people submit and show what is missing (GOV.UK, Primer)', b);
  }

  // --- images
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt') && visible(img)) add('alt', 'error', 'Image without alt attribute (use alt="" if decorative)', img, { src: img.currentSrc?.slice(0, 120) });
    else if (img.naturalWidth > img.getBoundingClientRect().width * 3 && img.naturalWidth > 1200) add('image-weight', 'info', `Image ${img.naturalWidth}px wide rendered at ${Math.round(img.getBoundingClientRect().width)}px — serve srcset/sizes`, img);
    if (!img.getAttribute('width') && !img.getAttribute('height') && !getComputedStyle(img).aspectRatio.includes('/') && visible(img)) add('cls-risk', 'info', 'Image without width/height or aspect-ratio — causes layout shift while loading', img);
  }

  // --- headings
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  const h1 = hs.filter((h) => h.tagName === 'H1').length;
  if (!h1) add('headings', 'warn', 'No visible <h1>', document.body);
  if (h1 > 1) add('headings', 'info', `${h1} <h1> elements — usually one per page`, document.body);
  let prev = 0;
  for (const h of hs) { const l = Number(h.tagName[1]); if (prev && l > prev + 1) add('headings', 'warn', `Heading level jumps h${prev} → h${l}`, h); prev = l; }
  stats.headings = hs.map((h) => h.tagName.toLowerCase() + ': ' + h.innerText.trim().slice(0, 50));

  // --- motion: stylesheets
  let reducedMotionRule = false, sheetsBlocked = 0;
  const layoutKeyframes = new Set(), keyframesAll = new Set();
  const walk = (rules) => {
    for (const r of rules) {
      if (r.conditionText && /prefers-reduced-motion/.test(r.conditionText)) reducedMotionRule = true;
      if (r.type === CSSRule.KEYFRAMES_RULE) {
        keyframesAll.add(r.name);
        for (const k of r.cssRules) for (let i = 0; i < k.style.length; i++) if (LAYOUT.test(k.style[i])) layoutKeyframes.add(`${r.name} (${k.style[i]})`);
      }
      if (r.cssRules) walk(r.cssRules);
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch { sheetsBlocked++; } }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches === false && !reducedMotionRule) {
    // also check JS libraries that honor it (Motion's MotionConfig, GSAP matchMedia) — can't detect, so warn softly
  }
  stats.reducedMotionRule = reducedMotionRule; stats.sheetsBlocked = sheetsBlocked; stats.keyframes = [...keyframesAll];
  for (const k of [...layoutKeyframes].slice(0, MAXT)) add('motion-layout', 'warn', `@keyframes ${k} animates a layout property — use transform/opacity`, document.body);

  // --- motion: transitions on elements
  let tAll = 0, tLayout = 0, tLong = 0, willChange = 0;
  const els = document.body.querySelectorAll('*');
  for (let i = 0; i < Math.min(els.length, 4000); i++) {
    const el = els[i]; const cs = getComputedStyle(el);
    if (cs.willChange && cs.willChange !== 'auto') willChange++;
    const durs = cs.transitionDuration.split(',').map((d) => parseFloat(d) * (d.includes('ms') ? 1 : 1000));
    const maxDur = Math.max(...durs);
    if (!maxDur) continue;
    const props = cs.transitionProperty.split(',').map((p) => p.trim());
    if (props.includes('all')) { tAll++; if (tAll <= 4) add('motion-all', 'warn', `transition: all (${maxDur}ms) — animates every changed property incl. layout; list properties explicitly`, el); }
    const lay = props.filter((p) => LAYOUT.test(p));
    if (lay.length) { tLayout++; if (tLayout <= 4) add('motion-layout', 'warn', `Transitions ${lay.join(', ')} — triggers layout every frame; animate transform/opacity (or grid-template-rows for height)`, el); }
    if (maxDur > 500 && el.matches('a,button,input,select,textarea,[role=button],[role=tab],[role=menuitem]')) { tLong++; if (tLong <= 4) add('motion-duration', 'warn', `Interactive element transition ${maxDur}ms — feedback should land in 100–200ms`, el); }
  }
  stats.transitionAll = tAll; stats.transitionLayout = tLayout; stats.willChange = willChange;
  if (willChange > 15) add('motion-perf', 'warn', `${willChange} elements keep will-change — set it only while animating`, document.body);

  return { issues, stats };
};

const FOCUS_BASELINE = () => {
  const els = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[tabindex]:not([tabindex="-1"])')];
  const snap = (el) => { const c = getComputedStyle(el); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor, c.textDecorationLine, c.color].join('|'); };
  els.forEach((el, i) => { el.dataset.uxI = i; el.dataset.uxBase = snap(el); });
  return els.length;
};
const FOCUS_CHECK = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const c = getComputedStyle(el);
  const now = [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor, c.textDecorationLine, c.color].join('|');
  const r = el.getBoundingClientRect();
  const visibleOutline = c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0;
  const label = (el.innerText || el.getAttribute('aria-label') || el.name || el.tagName).trim().slice(0, 40);
  const sel = el.id ? '#' + el.id : el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  return { i: el.dataset.uxI, changed: el.dataset.uxBase !== undefined ? el.dataset.uxBase !== now : visibleOutline, visibleOutline, offscreen: r.bottom < 0 || r.top > innerHeight * 3 || r.width === 0, label, sel };
};

// ---------------- run ----------------
const browser = await chromium.launch();
const report = { url: target, date: new Date().toISOString(), viewports: [] };

async function open(context) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(INIT);
  try { await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 }); }
  catch { await page.goto(target, { waitUntil: 'load', timeout: 45000 }); }
  await page.waitForTimeout(Number(a.wait));
  return { page, errors };
}

for (const vp of viewports) {
  const isMobile = vp.width < 768;
  const label = `${vp.width}x${vp.height}`;
  console.log(`→ ${label}`);
  const context = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1, httpCredentials });
  const { page, errors } = await open(context);

  // scroll through to trigger lazy content and scroll-driven reveals, then back up
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300));
  });

  const { issues, stats } = await page.evaluate(`(${AUDIT.toString().replace(/MAXT/g, String(MAX))})(${JSON.stringify({ isMobile })})`);
  const perf = await page.evaluate(() => window.__ux);
  stats.cls = Number((perf?.cls || 0).toFixed(3)); stats.lcp = Math.round(perf?.lcp || 0);
  if (stats.cls > 0.1) issues.push({ type: 'cls', severity: stats.cls > 0.25 ? 'error' : 'warn', msg: `Cumulative Layout Shift ${stats.cls} (good ≤ 0.1)`, selector: [...new Set(perf.shifts.flatMap((s) => s.sources))].slice(0, 5).join(', ') });
  if (stats.lcp > 2500) issues.push({ type: 'lcp', severity: stats.lcp > 4000 ? 'error' : 'warn', msg: `Largest Contentful Paint ${stats.lcp}ms (good ≤ 2500ms; local/unthrottled measurement)`, selector: '' });

  // focus visibility via real keyboard
  if (!isMobile) {
    await page.evaluate(FOCUS_BASELINE);
    await page.locator('body').click({ position: { x: 1, y: 1 } }).catch(() => {});
    await page.evaluate(() => document.activeElement?.blur?.());
    const seenFocus = new Set(); let noRing = 0;
    for (let i = 0; i < Number(a['focus-steps']); i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(FOCUS_CHECK);
      if (!f || seenFocus.has(f.i)) continue;
      seenFocus.add(f.i);
      if (!f.changed) { noRing++; if (noRing <= 5) issues.push({ type: 'focus', severity: 'error', msg: 'No visible focus indicator on keyboard focus', selector: f.sel, text: f.label }); }
    }
    stats.focusChecked = seenFocus.size; stats.focusMissing = noRing;
  }

  if (!a['no-screenshots']) {
    await page.screenshot({ path: join(outDir, `screenshot-${label}.png`), fullPage: true }).catch(() => {});
  }
  if (errors.length) issues.push({ type: 'console', severity: 'warn', msg: `${errors.length} console error(s): ${errors.slice(0, 3).join(' | ').slice(0, 300)}`, selector: '' });
  await context.close();

  // reduced motion: does the page calm down?
  const rmContext = await browser.newContext({ viewport: vp, isMobile, hasTouch: isMobile, reducedMotion: 'reduce', httpCredentials });
  const rm = await open(rmContext);
  const rmStats = await rm.page.evaluate(() => {
    const run = document.getAnimations().filter((x) => x.playState === 'running');
    const moving = run.filter((x) => !/spin|rotate|load|shimmer|skeleton|pulse/i.test(x.animationName || '') && (x.effect?.getKeyframes?.() || []).some((k) => 'transform' in k || 'translate' in k || 'scale' in k || 'rotate' in k || 'left' in k || 'top' in k)); // loaders are status, not decoration
    return { running: run.length, moving: moving.length };
  });
  await rmContext.close();
  stats.reducedMotion = rmStats;
  if (rmStats.moving > 0) issues.push({ type: 'reduced-motion', severity: 'warn', msg: `${rmStats.moving} movement animation(s) still run with prefers-reduced-motion: reduce${stats.reducedMotionRule ? '' : ' — and no @media (prefers-reduced-motion) rule was found in readable CSS'}`, selector: '' });
  else if (!stats.reducedMotionRule && stats.keyframes.length) issues.push({ type: 'reduced-motion', severity: 'info', msg: 'No @media (prefers-reduced-motion) rule found in readable CSS (JS libraries may still handle it)', selector: '' });

  report.viewports.push({ viewport: label, isMobile, stats, issues });
}
await browser.close();

// ---------------- report ----------------
const order = { error: 0, warn: 1, info: 2 };
const lines = [`# UX audit — ${target}`, '', `${new Date().toLocaleString('de-DE')} · viewports ${a.viewports}`, ''];
lines.push('| Viewport | Errors | Warnings | Info | CLS | LCP | Contrast issues | Small targets | Focus missing |', '|---|---|---|---|---|---|---|---|---|');
for (const v of report.viewports) {
  const c = (s) => v.issues.filter((i) => i.severity === s).length;
  lines.push(`| ${v.viewport} | ${c('error')} | ${c('warn')} | ${c('info')} | ${v.stats.cls} | ${v.stats.lcp}ms | ${v.issues.filter((i) => i.type === 'contrast').reduce((n, i) => n + (i.count || 1), 0)} | ${v.stats.targetsBelow24}${v.isMobile ? ` (+${v.stats.targetsBelow44} < 44)` : ''} | ${v.stats.focusMissing ?? '–'} |`);
}
for (const v of report.viewports) {
  lines.push('', `## ${v.viewport}${v.isMobile ? ' (touch)' : ''}`, '');
  if (!a['no-screenshots']) lines.push(`![${v.viewport}](screenshot-${v.viewport}.png)`, '');
  const sorted = [...v.issues].sort((x, y) => order[x.severity] - order[y.severity] || x.type.localeCompare(y.type));
  if (!sorted.length) lines.push('No issues found.');
  for (const i of sorted) {
    const icon = i.severity === 'error' ? '🔴' : i.severity === 'warn' ? '🟠' : '🔵';
    lines.push(`- ${icon} **${i.type}** — ${i.msg}${i.count > 1 ? ` (${i.count}×)` : ''}${i.selector ? `  \n  \`${i.selector}\`` : ''}${i.text ? ` “${i.text}”` : ''}${i.culprits?.length ? `  \n  culprits: ${i.culprits.map((c) => `\`${c}\``).join(', ')}` : ''}`);
  }
  lines.push('', `<details><summary>Stats</summary>\n\n\`\`\`json\n${JSON.stringify(v.stats, null, 2)}\n\`\`\`\n</details>`);
}
lines.push('', '---', 'Automated checks catch roughly a third of real problems. Follow up with the manual review in `references/review-checklist.md`.');
writeFileSync(join(outDir, 'report.md'), lines.join('\n'));
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
for (const v of report.viewports) {
  const c = (s) => v.issues.filter((i) => i.severity === s).length;
  console.log(`  ${v.viewport}: ${c('error')} errors, ${c('warn')} warnings, ${c('info')} info`);
}
console.log(`Report: ${join(a.out, 'report.md')}`);
