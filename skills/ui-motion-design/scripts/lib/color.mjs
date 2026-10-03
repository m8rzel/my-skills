// Color math without dependencies: parsing, OKLCH <-> sRGB, gamut mapping,
// WCAG 2.x contrast and APCA (0.0.98G-4g) lightness contrast.

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const round = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;

// ---------- sRGB transfer ----------
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// ---------- OKLab ----------
export function rgbToOklab({ r, g, b }) {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToLinearRgb({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

export function rgbToOklch(rgb) {
  const { L, a, b } = rgbToOklab(rgb);
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: C, h: C < 1e-4 ? 0 : h, alpha: rgb.alpha ?? 1 };
}

const inGamut = ({ r, g, b }, eps = 1e-4) =>
  r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;

/** OKLCH -> sRGB (0..1). Out-of-gamut colors are mapped by reducing chroma (keeps L and h). */
export function oklchToRgb({ l, c, h, alpha = 1 }) {
  const conv = (cc) => {
    const hr = (h * Math.PI) / 180;
    return oklabToLinearRgb({ L: l, a: cc * Math.cos(hr), b: cc * Math.sin(hr) });
  };
  let lin = conv(c);
  if (!inGamut(lin)) {
    let lo = 0, hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(conv(mid))) lo = mid; else hi = mid;
    }
    lin = conv(lo);
  }
  return { r: clamp(toGamma(clamp(lin.r))), g: clamp(toGamma(clamp(lin.g))), b: clamp(toGamma(clamp(lin.b))), alpha };
}

/** Largest chroma that stays inside sRGB for a given L/h. */
export function maxChroma(l, h) {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const hr = (h * Math.PI) / 180;
    if (inGamut(oklabToLinearRgb({ L: l, a: mid * Math.cos(hr), b: mid * Math.sin(hr) }))) lo = mid; else hi = mid;
  }
  return lo;
}

// ---------- HSL ----------
function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0), g: f(8), b: f(4) };
}

// ---------- Parsing ----------
const NAMED = { white: '#ffffff', black: '#000000', transparent: '#00000000', red: '#ff0000', green: '#008000', blue: '#0000ff', gray: '#808080', grey: '#808080' };

function num(token, scale = 1) {
  token = token.trim();
  if (token === 'none') return 0;
  if (token.endsWith('%')) return (parseFloat(token) / 100) * scale;
  return parseFloat(token);
}

function splitArgs(inner) {
  const [main, alpha] = inner.split('/');
  const parts = main.replace(/,/g, ' ').trim().split(/\s+/);
  return { parts, alpha: alpha !== undefined ? num(alpha, 1) : 1 };
}

/** Parse hex, rgb(), hsl(), oklch(), oklab(), color(srgb …) and a few names into {r,g,b,alpha} (0..1). */
export function parseColor(input) {
  if (input && typeof input === 'object') return input;
  let s = String(input).trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s];
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) throw new Error(`Invalid hex color: ${input}`);
    const n = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), alpha: hex.length === 8 ? n(6) : 1 };
  }
  const m = s.match(/^([a-z-]+)\((.*)\)$/);
  if (!m) throw new Error(`Unsupported color: ${input}`);
  const [, fn, inner] = m;
  const { parts, alpha } = splitArgs(inner);
  switch (fn) {
    case 'rgb':
    case 'rgba': {
      const [r, g, b] = parts.map((p) => num(p, 255) / 255);
      const a = parts[3] !== undefined ? num(parts[3], 1) : alpha;
      return { r, g, b, alpha: a };
    }
    case 'hsl':
    case 'hsla': {
      const h = parseFloat(parts[0]);
      const sat = num(parts[1], 1), lig = num(parts[2], 1);
      const a = parts[3] !== undefined ? num(parts[3], 1) : alpha;
      return { ...hslToRgb(h, sat > 1 ? sat / 100 : sat, lig > 1 ? lig / 100 : lig), alpha: a };
    }
    case 'oklch': {
      const l = num(parts[0], 1), c = num(parts[1], 0.4), h = parseFloat(parts[2]) || 0;
      return oklchToRgb({ l: l > 1 ? l / 100 : l, c, h, alpha });
    }
    case 'oklab': {
      const L = num(parts[0], 1), a = num(parts[1], 0.4), b = num(parts[2], 0.4);
      const lin = oklabToLinearRgb({ L: L > 1 ? L / 100 : L, a, b });
      return { r: clamp(toGamma(clamp(lin.r))), g: clamp(toGamma(clamp(lin.g))), b: clamp(toGamma(clamp(lin.b))), alpha };
    }
    case 'color': {
      if (parts[0] !== 'srgb') throw new Error(`Only color(srgb …) is supported: ${input}`);
      return { r: num(parts[1], 1), g: num(parts[2], 1), b: num(parts[3], 1), alpha };
    }
    default:
      throw new Error(`Unsupported color function: ${fn}()`);
  }
}

// ---------- Formatting ----------
export function toHex({ r, g, b, alpha = 1 }) {
  const h = (v) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${alpha < 1 ? h(alpha) : ''}`;
}

export function formatOklch({ l, c, h, alpha = 1 }) {
  const a = alpha < 1 ? ` / ${round(alpha, 3)}` : '';
  return `oklch(${round(l * 100, 2)}% ${round(c, 4)} ${round(h, 2)}${a})`;
}

/** Composite a (possibly translucent) foreground over an opaque background. */
export function composite(fg, bg) {
  const a = fg.alpha ?? 1;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), alpha: 1 };
}

// ---------- WCAG 2.x ----------
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function wcagContrast(fg, bg) {
  fg = parseColor(fg); bg = parseColor(bg);
  if ((fg.alpha ?? 1) < 1) fg = composite(fg, bg);
  const l1 = relativeLuminance(fg), l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ---------- APCA 0.0.98G-4g (text on background) ----------
export function apcaContrast(text, bg) {
  text = parseColor(text); bg = parseColor(bg);
  if ((text.alpha ?? 1) < 1) text = composite(text, bg);
  const Y = ({ r, g, b }) => 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  const clampBlack = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const yt = clampBlack(Y(text)), yb = clampBlack(Y(bg));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  let out;
  if (yb > yt) {
    const sapc = (yb ** 0.56 - yt ** 0.57) * 1.14;
    out = sapc < 0.1 ? 0 : sapc - 0.027;
  } else {
    const sapc = (yb ** 0.65 - yt ** 0.62) * 1.14;
    out = sapc > -0.1 ? 0 : sapc + 0.027;
  }
  return out * 100;
}

/** Rough APCA guidance (Bronze-level simplified): minimum |Lc| per use. */
export function apcaVerdict(lc) {
  const a = Math.abs(lc);
  if (a >= 90) return 'body text at any weight ≥ 300';
  if (a >= 75) return 'body text ≥ 16px/400 (preferred minimum for paragraphs)';
  if (a >= 60) return 'content text ≥ 16px/500 or ≥ 24px/400 — not long paragraphs';
  if (a >= 45) return 'large/heading text ≥ 24px/600 or ≥ 36px/400, icons';
  if (a >= 30) return 'non-text only: placeholder, disabled, large icons, borders that matter';
  if (a >= 15) return 'decorative only: dividers, subtle fills';
  return 'invisible to many users — not usable for information';
}

export function wcagVerdict(ratio) {
  return {
    'AA normal (4.5)': ratio >= 4.5,
    'AA large / UI (3.0)': ratio >= 3,
    'AAA normal (7.0)': ratio >= 7,
    'AAA large (4.5)': ratio >= 4.5,
  };
}

export { clamp, round };
