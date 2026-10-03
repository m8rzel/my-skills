# Motion principles

How to decide **whether** something moves, **how long**, **on which curve**, and how to keep it fast and accessible. Sources are listed at the end; studio and product examples are in `showcase-teardowns.md`.

## 1. Decide whether to animate at all

Every animation needs a job. If you can't name one, leave it out.

| Job | Example | Animate? |
|---|---|---|
| **Feedback**: "I heard you" | button press scale, toggle knob, inline save tick | yes, 100–150 ms |
| **Orientation**: where something came from or went | popover grows from its trigger, sheet slides from the edge it docks to, item moves to new list slot | yes, 150–300 ms |
| **Continuity**: same object, new state | tab pill morphs, card expands into detail (shared element), FLIP reorder | yes, spring or 250–400 ms |
| **Status**: something is happening | skeleton, progress, spinner after > 300 ms | yes, linear/looping |
| **Attention**: something needs you | validation shake (once), badge pop | sparingly |
| **Delight / brand**: rare moments | onboarding, empty-state illustration, success after payment, marketing hero | yes, but only where the moment is rare |

**Frequency rule (Rauno Freiberg, Emil Kowalski):** the more often an action happens, the less it should animate. Things people do hundreds of times a day (command menu, keyboard shortcuts, list navigation, tab switching in a productivity app) appear **instantly**. Raycast doesn't animate opening its main window. **Keyboard-initiated actions should not animate.**

**Never animate:**

- the content someone is about to read (no fade-in on every paragraph of an article)
- text that changes while the user is typing
- layout around a focused input
- anything that delays the answer to a click by more than ~100 ms before it starts

## 2. Duration

| Token | ms | Use |
|---|---|---|
| `instant` | 100 | hover/press feedback, colour and opacity on small controls |
| `fast` | 150 | tooltips, checkbox, switch, focus ring, **exits of small surfaces** |
| `base` | 200 | dropdowns, popovers, select, tabs indicator, small cards |
| `moderate` | 300 | dialogs, toasts, expanding cards, accordions |
| `slow` | 400 | large surfaces, page transitions, mobile drawers |
| `slower` | 600 | hero/onboarding choreography only |

Rules:

