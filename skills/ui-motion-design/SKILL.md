---
name: ui-motion-design
description: "Expert UI/UX and motion design toolkit for websites (landing, local business, agency, shop, product launch) and webapps (SaaS, dashboards, admin, AI/agent UIs, mobile). brief.mjs turns a product description into style, fonts, palette and page pattern; compose.mjs builds a complete page scaffold from 19 section blocks; tokens.mjs makes OKLCH tokens; shots.mjs renders contact sheets, audit.mjs checks UX/a11y/motion, extract.mjs reads the design DNA of an existing site for redesigns. Knowledge from Refactoring UI, Apple HIG, Material 3, NN/g, Baymard, GOV.UK, Vercel; teardowns of Linear, Stripe, Apple, Awwwards; 21st.dev sourcing; German copywriting. Use when building, reviewing or redesigning UI, or on 'mach das schöner', 'UI/UX', 'Animationen', 'Landingpage', 'Relaunch', 'Design-Review', 'wie Stripe/Apple', 'Dashboard'."
---

# ui-motion-design

A toolkit for interfaces that look intentional and move with purpose — **equally for websites** (marketing, landing, local business, agency, shop) **and webapps** (SaaS, dashboards, admin, AI/agent UIs, mobile apps). It covers:

- **Direction**: `brief.mjs` turns a product description into style, palette seed, fonts, page pattern/app shell, motion level and anti-patterns
- **Foundations**: tokens and contrast
- **UX/UI knowledge**: craft, component patterns, website & webapp playbooks, product teardowns
- **Motion**: principles, recipes, drop-in assets
- **Signature effects & component sourcing**: Stripe/Apple/Awwwards techniques, 21st.dev & shadcn animation libraries
- **Audit** for the result

`<skill-dir>` below means the directory that contains this SKILL.md.

## 0. Website or webapp? Start with a brief

```bash
node <skill-dir>/scripts/brief.mjs "website für eine schreinerei in offenburg, warm und bodenständig"
node <skill-dir>/scripts/brief.mjs "ki assistent für steuerberater" --name "Belegfix" --brand "#5b5bd6" --out ./design-system --tokens
node <skill-dir>/scripts/brief.mjs "…" --out ./design-system --page checkout     # page override template
node <skill-dir>/scripts/brief.mjs --list products|styles|fonts|patterns
```

It matches ~25 product types (German + English keywords, incl. Handwerk, Praxis, Kanzlei, Restaurant, SaaS, AI, devtool, fintech, shop, agency, event …) and mood words ("dunkel", "luxus", "verspielt", "minimal", "3d", "warm", "ruhig", "natur", "glas" …) to a **style** (`references/style-catalog.md`), **font pairing**, **brand seed**, **website pattern or app shell**, **motion level**, **signature idea**, must-haves, anti-patterns and 21st.dev categories. With `--out` it persists `design-system/<slug>/MASTER.md` (+ `pages/<page>.md` overrides that win over the master for that page); with `--tokens` it also runs `tokens.mjs` with the chosen fonts. **Read MASTER.md (and the page override) before building any page.** The brief is a starting point — the client's real brand wins.

| Building a… | Read | Reference build |
|---|---|---|
| **Website** (landing, local business, agency, shop, event, product launch) | `references/website-playbook.md` → section library, page types, conversion, SEO/CWV, German legal UX; then `signature-effects.md` + `showcase-teardowns.md` for the one wow moment | `examples/landing-page.html`, `examples/product-launch.html`, `examples/agency-redesign.html` |
| **Webapp** (SaaS, dashboard, admin, AI, mobile) | `references/webapp-playbook.md` → shells, IA, speed, density, keyboard, safety, billing/team pages; then `ui-patterns.md` per component + `product-ui-teardowns.md` | `examples/premium-ui.html` |
| Both | same tokens, same brief; the marketing site may be more expressive than the app | both examples share one token set |

## Pick the workflow

