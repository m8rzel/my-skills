---
name: ui-motion-design
description: "Expert UI/UX and motion design toolkit. Knowledge from Refactoring UI, Apple HIG, Material 3, Radix, NN/g, Baymard, GOV.UK and Vercel, teardowns of Linear, Stripe, Vercel, Apple and Awwwards winners, and rules for forms, tables, dashboards, navigation, overlays, states, pricing, AI/agent UIs and mobile. Scripts: OKLCH design tokens from one brand color (shadcn light/dark, fluid type, motion springs), WCAG+APCA contrast checks, spring to CSS/Motion/Reanimated conversion, Playwright UX/a11y/motion audits. Use when building or reviewing UI, design systems, animations, 'wow' landing pages, or on 'mach das schöner', 'UI/UX', 'Motion Design', 'Animationen', 'Design-Review', 'wie Stripe/Apple/Linear', 'Dashboard', 'Formular', 'AI-Chat-UI', 'Kontrast prüfen'."
---

# ui-motion-design

A toolkit for interfaces that look intentional and move with purpose. It covers four areas:

- **Foundations**: tokens and contrast
- **UX rules**
- **Motion**: principles, recipes, drop-in assets
- **Signature effects**: what Stripe, Apple, Linear, Vercel and award-winning studios do, rebuilt as recipes

It also includes an automated audit for the result.

`<skill-dir>` below means the directory that contains this SKILL.md.

## Pick the workflow

| The user wants… | Do this |
|---|---|
| A palette, design system, or "make it look like our brand" | **A. Tokens** |
| A screen, page, component, dashboard, form, table, AI chat/agent UI or prototype that looks *really* good | **B. Build UI** |
| Animations, micro-interactions, "make it feel smooth" | **C. Motion** |
| A "wow" landing page or scroll storytelling, "like Apple/Stripe", "krasse Animationen" | **D. Signature effects** |
| A critique, "what's wrong with this page", or a quality gate before launch | **E. Review & audit** |

Most real tasks combine several workflows. A new landing page, for example, runs A → B → D → E.

---

### A. Tokens: from one brand colour to a full system

```bash
node <skill-dir>/scripts/tokens.mjs --brand "#6d28d9" --out ./design-tokens --preview
#   --name brand  --ratio 1.25 (desktop type ratio)  --ratio-min 1.2 (mobile)  --base 16
#   --radius 0.625rem  --neutral-chroma 0.012  --font-sans "Geist, sans-serif"  --format all|css|tailwind|json|ts
```

**Output files**

| File | What it is |
|---|---|
| `tokens.css` | Plain CSS variables. Dark mode via `prefers-color-scheme`, `[data-theme=dark]` or `.dark`. Includes reduced-motion overrides. |
| `tailwind.tokens.css` | Tailwind v4 `@theme` with shadcn variable names. Import it after `@import "tailwindcss"`. |
| `tokens.ts` | Hex colours, so it works in React Native too. Also contains motion presets for Motion and Reanimated. |
| `tokens.json` | The same data as JSON. |
| `style-tile.html` | Visual check: ramps, semantic colours in light and dark, contrast table, type scale, radius/shadows, motion demo. **Open it and look at it.** |

**How the tokens are built**

- The brand colour sits **unchanged** on its closest ramp step. Every other step is derived in OKLCH.
- The primary fill and its text colour are chosen so that the label reaches 4.5:1.
- The focus ring is ≥ 3:1 against the page.
- The script prints any pair that fails contrast. Fix failures before you ship.

To check an existing project's tokens:

```bash
node <skill-dir>/scripts/contrast.mjs --css app/globals.css   # shadcn v3 (HSL channels) and v4 (oklch) both work
node <skill-dir>/scripts/contrast.mjs "#6b7280" "#fff"         # single pair: WCAG ratio + APCA Lc + verdicts
```

`contrast.mjs` exits with code 1 when a text pair fails, so it works as a CI gate.

### B. Build UI (expert level)

