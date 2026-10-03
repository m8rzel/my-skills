# Signature effects: recipes for "wow" moments

High-impact effects from top product sites and award-winning studios, written so you can rebuild them in client projects. Each recipe lists **when it's worth it**, the **cost**, and the **a11y/performance guardrails**. Where it exists, a vanilla version is live in `examples/signature-effects.html`.

**Ground rules for any signature effect:**

1. **One signature per page.** One idea executed obsessively (a helmet, a planet, a gradient) beats ten effects. Everything else stays calm and follows `motion-principles.md`.
2. **Content stays in the DOM.** Headlines, links and prices are real HTML. Canvas/WebGL is a layer on top, never the only carrier of information.
3. **Placeholder first, effect second.** Render a static image, poster or gradient instantly, then crossfade the effect in. The canvas must never be the LCP element.
4. **Reduced motion = still image or simple fade.** No scrub, no parallax, no follower, no auto-scroll.
5. **Budget:**
   - 60 fps on a mid-range phone.
   - DPR capped at 2 (1.5 on mobile for full-screen WebGL).
   - Pause off-screen.
   - Lazy-load heavy runtimes (three, Rive, Lottie) after first paint.

## Stack choice (state: October 2026)

| Need | Use | Notes |
|---|---|---|
| UI motion in React/Next | **Motion** (`npm i motion`, `import { motion } from "motion/react"`) | Framer Motion became independent "Motion" in Nov 2024. Springs, layout/`layoutId`, `AnimatePresence`, `useScroll`/`useTransform` |
| UI motion in Expo / React Native | **Reanimated** (+ Gesture Handler) | `withSpring`, `entering`/`exiting` layout animations, `ReduceMotion.System` |
| Timelines, scroll storytelling, text splitting | **GSAP** + ScrollTrigger + SplitText | **Free incl. all former Club plugins since 3.13 (Apr 2025)**, commercial use OK. Its own "standard license", not OSI open source; it forbids use inside no-code builders that compete with Webflow |
| Smooth scroll | **Lenis** (`lenis`, darkroom.engineering, MIT) | Keeps native scroll (sticky, anchors, a11y work). `respectReducedMotion` on by default. `@studio-freight/lenis` is deprecated |
| Page transitions | **View Transitions API** first; Barba / Taxi.js when a canvas/audio must persist | Same-document VT: Chrome 111+, Safari 18+, Firefox 144+. Cross-document `@view-transition`: Chrome 126+, Safari 18.2+, Firefox partial/unclear (check caniuse) |
| Scroll-linked without JS | **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) | Chrome/Edge 115+, Safari 26+, Firefox behind preview. Progressive enhancement only |
| 3D / shaders | **three.js** (r18x; WebGPURenderer with WebGL fallback), **React Three Fiber** + drei, or **OGL** for tiny bundles | Bake light, KTX2 textures, DRACO/meshopt meshes |
| Designer-made interactive illustration | **Rive** (state machines) / **Lottie** (linear playback) | Lazy-load the runtime, pause off-screen |

Version numbers move. Before pinning, check with `npm view <pkg> version`.

---

## Ambient mesh gradient

*Stripe-style.*

- **Worth it:** SaaS/fintech heroes, auth screens, pricing headers.
- **Cost:** a few KB of JS, one draw call.

**Technique**
- A full-size `<canvas>` behind the hero.
- One fullscreen triangle or plane.
- The fragment shader mixes 3–4 brand colours with layered noise that drifts slowly with time.
- Colours come from CSS variables (read once, re-read on theme change).
- Stripe displaces a plane in the **vertex** shader; a fragment-only version is simpler and looks similar.

```js
const css = getComputedStyle(document.documentElement);
const colors = ['--brand-300','--brand-500','--accent','--brand-700'].map(v => toRGB(css.getPropertyValue(v)));
// fragment: uv-warped by two noise octaves, then palette mix
// gl_FragColor = vec4(mix(mix(c1,c2,n1), mix(c3,c4,n2), smoothstep(.2,.8,uv.y+n3*.3)), 1.);
```

**Guardrails**
- `IntersectionObserver` → stop the rAF loop when off-screen. Stop it on `visibilitychange` too.
- DPR ≤ 1.5 is enough, because the gradient is blurry anyway. Antialiasing off.
- Reduced motion: render one frame and stop.
- No WebGL: the CSS `background` (a radial-gradient stack in the same colours) stays visible.

Full vanilla shader: `examples/signature-effects.html`.

## Cursor glow cards / spotlight borders

*Linear / Vercel style.*