- **UI motion stays under ~300 ms.** A 180 ms dropdown feels faster than a 400 ms one, even though both "work" (Emil Kowalski).
- **Bigger distance or bigger surface means longer duration.** A tooltip moves 4 px and gets 150 ms; a full-height sheet gets 400–500 ms.
- **Exits are shorter than enters** (≈ 60–75 %). The user already decided; get out of the way. This is Material Design guidance and common practice.
- **Scale with travel distance, not device.** Material's guidance: large screens/tablets ≈ 30 % longer, wearables ≈ 30 % shorter, because the element travels further or less.
- Decorative or illustrative sequences on marketing pages: individual moves usually < 500 ms (Stripe's Connect page); the *sequence* can be longer.
- **Stagger**: 30–50 ms per item, with a total cap of ~400 ms. Never stagger 30 rows one by one.
- **Tooltips**: show after ~150–300 ms delay, then keep them visible for at least ~300–500 ms to avoid flicker. Once one is open, neighbours open **instantly without animation** (Vercel guidelines, Emil).
- **Spinners**: don't show for waits under ~300 ms; show a skeleton when the layout is known.

## 3. Easing

| Situation | Curve | Token |
|---|---|---|
| Something **enters** or appears | strong ease-out: fast start, soft landing | `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` |
| Something **exits** (popover, dialog, toast) | same ease-out, shorter | `--ease-out` with `fast`/`base` |
| Something **leaves the screen for good** (card swiped away) | ease-in, accelerating away | `--ease-in` |
| Something **moves** from A to B while visible | ease-in-out | `--ease-in-out`, or `--ease-standard` |
| State change on screen (size, position) | standard | `--ease-standard` `cubic-bezier(0.2, 0, 0, 1)` |
| Sheet or drawer that follows a gesture | iOS-sheet curve, ~450–500 ms | `--ease-drawer` `cubic-bezier(0.32, 0.72, 0, 1)` |
| Colour or background hover | `ease` or linear, 100–150 ms | `--duration-instant` |
| Progress, spinners, marquees | linear | `--ease-linear` |
| Hero/page-level choreography | emphasized | `--ease-emphasized` |

- The browser keywords (`ease-out`, `ease-in-out`) are too weak. Use the custom curves above (Emil).
- **Never ease-in on small UI that appears or disappears.** It feels laggy, because the first frames barely move.
- **`linear` only** for things that run continuously (progress, rotation, marquee, scroll-scrubbed timelines).

## 4. Springs

Springs are the default for anything **interruptible** or **gesture-driven**: drag, swipe-to-dismiss, layout changes, shared elements, toggles. A spring keeps its velocity when retargeted, while a bezier restarts from zero.

- **Start critically damped (no bounce).** Add bounce only when the gesture itself carried momentum, such as a flick or a drag release (Apple, WWDC18 *Designing Fluid Interfaces*).
- Think in **visual duration + bounce** (Motion) or **response + damping fraction** (SwiftUI). Ignore raw stiffness/damping until you need them. `scripts/easing.mjs spring` converts between all forms.
- Presets (from `scripts/lib/spring.mjs`):

| Name | Feel | Use |
|---|---|---|
| `snappy` | 0.25 s, no bounce | toggles, switches, small layout shifts |
| `smooth` | 0.4 s, no bounce | **default**: panels, cards, reorder, shared layout |
| `gentle` | 0.6 s, no bounce | large surfaces, page-level |
| `bouncy` | 0.45 s, bounce 0.25 | drag release, success confirmations (rarely) |
| `wobbly` | 0.6 s, bounce 0.45 | games and celebrations only |

- In CSS, a spring becomes a `linear()` easing plus a duration (the settle time). Use it for transitions that won't be interrupted mid-flight. Use JS springs (Motion, Reanimated) where retargeting matters.
- **Release velocity:** on gesture end, project where the element *would* stop and snap to the nearest target from there, not from the release point (Apple). Swipe-to-dismiss should trigger on distance **or** velocity (Sonner: velocity > 0.11 px/ms).

## 5. Choreography and space

- **Origin-aware**: popovers, menus and tooltips scale from the trigger. Use `transform-origin` toward the anchor; Radix exposes `--radix-*-content-transform-origin`.
- **Leave the way you came in.** A sheet from the bottom exits to the bottom. An item that zoomed out of a card zooms back into it.
- **Never scale from 0.** Start at 0.9–0.96 plus opacity; scale-from-zero looks like a pop-in from nowhere (Emil).
- **One focal motion at a time.** If the dialog animates, the backdrop only fades. Don't also bounce the button that opened it.
- **Hierarchy through order:** container first, then content (≈ 50 ms later), then secondary actions.
- **Keep what didn't change perfectly still.** Moving unchanged content causes "digital whiplash" (Benji Taylor, Family).
- **Direction carries meaning:** forward or deeper means right or up; back means left or down. Keep it consistent across the product.
- **Respond before the threshold** in gestures: track the finger 1:1 immediately and commit when it crosses the threshold. Don't wait and then play a canned 0→1 animation (Rauno).
- **Destructive actions commit on release**, never mid-gesture (Rauno).
- **Every gesture has a tap or keyboard alternative** (Vercel guidelines).

## 6. Interruptibility

- UI animations must be **interruptible and reversible**. Clicking "close" during an open animation reverses from the current state.
- **CSS transitions retarget; `@keyframes` animations do not.** Use transitions for state (open/closed, hover, selected) and keyframes for one-shot or looping effects. Sonner switched from keyframes to transitions for exactly this reason.
- JS libraries: Motion's `animate`, React `motion.*` components and Reanimated `withSpring` all retarget from current velocity.
- **No input lock:** never disable buttons "until the animation finishes".

## 7. Performance

Animate in this order of preference:

1. `transform` (`translate`, `scale`, `rotate`), `opacity`, `filter` (careful on big areas), `clip-path`. These are composited.
2. `background-color`, `color`, `box-shadow` on small elements. These repaint but don't relayout.
3. **Never** `width`, `height`, `top`, `left`, `margin`, `padding` or `font-size` per frame. For height: auto, use `grid-template-rows: 0fr → 1fr`, `interpolate-size: allow-keywords` (Chrome 129+), or FLIP.

More rules:

- **No `transition: all`.** List the properties.
- Prefer **CSS → WAAPI → JS (rAF) libraries**, in that order. CSS and WAAPI transform/opacity animations, and CSS scroll-driven animations, keep running when the main thread is busy; rAF-driven JS stutters (Chrome scroll-animation case study, Vercel guidelines).
- **`will-change` only while animating.** Remove it afterwards; permanent `will-change` on many elements eats GPU memory.
- **During drag, write `transform` directly** on the element, not a CSS variable that many children inherit; that forces style recalculation on the whole subtree (Vaul).
- **One clock:** if you have smooth scroll + GSAP + WebGL, drive everything from a single ticker (`gsap.ticker`), not three separate rAF loops.
- **Pause what isn't visible:** IntersectionObserver for canvases, videos, Lottie/Rive, marquees.
- **Budget for 60 fps on a mid-range Android phone,** not on your MacBook. Test with 4× CPU throttling in DevTools.
- Layout shift counts towards CLS. Enter animations must use transform, not margin/top, and must not push surrounding content.

## 8. Reduced motion (non-negotiable)

`prefers-reduced-motion: reduce` means **no movement**, not "no feedback".

- **Keep:** opacity fades (shorter), colour changes, focus rings, progress indicators.
- **Remove:** translate, scale, parallax, scroll-jacking, zoom, auto-advancing carousels, velocity skew, cursor followers.
- **Replace:** scroll-scrubbed sequences with a still image or poster, page slides with crossfades, auto-playing video with a poster plus a play button.
- Implement it in **CSS and JS**:
  - CSS: `@media (prefers-reduced-motion: reduce)`
  - JS: `matchMedia('(prefers-reduced-motion: reduce)')`
  - Motion: `<MotionConfig reducedMotion="user">`
  - Reanimated: `ReduceMotion.System`
  - GSAP: `gsap.matchMedia()`
  - Lenis: `respectReducedMotion` is on by default
- Anything that moves, blinks or scrolls automatically for **more than 5 s needs a pause control** (WCAG 2.2.2). This covers marquees, carousels and background video.
- Nothing flashes more than 3 times per second (WCAG 2.3.1).
- `motion.css` and `motion.js` in this skill already handle all of this; keep it when you copy recipes.

## 9. Quick decision flow

```
Is it triggered by keyboard or done 100+ times/day?  → no animation (or ≤ 100 ms opacity)
Does it explain where something came from / went?    → origin-aware, 150–300 ms ease-out, exit shorter
Is it driven by a gesture or can it be interrupted?  → spring (smooth), velocity-aware
Is it a state change of the same object?             → transition / layout animation / view transition
Is it a rare, emotional moment?                      → choreograph it (stagger, spring with bounce, Lottie/Rive)
Is it marketing / storytelling?                      → see signature-effects.md, still with reduced-motion + perf budget
```

## Sources

- Emil Kowalski, *Great animations*, *You don't need animations*, *7 practical animation tips*, *Building a toast component*, *Building a drawer component*: https://emilkowal.ski/ui
- Rauno Freiberg, *Invisible details of interaction design*: https://rauno.me/craft/interaction-design
- Vercel, *Web Interface Guidelines*: https://vercel.com/design/guidelines
- Apple WWDC18, *Designing Fluid Interfaces*: https://developer.apple.com/videos/play/wwdc2018/803/
- Benji Taylor, *Family Values*: https://benji.org/family-values
- Chrome, *Scroll animation performance case study*: https://developer.chrome.com/blog/scroll-animation-performance-case-study
- Material Design 3, *Motion: easing and duration*: https://m3.material.io/styles/motion/easing-and-duration
- WCAG 2.2: 2.2.2 Pause, Stop, Hide · 2.3.1 Three Flashes · 2.3.3 Animation from Interactions