1. **Frame it** (write it down for yourself before any markup): who is on this screen and what did they just do · the one primary action · what they need to know, in order · which **product type** (marketing, SaaS dashboard, CRUD/admin, onboarding, mobile app, checkout, AI assistant) — `ux-principles.md` §11 has the key moves per type.
2. **Pull the rules for every component you'll use** from `references/ui-patterns.md` — forms (labels, validation on blur, GOV.UK error wording, error summary), tables (alignment, sticky header, bulk bar, pagination vs load more), dashboards (Few: context for every number), navigation and ⌘K, overlays (modal vs non-modal, undo over confirm, toast rules), loading thresholds (0.1 / 1 / 10 s), settings and danger zone, pricing, **AI interfaces** (status model, stop/regenerate, tool-call rows, approval cards, citations), mobile.
3. **Apply the craft layer** from `references/ui-craft.md`: hierarchy by colour/weight before size, labels as last resort, spacing scale, one control-height set, type roles with tabular numbers, Radix-style step semantics for colour, state layers via `color-mix` (oklab towards neutrals), layered hue-tinted shadows, concentric radii, glass only on the floating control layer.
4. **Tokens**: from workflow A or the project's own; components reference semantic tokens only.
5. **Every state**: hover, active, focus-visible, disabled, loading (no flicker), empty (first-use vs no-results vs error), long content, offline.
6. **Premium pass** with the checklist in `references/product-ui-teardowns.md` (speed < 100 ms, ⌘K + visible shortcuts, monochrome + meaningful colour, hairline structure, undo over confirm, URL = state).
7. Real, plausible content with German formatting where the product is German; never lorem ipsum.
8. **Verify**: `scripts/audit.mjs` on the result (aim for 0 errors / 0 warnings), then light + dark + 390 px by eye.

Reference implementation: **`examples/premium-ui.html`** — an invoices app built from generated tokens: calm sidebar, glass topbar, KPI row with context deltas and sparkline, table (tabular/right-aligned numbers, sort with FLIP, filter chips, bulk bar replacing the toolbar, row menus, empty state with reset), toast with Undo and hover-pause, ⌘K palette (fuzzy, grouped, shortcuts, glass with reduced-transparency fallback), AI assistant panel (step list, collapsible tool call, approval card, citations, suggestions, caveat). It passes the audit with 0 findings on mobile and desktop.

For standalone HTML/Claude artifacts in the shadcn look, combine with the `shadcn-artifacts` skill; for React/Next.js use the project's shadcn setup with `tailwind.tokens.css`; for charts use the `dataviz` skill.

### C. Motion

1. Read `references/motion-principles.md`. Decide **whether** each thing moves at all:
   - frequent and keyboard-triggered actions don't animate
   - then pick a duration from the token table, the curve, and spring vs tween
2. Copy patterns from `references/motion-recipes.md`. It covers CSS, Motion for React, Reanimated, and a spec table for common UI patterns.
3. For plain HTML/CSS projects, drop in the assets:
   - `assets/motion.css` contains `.m-popover`, `.m-dialog`, `.m-sheet`, `.m-enter-*`, `.m-stagger`, `.m-reveal`, `.m-collapse`, `.m-press`, `.m-lift` and `.m-skeleton`. It is all in `@layer motion` and already handles reduced motion.
   - `assets/motion.js` (`window.motion`) contains `viewTransition()`, `flip()`, `enter()`, `exit()`, `stagger()`, `countUp()` and `revealOnScroll()`.
   - All of it is demonstrated live in `examples/motion-recipes.html`.
4. Custom springs: `node <skill-dir>/scripts/easing.mjs spring --duration 0.4 --bounce 0.2` prints the CSS `linear()`, Motion, Reanimated and GSAP CustomEase equivalents.
   - `easing.mjs presets` prints the preset set.
   - `easing.mjs playground --out motion-playground.html` writes an interactive comparison of all curves.
5. Non-negotiables:
   - animate transform and opacity only
   - no `transition: all`
   - exits are shorter than enters
   - origin-aware popovers
   - interruptible
   - `prefers-reduced-motion` handled in CSS **and** JS

### D. Signature effects ("wow")

1. Read `references/showcase-teardowns.md` to see how Stripe, Apple, Linear, Vercel, GitHub and the Awwwards winners (Igloo, Lusion, Lando Norris, Immersive Garden, Unseen…) build their effects. Pick **one** signature idea for the page.
2. Build it from `references/signature-effects.md`. Recipes include:
   - mesh gradient
   - cursor glow cards
   - split-text reveals
   - clip reveals
   - sticky zoom
   - pinned horizontal scroll
   - Lenis + GSAP on one clock
   - marquee
   - magnetic button
   - velocity skew
   - text scramble
   - WebGL hover distortion
   - image-sequence scrub
   - page transitions
   - R3F scroll scenes
   - Rive/Lottie

   It also has a stack table: Motion, GSAP (free incl. plugins), Lenis, View Transitions, three.js/R3F, with browser support as of October 2026.