- **Worth it:** feature grids, pricing cards on dark themes.
- **Cost:** tiny.

```css
.glow { position: relative; border-radius: 16px; background: var(--card); }
.glow::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
  background: radial-gradient(400px circle at var(--x) var(--y), color-mix(in oklch, var(--primary), white 30%), transparent 40%);
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); opacity: 0; transition: opacity var(--duration-base); }
.grid:hover .glow::before { opacity: 1; }
```

```js
grid.addEventListener('pointermove', e => grid.querySelectorAll('.glow').forEach(c => {
  const r = c.getBoundingClientRect(); c.style.setProperty('--x', e.clientX - r.left + 'px'); c.style.setProperty('--y', e.clientY - r.top + 'px'); }));
```

**Guardrails**
- Only under `(hover: hover) and (pointer: fine)`.
- Update inside rAF if there are many cards.

## Split-text headline reveal

- **Worth it:** hero headlines, section titles on marketing and portfolio sites.
- **Not for:** body text or app UI.

GSAP version (SplitText is free; it handles `aria-label`/`aria-hidden` and re-splits on resize and font load):

```js
SplitText.create('.headline', { type: 'lines,words', mask: 'lines', autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, { yPercent: 110, stagger: 0.08, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: self.elements[0], start: 'top 80%' } }) });
```

CSS-only version: wrap each line or word in `<span class="line"><span>…</span></span>`, mark the copies `aria-hidden` and put the full text in `aria-label`, then:

```css
.line { display: block; overflow: clip; }
.line > span { display: inline-block; animation: rise .9s var(--ease-out) both; animation-delay: calc(var(--i) * 80ms); }
@keyframes rise { from { translate: 0 110%; } }
```

**Guardrails**
- Wait for `document.fonts.ready` before splitting. Otherwise the lines re-flow, causing CLS and wrong breaks.
- Stagger cap ~400 ms total.
- Reduced motion: plain opacity fade.

## Clip-path / mask image reveal

- **Worth it:** portfolio images, case-study covers.

```css
.reveal { clip-path: inset(100% 0 0 0); animation: unclip 1.2s var(--ease-emphasized) forwards; }
.reveal img { scale: 1.3; animation: settle 1.6s var(--ease-out) forwards; }
@keyframes unclip { to { clip-path: inset(0 0 0 0); } }  @keyframes settle { to { scale: 1; } }
/* scroll-linked: animation-timeline: view(); animation-range: entry 10% cover 40%; */
```

The inner counter-scale (1.3 → 1) gives a "window" parallax for free.

## Sticky "zoom into product" section

*Apple / Vercel style.*

- **Worth it:** product launches, feature deep-dives.

**Structure**
- A tall wrapper, e.g. `height: 300vh`.
- Inside it, a `position: sticky; top: 0; height: 100vh` stage.
- Scale or translate the media by section progress.

CSS-only:

```css
.zoom-wrap { height: 300vh; view-timeline: --zoom block; }
.zoom-stage { position: sticky; top: 0; height: 100svh; display: grid; place-items: center; overflow: clip; }
.zoom-media { animation: zoom linear both; animation-timeline: --zoom; animation-range: contain 0% contain 100%; }
@keyframes zoom { from { scale: .6; border-radius: 32px; } to { scale: 1; border-radius: 0; } }
```

Motion for React:

```tsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
return <section ref={ref} style={{ height: '300vh' }}><div className="sticky top-0 h-svh grid place-items-center"><motion.img style={{ scale }} /></div></section>;
```

**Guardrails**
- Text that appears during the scrub must also make sense without it.
- Reduced motion: final state, normal height.

## Pinned horizontal scroll

- **Worth it:** timelines, process steps, case-study galleries.
- **Not for:** primary navigation or forms.

GSAP:

```js
const track = document.querySelector('.track');
const tween = gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
  scrollTrigger: { trigger: '.h-section', pin: true, scrub: 1, end: () => '+=' + (track.scrollWidth - innerWidth), invalidateOnRefresh: true } });
gsap.from('.card', { opacity: 0, y: 40, stagger: .1, scrollTrigger: { trigger: '.card', containerAnimation: tween, start: 'left 80%' } });
```

GSAP rules:
- `ease: 'none'` on the container tween.
- Animate children, never the pinned element.

CSS-only: a tall wrapper with a sticky viewport, and `translate: calc(-100% + 100vw)` on the track driven by `view-timeline`. See the demo.

**Guardrails**
- On mobile (< 768 px) turn it into a native horizontal `overflow-x: auto` scroller with `scroll-snap`, or a vertical stack.
- Keyboard users must reach every card. Real focusable links, and the section scrolls when focus moves into it.

