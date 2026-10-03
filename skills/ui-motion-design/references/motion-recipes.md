# Motion recipes for UI

This file covers production patterns for **CSS**, **Motion for React** (Next.js), and **Reanimated** (Expo / React Native). The rules behind each recipe are in `motion-principles.md`. Big marketing effects are in `signature-effects.md`.

Every snippet uses the tokens that `scripts/tokens.mjs` generates (`--duration-*`, `--ease-*`, `--spring-*`, `tokens.motion.*`). If a project has no tokens yet, `assets/motion.css` defines the CSS ones.

---

## CSS (any stack)

### Enter, exit, and display:none without JavaScript

```css
.toast { transition: opacity var(--duration-moderate) var(--ease-out), translate var(--duration-moderate) var(--ease-out),
                     display var(--duration-moderate) allow-discrete; }
.toast[hidden] { display: none; opacity: 0; translate: 0 8px; transition-duration: var(--duration-fast); }
@starting-style { .toast:not([hidden]) { opacity: 0; translate: 0 8px; } }
```

- `@starting-style` defines the "from" state when an element appears.
- `allow-discrete` lets `display` and `overlay` flip at the right moment, so the exit animation is visible.
- Supported in all current engines. Older browsers simply skip the animation.

### Native popover and dialog

`assets/motion.css` already contains `.m-popover`, `.m-dialog`, `.m-sheet` and `.m-sheet-right`. To position a popover against its trigger without JavaScript, use CSS anchor positioning (Chromium 125+, Safari 26+; elsewhere fall back to Floating UI):

```html
<button popovertarget="menu" style="anchor-name: --menu">Aktionen</button>
<div id="menu" popover class="m-popover" style="position-anchor: --menu; position-area: bottom span-right; margin-top: 6px">…</div>
```

### Height: auto

- `.m-collapse` animates `grid-template-rows` from `0fr` to `1fr`. This works everywhere.
- `interpolate-size: allow-keywords` lets you transition `height: 0 ↔ auto` directly (Chromium 129+).
- `details::details-content` animates native accordions.

### View transitions (same page)

```js
document.startViewTransition(() => updateTheDom());   // or motion.viewTransition(fn) from assets/motion.js
```
```css
.tab[aria-selected="true"] { view-transition-name: tab-pill; }
::view-transition-group(tab-pill) { animation-duration: var(--duration-moderate); animation-timing-function: var(--ease-out); }
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--duration-base); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }
```

- Every `view-transition-name` must be unique on the page.
- For lists, use `view-transition-name: match-element` (Chromium 137+), or set a unique name per item, such as `--item-<id>`.

### View transitions (between pages, MPA)

```css
@view-transition { navigation: auto; }              /* on both pages */
.product-hero { view-transition-name: product-42; } /* same name on list card and detail page */
```

### Scroll-driven (no JavaScript)

```css
@supports (animation-timeline: view()) {
  .reveal { animation: m-up linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
  .progress { animation: grow linear; animation-timeline: scroll(root); transform-origin: left; }
}
@keyframes grow { from { scale: 0 1; } }
```

- Always wrap these in `@supports`. Without support, the content must look finished.
- Use `linear` easing for scrubbed animations; the scroll position is already the easing.

### Tailwind v4 and shadcn

- Import the generated `tailwind.tokens.css`. That gives you utilities such as `ease-out`, `ease-spring-smooth`, `duration-(--duration-base)` and `shadow-md`.
- shadcn components animate through `tw-animate-css` (`data-[state=open]:animate-in fade-in-0 zoom-in-95`).
- Keep those animations short and origin-aware. Popovers already use `origin-(--radix-popover-content-transform-origin)`.
- Don't add `transition-all`. Write `transition-[opacity,transform]`.

---

## Motion for React (Next.js)

Install with `npm i motion` and import from `motion/react`. Any component that uses Motion needs `"use client"`.

### Global defaults and reduced motion

```tsx
"use client";
import { MotionConfig } from "motion/react";
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ type: "spring", visualDuration: 0.4, bounce: 0 }}>{children}</MotionConfig>;
}
```

`reducedMotion="user"` turns off transform and layout animations for people who ask for reduced motion. Opacity and colour animations still run.

### Press, hover, enter

```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>Speichern</motion.button>
<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
```

### Presence: enter and exit, with a shorter exit

```tsx
<AnimatePresence initial={false} mode="popLayout">
  {toasts.map(t => (
    <motion.li key={t.id} layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", visualDuration: 0.35, bounce: 0 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }} />
  ))}
</AnimatePresence>
```

### Shared element: tab indicator or card → detail

```tsx
{tabs.map(tab => (
  <button key={tab.id} onClick={() => setActive(tab.id)} className="relative px-3 py-1.5">
    {active === tab.id && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-md bg-background shadow-sm" transition={{ type: "spring", visualDuration: 0.3, bounce: 0 }} />}
    <span className="relative">{tab.label}</span>
  </button>
))}
```

- Use `layoutId` for one element moving between places.
- Use `layout` when an element's own size or position changes, such as list reorder, accordion, or filter.
- Wrap siblings that affect each other in `<LayoutGroup>`.

### Stagger (capped)

```tsx
const list = { show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } };
<motion.ul variants={list} initial="hidden" animate="show">{rows.slice(0, 10).map(r => <motion.li key={r.id} variants={item} />)}</motion.ul>
```

