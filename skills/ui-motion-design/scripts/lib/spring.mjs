// Damped-spring physics → CSS linear() easing, duration and framework configs.
// Mass m, stiffness k, damping c; animates 0 → 1 with initial velocity v0 (units/s).

/** Motion (motion.dev) "visualDuration + bounce" → physical params (mass 1). */
export function fromVisualDuration(visualDuration, bounce = 0) {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  const stiffness = root * root;
  const damping = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness);
  return { stiffness, damping, mass: 1 };
}

/** SwiftUI-style response (period, s) + dampingFraction → physical params (mass 1). */
export function fromResponse(response, dampingFraction = 1) {
  const stiffness = ((2 * Math.PI) / response) ** 2;
  const damping = (4 * Math.PI * dampingFraction) / response;
  return { stiffness, damping, mass: 1 };
}

export function springFn({ stiffness = 100, damping = 10, mass = 1, velocity = 0 } = {}) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const e0 = -1, v0 = velocity;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const B = (v0 + zeta * w0 * e0) / wd;
    return (t) => 1 + Math.exp(-zeta * w0 * t) * (e0 * Math.cos(wd * t) + B * Math.sin(wd * t));
  }
  if (zeta === 1) {
    return (t) => 1 + Math.exp(-w0 * t) * (e0 + (v0 + w0 * e0) * t);
  }
  const s = Math.sqrt(zeta * zeta - 1);
  const r1 = -w0 * (zeta - s), r2 = -w0 * (zeta + s);
  const C2 = (v0 - r1 * e0) / (r2 - r1), C1 = e0 - C2;
  return (t) => 1 + C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
}

/** Time (s) after which |x - 1| stays below restDelta. */
export function settleTime(params, restDelta = 0.001, maxT = 10) {
  const f = springFn(params);
  const dt = 1 / 1000;
  let last = 0;
  for (let t = 0; t <= maxT; t += dt) if (Math.abs(f(t) - 1) > restDelta) last = t;
  return Math.min(maxT, last + dt);
}

// Ramer–Douglas–Peucker on [x, y] points.
function simplify(points, tol) {
  if (points.length < 3) return points;
  const [x1, y1] = points[0], [x2, y2] = points[points.length - 1];
  let maxD = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    // vertical distance to chord — the error that matters for an easing curve
    const yl = y1 + ((y2 - y1) * (x - x1)) / (x2 - x1 || 1);
    const d = Math.abs(y - yl);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [points[0], points[points.length - 1]];
  return [...simplify(points.slice(0, idx + 1), tol).slice(0, -1), ...simplify(points.slice(idx), tol)];
}

const r = (v, d) => Number(v.toFixed(d)).toString();

/** Build a CSS linear() easing for the spring. Returns { easing, duration (ms), points, overshoot }. */
export function springToLinear(params, { tolerance = 0.0015, samples = 400, restDelta = 0.001 } = {}) {
  const duration = settleTime(params, restDelta);
  const f = springFn(params);
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const p = i / samples;
    pts.push([p, i === samples ? 1 : f(p * duration)]);
  }
  const simple = simplify(pts, tolerance);
  const stops = simple.map(([x, y], i) =>
    i === 0 ? r(y, 4) : i === simple.length - 1 ? '1' : `${r(y, 4)} ${r(x * 100, 2)}%`);
  const overshoot = Math.max(...pts.map(([, y]) => y)) - 1;
  const svgPath = 'M' + simple.map(([x, y]) => `${r(x, 4)},${r(y, 4)}`).join(' L');
  return { easing: `linear(${stops.join(', ')})`, duration: Math.round(duration * 1000), points: simple.length, overshoot: Math.max(0, overshoot), svgPath };
}

/** Sample a cubic-bezier easing (x1,y1,x2,y2) at progress t ∈ [0,1]. */
export function cubicBezier(x1, y1, x2, y2) {
  const bx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bx(m) < x) lo = m; else hi = m; }
    return by((lo + hi) / 2);
  };
}

/** Shared motion vocabulary used by tokens.mjs, easing.mjs and the references. */
export const EASINGS = {
  // name: [x1, y1, x2, y2, use]
  standard: [0.2, 0, 0, 1, 'default for things that move on screen (state changes, position)'],
  out: [0.16, 1, 0.3, 1, 'entering elements — fast start, soft landing (expo-out)'],
  in: [0.7, 0, 0.84, 0, 'only for things leaving the screen for good (swiped card, sheet thrown off) — feels laggy on popovers'],
  'in-out': [0.65, 0, 0.35, 1, 'element moves from A to B while staying on screen'],
  emphasized: [0.3, 0, 0, 1, 'hero moments, large surfaces, page-level transitions'],
  drawer: [0.32, 0.72, 0, 1, 'sheets/drawers that track a gesture (iOS-sheet curve, used by Vaul) — ~500ms'],
  linear: [0, 0, 1, 1, 'progress, spinners, color/opacity loops only'],
};

export const DURATIONS = {
  instant: [100, 'hover/press feedback, color & opacity on small controls'],
  fast: [150, 'tooltips, small toggles, checkbox, focus ring'],
  base: [200, 'dropdowns, popovers, buttons, tabs indicator'],
  moderate: [300, 'dialogs, sheets entering, cards expanding'],
  slow: [400, 'large surfaces, page transitions, drawers on mobile'],
  slower: [600, 'onboarding/hero choreography only — never for repeated UI'],
};

// Physical params (mass 1). Built from Motion's visualDuration/bounce model.
export const SPRINGS = {
  snappy: { ...fromVisualDuration(0.25, 0), use: 'toggles, switches, small UI, layout shifts of controls' },
  smooth: { ...fromVisualDuration(0.4, 0), use: 'default spring: panels, cards, list reorder, shared layout' },
  gentle: { ...fromVisualDuration(0.6, 0), use: 'large surfaces, page-level, scroll-linked settling' },
  bouncy: { ...fromVisualDuration(0.45, 0.25), use: 'playful confirmations, drag release, success states (sparingly)' },
  wobbly: { ...fromVisualDuration(0.6, 0.45), use: 'games/celebration only — never for productivity UI' },
};