## Smooth scroll (Lenis) on one clock

```js
const lenis = new Lenis();                         // native scroll underneath
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// render WebGL from the same gsap.ticker → one loop for everything
```

- **Worth it:** portfolio and brand sites with lots of scroll-linked motion.
- **Not for:** app UIs, docs, long reading pages.

Gotchas:
- Nested scrollers need `data-lenis-prevent`.
- No CSS scroll-snap; use `lenis/snap`.
- Safari is capped at 60 fps.

**Never** hijack the wheel into "slides".

## Infinite marquee

```css
.marquee { overflow: clip; mask: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
.marquee__track { display: flex; gap: 48px; width: max-content; animation: marquee 30s linear infinite; }
.marquee:hover .marquee__track, .marquee.paused .marquee__track { animation-play-state: paused; }
@keyframes marquee { to { translate: -50% 0; } }
```

- Content is duplicated once; mark the duplicate `aria-hidden="true"`.
- **Needs a visible pause button** (WCAG 2.2.2: moving > 5 s).
- Reduced motion: static, wrapping row.
- Scroll-velocity coupling: set `animation-duration` or GSAP `timeScale` from scroll velocity.

## Magnetic button

```js
const xTo = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1, .3)' }), yTo = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1, .3)' });
btn.addEventListener('pointermove', e => { const r = btn.getBoundingClientRect(); xTo((e.clientX - r.left - r.width/2) * .35); yTo((e.clientY - r.top - r.height/2) * .35); });
btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
```

- Fine pointer only. Pull ≤ 35 % of the offset.
- The hit area must not move away from the cursor: move an inner span, not the button box.

## Custom cursor

- A fixed `pointer-events: none` dot that follows with lerp (`quickTo` or rAF lerp 0.15–0.2).
- It grows over `[data-cursor]` targets; optional `mix-blend-mode: difference`.
- **Never hide the native cursor** on touch, for keyboard users, or over text inputs. `:focus-visible` styles stay.
- Reduced motion: no follower.

## Scroll-velocity skew

```js
const skewTo = gsap.quickTo('.skew', 'skewY', { duration: .4, ease: 'power3' });
lenis.on('scroll', ({ velocity }) => skewTo(gsap.utils.clamp(-6, 6, velocity * .3)));
```

- Vanilla: track `scrollY` delta per frame, lerp it, and set a CSS variable.
- Subtle (max 4–6°), and only on images and big type, never on text people read.
- Reduced motion: off.

## Text scramble / decode

- Characters cycle through random glyphs before settling. Good for tech and crypto brands, and for numbers in hero stats.
- GSAP ScrambleTextPlugin (free), or ~20 lines of vanilla (see the demo).
- Keep the final text in `aria-label`, and set `aria-hidden` on the animating node.
- Use a monospaced or tabular font, or fixed width, to avoid layout jitter.

## Image hover distortion (WebGL)

**Technique**
- A plane per image, with the texture from the `<img>`.
- The fragment shader offsets the UVs by a displacement map × `progress`, and GSAP tweens `progress` on hover.
- Planes are synced to the `<img>` rect each frame.
- The real `<img>` stays in the DOM (SEO, a11y) and is hidden visually once the canvas is ready.

```glsl
vec4 d = texture2D(disp, vUv);
gl_FragColor = mix(texture2D(t1, vUv + d.r*intensity*progress), texture2D(t2, vUv - d.r*intensity*(1.-progress)), progress);
```

**Guardrails**
- One shared canvas for all images, not a canvas per image.
- Fine pointer only.
- Reduced motion: crossfade.

## Scroll-scrubbed image sequence

*Apple style.*

- **Worth it:** a hardware or product rotation, an exploded view.
- **Cost:** high (bytes).

```js
const frames = []; const n = 120; let cur = -1;
// preload in idle batches; decode before use
for (let i = 0; i < n; i++) { const img = new Image(); img.src = `/seq/${String(i).padStart(4,'0')}.webp`; frames.push(img); }
ScrollTrigger.create({ trigger: '.seq', start: 'top top', end: '+=300%', pin: true, scrub: true,
  onUpdate: ({ progress }) => { const i = Math.round(progress * (n - 1)); if (i !== cur && frames[i].complete) { cur = i; ctx.drawImage(frames[i], 0, 0, w, h); } } });
```