Stagger only the first screenful. Rows further down appear without delay.

### Scroll-linked

```tsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
const smooth = useSpring(y, { stiffness: 170, damping: 26 });   // optional smoothing
<motion.img ref={ref} style={{ y: smooth }} />
```

Motion uses the native `ScrollTimeline` when it can, so the animation runs off the main thread.

### Numbers

Animate numbers with `animate(from, to, { onUpdate })` from `motion`, or with `motion.countUp` from `assets/motion.js`. Use `tabular-nums` so the width stays stable while the digits change.

### Vanilla Motion (no React)

```js
import { animate, scroll, stagger, inView } from "motion";
animate(".card", { opacity: [0, 1], y: [8, 0] }, { delay: stagger(0.04), duration: 0.3 });
inView(".section", (el) => { animate(el, { opacity: 1 }); });
scroll(animate(".progress", { scaleX: [0, 1] }));
```

---

## Reanimated (Expo / React Native)

These snippets use `react-native-reanimated` and `react-native-gesture-handler`. Get the tokens from the `tokens.ts` file that `scripts/tokens.mjs` generates.

### Press feedback plus haptic on commit

```tsx
const scale = useSharedValue(1);
const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
<Pressable onPressIn={() => (scale.value = withSpring(0.97, tokens.motion.spring.snappy))}
           onPressOut={() => (scale.value = withSpring(1, tokens.motion.spring.snappy))}
           onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); save(); }}>
  <Animated.View style={style}>…</Animated.View>
</Pressable>
```

### Layout animations: enter, exit, reorder

```tsx
import Animated, { FadeInDown, FadeOut, LinearTransition, ReduceMotion } from "react-native-reanimated";
<Animated.View
  entering={FadeInDown.springify().damping(26).stiffness(171).reduceMotion(ReduceMotion.System)}
  exiting={FadeOut.duration(150)}
  layout={LinearTransition.springify().damping(26).stiffness(171)} />
```

### Timing with token curves

```tsx
opacity.value = withTiming(1, { duration: tokens.motion.duration.moderate, easing: Easing.bezier(...tokens.motion.easing.out) });
```

### Bottom sheet that follows the finger, snaps by velocity, and is damped past the edge

```tsx
const y = useSharedValue(CLOSED);
const pan = Gesture.Pan()
  .onChange((e) => { const next = y.value + e.changeY; y.value = next < OPEN ? OPEN + (next - OPEN) * 0.3 : next; })  // damped overdrag
  .onEnd((e) => {
    const projected = y.value + e.velocityY * 0.2;                 // where it *would* stop
    const target = projected > (OPEN + CLOSED) / 2 ? CLOSED : OPEN;
    y.value = withSpring(target, { ...tokens.motion.spring.smooth, velocity: e.velocityY });
    if (target === CLOSED) runOnJS(onClose)();
  });
```

- Track the finger 1:1.
- Commit on release.
- Pass the release velocity into the spring.
- Always keep a close button as the non-gesture alternative.

### Reduced motion

- `useReducedMotion()` returns the system setting.
- Builders take `.reduceMotion(ReduceMotion.System)`.
- `withSpring` and `withTiming` accept `{ reduceMotion: ReduceMotion.System }`.
- With reduced motion on, prefer fades over slides.

### Reanimated 4

Reanimated 4 adds CSS-style `animationName` / `transitionProperty` props on `Animated.View`. Use them for simple state transitions, and keep worklets and springs for gestures.

---

## Common UI patterns: spec sheet

| Pattern | Motion | Duration / curve | Notes |
|---|---|---|---|
| Button press | scale 0.97 | 100 ms standard | no hover animation on touch |
| Toggle / switch | knob translate | spring snappy | colour 150 ms |
| Checkbox | tick path draw | 150 ms ease-out | instant if toggled via keyboard |
| Tooltip | fade + 2–4 px shift toward the anchor | 150 ms ease-out, delay 150–300 ms | neighbours appear instantly |
| Dropdown / popover | fade + scale 0.96 → 1 from the anchor | 200 ms ease-out, exit 150 ms | `transform-origin` = trigger side |
| Dialog | fade + scale 0.96 → 1, backdrop fade | 300 ms ease-out, exit 200 ms | focus moves in and is restored on close |
| Sheet / drawer | translate from its edge | 450–500 ms `--ease-drawer`, exit 200–300 ms | drag with velocity snap |
| Toast | slide 16 px + fade from the stack edge | spring smooth, exit 150 ms | pause the timer on hover and when the tab is hidden; swipe to dismiss |
| Tabs | indicator `layoutId` / view transition | spring snappy | content swaps instantly or crossfades in 150 ms |
| Accordion | grid rows 0fr → 1fr | 300 ms standard | chevron rotates 180° in the same duration |
| List add / remove / reorder | FLIP / `layout` | spring smooth | removed items collapse their height |
| Skeleton → content | crossfade | 200 ms | skeleton matches the final layout exactly |
| Page transition (app) | crossfade + 8 px shift | 200–300 ms | no slide for top-level tab switches |
| Number change | count or digit roll | 400–900 ms ease-out | tabular numbers |
| Error on submit | one horizontal shake (3 cycles, 4–6 px) | 300 ms | plus message text; under reduced motion, no shake |
| Success | tick draw + optional bounce | spring bouncy (rare) | haptic on mobile |