| The user wants… | Do this |
|---|---|
| A new site/app, "welcher Stil passt?", palette/fonts/direction | **0. Brief** → A |
| A palette, design system, or "make it look like our brand" | **A. Tokens** |
| A screen, page, component, dashboard, form, table, AI chat/agent UI or prototype that looks *really* good | **B. Build UI** |
| Animations, micro-interactions, "make it feel smooth" | **C. Motion** |
| A "wow" landing page or scroll storytelling, "like Apple/Stripe", "krasse Animationen", components from 21st.dev | **D. Signature effects** |
| A critique, "what's wrong with this page", or a quality gate before launch | **E. Review & audit** |
| A **redesign** of an existing site ("mach unsere Seite neu", client relaunch) | **F. Redesign** |

Most real tasks combine several workflows. A new landing page runs 0 → **compose** → fill content → D → E; a new app screen 0 → A → B → C → E; a relaunch F → 0 → compose → E.

### Fast path for websites: compose a scaffold

```bash
node <skill-dir>/scripts/compose.mjs "website für eine schreinerei in offenburg" --name "Holzwerk Seitz" --city Offenburg --phone "+49 781 123456" --out ./site
node <skill-dir>/scripts/compose.mjs --pattern saas-landing --name "Belegfix" --brand "#5b5bd6" --out ./site --artifact
node <skill-dir>/scripts/compose.mjs --list        # 19 blocks + recipes per pattern
```

It runs the brief, generates tokens with the chosen fonts, and assembles the pattern's blocks from `blocks/` (nav, hero-split, hero-center, hero-local, logos, problem-outcome, bento, steps, story-pinned, services, compare, testimonial, stats, pricing, faq, contact-local, cta-band, footer, mobile-bar) into one audit-clean HTML file, styled through a **skin** (`blocks/_skins.css`, one per style direction). Every `[bracketed]` text is a placeholder — the script counts them. **Then replace every placeholder with real content** (`references/copywriting.md`), swap `.ph` placeholders for real visuals, add the page's one signature effect, and verify with `shots.mjs` + `audit.mjs`. `--artifact` also writes a fragment for the Artifact tool. The scaffold is a starting point, not the design: change layout, type and sections wherever the subject asks for it.

---

### A. Tokens: from one brand colour to a full system