3. A vanilla, dependency-free demo of the most common effects is in `examples/signature-effects.html`: WebGL mesh gradient, split text, magnetic CTA, scramble numbers, pausable marquee, glow cards, clip reveal, sticky zoom, pinned horizontal and velocity skew.
4. Guardrails, every time:
   - content stays in the DOM
   - the placeholder renders first
   - DPR is capped
   - the effect pauses off-screen
   - there is a simpler mobile version
   - reduced motion gets a still image or a fade
   - scroll stays native
5. **Copy the technique, never the brand.** Don't reproduce another company's gradients, illustrations, product imagery or layouts. Use the client's own brand.

### E. Review & audit

```bash
cd <skill-dir> && npm install && npx playwright install chromium     # once
node <skill-dir>/scripts/audit.mjs https://example.com --out ./ux-audit
#   local file or dev server works too: audit.mjs ./index.html | http://localhost:3000
#   --viewports 390x844,1440x900  --auth user:pass  --focus-steps 25  --no-screenshots
```

**What the audit checks, per viewport**

- horizontal overflow, with the culprit elements
- text contrast against the real composited background (WCAG + APCA)
- small text, line length, line height
- touch targets (WCAG 2.5.8, including the spacing exception)
- accessible names, labels, alt text, heading order, `lang`, zoom lock
- focus visibility, using real Tab presses
- CLS and LCP
- motion hygiene: `transition: all`, layout-property animation, long durations on controls, infinite loops, `will-change` overuse
- **reduced motion, verified by reloading with `prefers-reduced-motion: reduce`**

The script writes `report.md`, `report.json` and full-page screenshots. Then work through `references/review-checklist.md` by hand, and report the top 3–5 findings with severity and a concrete fix (see the template at the end of that file).

---

## Files

```
ui-motion-design/
├── SKILL.md
├── package.json                  ← only needed for audit.mjs (Playwright)
├── scripts/
│   ├── tokens.mjs                ← brand colour → tokens (css, tailwind, ts, json) + style tile
│   ├── contrast.mjs              ← WCAG + APCA for pairs or whole token files (CI exit code)
│   ├── easing.mjs                ← springs → linear()/Motion/Reanimated/GSAP, presets, playground
│   ├── audit.mjs                 ← Playwright UX/a11y/motion audit → report.md
│   └── lib/color.mjs, lib/spring.mjs
├── assets/
│   ├── motion.css                ← drop-in motion primitives (@layer motion, reduced-motion aware)
│   └── motion.js                 ← viewTransition, flip, enter/exit, stagger, countUp, revealOnScroll
├── references/
│   ├── ux-principles.md          ← baseline: job-first, hierarchy, layout, type, colour, states, a11y, product types
│   ├── ui-craft.md               ← expert visual craft with numbers (Refactoring UI, HIG, M3, Radix, Vercel, Butterick)
│   ├── ui-patterns.md            ← research-backed component/screen rules incl. AI interfaces (NN/g, Baymard, GOV.UK, HAX)
│   ├── product-ui-teardowns.md   ← Linear, Stripe, Vercel, Superhuman, Raycast, Figma, Primer, Polaris, Fluent, Liquid Glass, M3E
│   ├── motion-principles.md      ← when/how long/which curve, springs, choreography, perf, reduced motion
│   ├── motion-recipes.md         ← CSS, Motion for React, Reanimated, spec table
│   ├── signature-effects.md      ← wow-effect recipes + stack table + guardrails
│   ├── showcase-teardowns.md     ← Stripe, Apple, Linear, Vercel, GitHub, Awwwards winners (with sources)
│   └── review-checklist.md       ← manual review rubric (incl. dashboards, AI, premium) + report template
└── examples/
    ├── premium-ui.html           ← reference app UI (tokens → craft → patterns → AI panel), audit-clean
    ├── design-tokens/tokens.css  ← generated by tokens.mjs for premium-ui.html
    ├── motion-recipes.html       ← all UI motion patterns, live
    └── signature-effects.html    ← vanilla wow effects, live
```

Scripts need Node 18+ and have no dependencies, except `audit.mjs`, which needs Playwright.
