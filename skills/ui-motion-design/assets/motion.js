// motion.js — tiny, dependency-free motion helpers (ui-motion-design skill).
// Classic script → window.motion. In bundlers: import './motion.js' and use window.motion,
// or copy the functions you need.
// Every helper respects prefers-reduced-motion.

(function (root) {
  const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const reduced = () => mq.matches;
  const css = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const ms = (v) => (typeof v === 'number' ? v : parseFloat(v) * (String(v).includes('ms') ? 1 : 1000));

  /** Run a DOM update inside a View Transition when supported; otherwise just run it. */
  function viewTransition(update, { types } = {}) {
    if (!document.startViewTransition || reduced()) { update(); return Promise.resolve(); }
    let vt;
    try { vt = types ? document.startViewTransition({ update, types }) : document.startViewTransition(update); }
    catch { vt = document.startViewTransition(update); } // older engines: no options object
    return vt.finished;
  }

  /** FLIP: measure → mutate DOM → animate from old to new positions (list reorder, filter, add/remove). */
  function flip(elements, mutate, { duration, easing } = {}) {
    const els = [...elements];
    const before = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    if (reduced()) return;
    const d = ms(duration ?? css('--spring-smooth-duration', '700ms'));
    const e = easing ?? css('--spring-smooth', 'cubic-bezier(0.2, 0, 0, 1)');
    for (const el of els) {
      if (!el.isConnected) continue;
      const a = before.get(el), b = el.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top, sx = a.width / (b.width || 1), sy = a.height / (b.height || 1);
      if (!dx && !dy && sx === 1 && sy === 1) continue;
      el.animate(
        [{ transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: 'top left', transform: 'none' }],
        { duration: d, easing: e },
      );
    }
  }

  /** Animate an element in (fade + small rise). Returns the Animation. */
  function enter(el, { y = 8, duration, easing, delay = 0 } = {}) {
    return el.animate(
      [{ opacity: 0, transform: `translateY(${reduced() ? 0 : y}px)` }, { opacity: 1, transform: 'none' }],
      { duration: ms(duration ?? css('--duration-moderate', '300ms')), easing: easing ?? css('--ease-out', 'ease-out'), delay, fill: 'backwards' },
    );
  }

  /** Animate an element out, then remove it (or hide it with keep: true). */
  async function exit(el, { y = 4, duration, easing, keep = false } = {}) {
    const anim = el.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${reduced() ? 0 : y}px)` }],
      { duration: ms(duration ?? css('--duration-base', '200ms')), easing: easing ?? css('--ease-out', 'ease-out'), fill: 'forwards' },
    );
    await anim.finished.catch(() => {});
    if (keep) { el.hidden = true; anim.cancel(); } else el.remove();
  }

  /** Stagger children in. Total spread is capped so long lists don't drag. */
  function stagger(children, { step = 40, max = 400, ...opts } = {}) {
    const list = [...children];
    const s = Math.min(step, max / Math.max(1, list.length - 1));
    return list.map((el, i) => enter(el, { ...opts, delay: reduced() ? 0 : i * s }));
  }

  /** Count a number up (KPIs). Formats with Intl in the page language. */
  function countUp(el, to, { from = 0, duration = 900, format = new Intl.NumberFormat(document.documentElement.lang || 'de-DE') } = {}) {
    if (reduced()) { el.textContent = format.format(to); return; }
    const t0 = performance.now();
    const ease = (t) => 1 - (1 - t) ** 4;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      el.textContent = format.format(Math.round(from + (to - from) * ease(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** Reveal elements when they scroll into view (fallback for browsers without animation-timeline). */
  function revealOnScroll(selector = '[data-reveal]', { threshold = 0.15, ...opts } = {}) {
    const els = document.querySelectorAll(selector);
    if (reduced() || !('IntersectionObserver' in window)) return;
    els.forEach((el) => { el.style.opacity = '0'; });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.style.opacity = ''; enter(e.target, opts); io.unobserve(e.target); }
    }, { threshold });
    els.forEach((el) => io.observe(el));
  }

  const api = { reduced, viewTransition, flip, enter, exit, stagger, countUp, revealOnScroll };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.motion = api;
})(typeof window !== 'undefined' ? window : globalThis);