**Guardrails**
- WebP/AVIF, 1–1.5× DPR, ~60–150 frames.
- Load every 4th frame first, then fill in. This is Apple's keyframe-first idea.
- Consider a scrubbed `<video>` (all-keyframe encode) as an alternative.
- Reduced motion or Save-Data: show the poster frame only.

## Page transitions

- **SPA / same document:**
  - Call `document.startViewTransition(() => update())`.
  - Shared elements get `view-transition-name`.
  - In React, wrap the router navigation (Next.js has experimental `viewTransition` support).
- **MPA / cross document:**
  - Add `@view-transition { navigation: auto; }` on both pages.
  - Name the shared elements on both pages.
  - Customise with `::view-transition-old/new(name)`.
- **Persistent canvas or audio across pages:**
  - Use Barba.js or Taxi.js (PJAX), or the framework router with a layout-level canvas.
  - Leave → overlay wipe → swap → reveal.
  - Kill and re-create ScrollTriggers; reset Lenis (`lenis.scrollTo(0, { immediate: true })`).
- **Always:**
  - Move focus to the new page's `<h1>` or `main`.
  - Update `document.title`.
  - Reduced motion: crossfade ≤ 200 ms.

## 3D scroll scenes

*React Three Fiber.*

```jsx
<Canvas dpr={[1, 2]}>
  <ScrollControls pages={4} damping={0.2}><Scene /><Scroll html><Overlay /></Scroll></ScrollControls>
</Canvas>
// Scene: const s = useScroll(); useFrame(() => { ref.current.rotation.y = s.offset * Math.PI * 2 })
```

- `ScrollControls` owns its own scroll container. For long, SEO-relevant pages, prefer **native scroll + Lenis + a fixed canvas** reading `lenis.progress`, as Igloo and Trionn do.
- Performance:
  - `frameloop="demand"` + `invalidate()` for scenes that are mostly static.
  - drei `<PerformanceMonitor>` to adapt DPR.
  - Instancing; < ~1000 draw calls.
  - Bake lighting; KTX2 textures; DRACO/meshopt geometry.
  - Pre-compile with `renderer.compileAsync`.
- Fallback chain: WebGPU → WebGL2 → poster image. Quality tiers by measured fps (GitHub globe).

## Designer-made illustration (Rive / Lottie)

- **Rive** for interactive, state-driven pieces: hover states, toggles, characters reacting to input.
- **Lottie** for linear playback: success ticks, onboarding loops.
- Scrub Lottie with scroll or gesture progress via `goToAndStop(progress * totalFrames, true)`.
- Lazy-load the runtime and pause off-screen.
- Reduced motion: final frame.

## Product rendered in CSS (no 3D runtime)

*Learned building `examples/product-launch.html`.*

- **Worth it:** hardware launches and concepts before real photos exist. Simple objects work: pucks, cards, phones, speakers.
- **Cost:** ~2 KB CSS, zero JS, no LCP risk.

**Technique:** stack `div`s, each in an `aspect-ratio: 1` box:

| Layer | How |
|---|---|
| glow | radial gradient |
| body | fabric = tiny dot `radial-gradient` tile + a big highlight gradient + inset shadows |
| LED ring | `conic-gradient` masked to a thin annulus |
| cap | darker disc with an inner highlight |
| details | mic holes, logo |

**States:** a `data-state` attribute (`idle | listen | think | speak`) swaps the ring gradient and its animation. Spin `--a` through `@property --a { syntax: "<angle>" }` so the conic angle animates smoothly.

```css
.ring { inset: 22%; border-radius: 50%; background: conic-gradient(from var(--a), var(--ember), color-mix(in oklab, var(--ember) 20%, var(--ring-off)) 40%, var(--ember));
        mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px)); animation: spin 2.4s linear infinite; }
@property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes spin { to { --a: 360deg; } }
```

**Guardrails**
- Under reduced motion, keep the state colours and drop the spin.
- `aria-hidden` on the object; describe the product in text.

## State-driven pinned story

- A sticky visual on the left, 3–5 steps on the right.
- An `IntersectionObserver` with `rootMargin: '-45% 0px -45% 0px'` marks the step crossing the middle of the viewport. That step writes `data-state` onto the visual.
- Works in every browser, needs no scroll-jacking, and every step is readable without the effect.
- Block: `blocks/story-pinned.html`.

**Don't dim inactive steps with opacity**: it fails contrast (the audit catches it). Mark the active step with a coloured border and a full-contrast heading instead.

## Gotcha: mixing colours across hues

`color-mix(in oklch, amber, blue-grey)` interpolates the **hue** and passes through red or purple. When mixing a brand colour toward a neutral or a different-hue surface, use `in oklab`.