```bash
node <skill-dir>/scripts/tokens.mjs --brand "#6d28d9" --out ./design-tokens --preview
#   --neutral-hue 235 (neutrals cooler/warmer than the accent)  --background-light 0.972 (tinted page instead of white)
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
3. **Source instead of hand-building** where it saves time: `references/component-sourcing.md` covers 21st.dev (registry, `npx shadcn add "https://21st.dev/r/<author>/<slug>?api_key=…"`, the 21st MCP), Magic UI, Aceternity, Motion Primitives, Cult UI, React Bits, Kokonut — with a license table, a section→component map and a **10-point vetting checklist** (reduced motion is usually missing, gradient text contrast, SSR/hydration, bundle size).
4. A vanilla, dependency-free demo of the most common effects is in `examples/signature-effects.html`: WebGL mesh gradient, split text, magnetic CTA, scramble numbers, pausable marquee, glow cards, clip reveal, sticky zoom, pinned horizontal and velocity skew.
5. Guardrails, every time:
   - content stays in the DOM
   - the placeholder renders first
   - DPR is capped
   - the effect pauses off-screen
   - there is a simpler mobile version
   - reduced motion gets a still image or a fade
   - scroll stays native
6. **Copy the technique, never the brand.** Don't reproduce another company's gradients, illustrations, product imagery or layouts. Use the client's own brand.

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

The script writes `report.md`, `report.json` and full-page screenshots.

**Look at it, every time** — one contact sheet across phone/desktop × light/dark (× reduced motion):

```bash
node <skill-dir>/scripts/shots.mjs ./index.html --out ./shots [--full] [--reduced] [--section "#preise"]
```

It flags horizontal overflow and JS errors per cell; `--full` captures whole pages in their resting state. Then work through `references/review-checklist.md` by hand, and report the top 3–5 findings with severity and a concrete fix (see the template at the end of that file).

### F. Redesign an existing site

```bash
node <skill-dir>/scripts/extract.mjs https://kunde.de --out ./dna      # design DNA: colours by role, brand, fonts, type scale, radii, shadows, spacing, motion, findings
node <skill-dir>/scripts/audit.mjs https://kunde.de --out ./ux-audit   # what's broken today
node <skill-dir>/scripts/shots.mjs https://kunde.de --out ./before --full
```

1. Read `dna/design-dna.md`: keep what carries the brand (colour, logo, maybe the heading face), fix what the findings list (too many fonts/radii/shadows, irregular spacing, low-contrast text, no token system).
2. Rebuild the system with the suggested `tokens.mjs` command, then brief + compose for the new structure.
3. Present before/after with two contact sheets (`shots.mjs` on old and new) plus the audit delta (errors/warnings before → after) — that's the pitch for the client.

---

## Files

```
ui-motion-design/
├── SKILL.md
├── package.json                  ← only needed for audit.mjs (Playwright)
├── scripts/
│   ├── brief.mjs                 ← product description → design brief (MASTER.md + page overrides) [+ tokens]
│   ├── compose.mjs               ← brief + tokens + blocks → complete page scaffold (+ artifact fragment)
│   ├── shots.mjs                 ← contact sheet: viewports × themes (× reduced motion), overflow + JS errors
│   ├── extract.mjs               ← design DNA of an existing URL → findings + tokens.mjs suggestion
│   ├── tokens.mjs                ← brand colour → tokens (css, tailwind, ts, json) + style tile
│   ├── contrast.mjs              ← WCAG + APCA for pairs or whole token files (CI exit code)
│   ├── easing.mjs                ← springs → linear()/Motion/Reanimated/GSAP, presets, playground
│   ├── audit.mjs                 ← Playwright UX/a11y/motion audit → report.md
│   └── lib/color.mjs, lib/spring.mjs
├── blocks/                       ← 19 section blocks (HTML + scoped CSS/JS) + _base.css + _skins.css, used by compose.mjs
├── data/                         ← curated JSON behind brief.mjs (edit to tune recommendations)
│   ├── products.json             ← ~25 product types → style, fonts, brand seed, pattern/shell, must/avoid, components
│   ├── styles.json               ← 20 style directions (regenerate style-catalog.md: brief.mjs --catalog)
│   ├── fonts.json                ← 22 Google-Fonts pairings (self-host for GDPR)
│   └── patterns.json             ← website section orders + webapp shells
├── assets/
│   ├── motion.css                ← drop-in motion primitives (@layer motion, reduced-motion aware)
│   └── motion.js                 ← viewTransition, flip, enter/exit, stagger, countUp, revealOnScroll
├── references/
│   ├── website-playbook.md       ← sections, page types, conversion, SEO/CWV, German legal UX, QA
│   ├── webapp-playbook.md        ← shells, IA, speed, density, keyboard, safety, onboarding, billing/team, QA
│   ├── style-catalog.md          ← generated from data/styles.json
│   ├── copywriting.md            ← German-first voice, headline/CTA formulas, microcopy library, legal copy, copy QA
│   ├── component-sourcing.md     ← 21st.dev + shadcn animation libs: install, licenses, vetting, trends
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
    ├── landing-page.html         ← reference website (same product), audit-clean
    ├── product-launch.html       ← hardware product launch (CSS-rendered device, pinned scroll story), audit-clean
    ├── agency-redesign.html      ← workflow F result: spacelane.io v2 (lanes hero, offers, cases, form), audit 0/0
    ├── premium-ui.html           ← reference app UI (tokens → craft → patterns → AI panel), audit-clean
    ├── design-tokens/tokens.css  ← generated by tokens.mjs for premium-ui.html
    ├── motion-recipes.html       ← all UI motion patterns, live
    └── signature-effects.html    ← vanilla wow effects, live
```

Scripts need Node 18+ and have no dependencies, except `audit.mjs`, `shots.mjs` and `extract.mjs`, which need Playwright (`npm install` once in the skill folder).

Credits: the brief/design-system-generator idea and the priority-ordered rule categories were inspired by [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT). Data and code here are written from scratch.
