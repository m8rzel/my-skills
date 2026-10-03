# Product UI teardowns: why the best apps feel premium

`showcase-teardowns.md` covers marketing sites and award-winning experiences. This file covers **product UIs**: dashboards, tools and apps people use all day. It was researched in October 2026. Tags: **[D]** means documented by the company itself; **[I]** means inference.

Copy mechanisms (token structure, speed, keyboard model). Don't copy look-alike skins.

---

## Linear: perceptual themes, calm chrome, keyboard-first

- **Colour [D]**
  - Themes are built in LCH instead of HSL.
  - 98 hand-set variables per theme were replaced by **3 inputs: base, accent, contrast**. Contrast runs from 30 to 100, which also gives high-contrast themes.
  - Elevation levels (background → panels → dialogs) are derived from those inputs.
  - Less "chrome blue" in the calculations, for a neutral, timeless look.
- **Type [D]:** Inter Display for headings, Inter for everything else.
- **Alignment and density [D]:** labels, icons and buttons are aligned on both axes in sidebar and tabs. Navigation is denser and has more hierarchy.
- **2026 "calmer" refresh [D]**
  - The sidebar is a few notches dimmer.
  - Compact tabs with smaller icons; coloured team-icon backgrounds removed.
  - Separators have lower contrast and rounded ends.
  - Warmer, less saturated greys.
  - Principles: *"Don't compete for attention you haven't earned"*, *"Structure should be felt, not seen."*
- **Keyboard [D]**
  - ⌘K command menu.
  - Two-key navigation (G then I = Inbox).
  - `/` for search, `?` for a searchable shortcut sheet, meant to bring shortcuts to everyone, not only power users.
- **Speed [I]:** the instant feel comes from a local-first sync engine. Reads are local, and writes are optimistic and then synced.

**Take away:**
- Generate themes from a few perceptual inputs.
- Dim the chrome and keep it calm.
- Keep the keyboard model learnable with `?` and shortcut hints.

## Stripe: guaranteed contrast, constrained customisation

- **Colour [D]:** palettes are built in CIELAB. Two colours ≥ 5 steps apart are guaranteed to reach 4.5:1 (small text); ≥ 4 steps apart reach 3:1 (icons, large text).
- **Stripe Apps [D]**
  - Custom styling is deliberately limited, for consistency and accessibility. Brand colour is allowed in exactly one place.
  - Default views sit side by side with the page (ContextView). A blocking FocusView is only for start-to-finish tasks.

**Take away:**
- Encode accessibility into the scale, not into reviews.
- Fewer customisation knobs give a higher floor.

## Vercel / Geist: semantic scales, materials, guidelines

- **10-step colour semantics [D]:**

  | Steps | Role |
  |---|---|
  | 1–3 | Backgrounds: default, hover, active |
  | 4–6 | Borders: default, hover, active |
  | 7–8 | High-contrast fills: default, hover |
  | 9 | Secondary text and icons |
  | 10 | Primary text and icons |

  There are two page backgrounds: default and secondary.
- **Materials [D]**
  - Surfaces on the page: base/small at 6 px radius, medium/large at 12 px.
  - Floating: tooltip 6 px with the lightest shadow, menu 12 px, modal 12 px with more lift, fullscreen 16 px with the most.
  - **Radius and shadow grow with elevation.**
- **Type roles [D]**
  - *Heading* runs 72 → 14 px.
  - *Label* is for single lines and pairs with icons; Label 13 uses tabular numbers.
  - *Copy* is for multi-line text.
  - *Button* comes in 16/14/12.
- **Brand rules [D]**
  - "Design in monochrome. Use colour only when it adds significant meaning."
  - "Earn a surface or boundary": only when it communicates selection, interaction, warning, contrast or a real grouping.
  - No ornamental shadows. "Default to stillness."
  - Body copy at 60–68 characters per line.
- **Web Interface Guidelines [D]:** the best single checklist; see `review-checklist.md`.
- **Dashboard [D]**
  - The 2019 redesign took >1.2 s off First Meaningful Paint through preconnect and prioritised API calls.
  - The 2026 navigation has a resizable, hideable sidebar, "projects as filters", and a floating bottom bar for one-handed mobile use.

## Raycast and Superhuman: speed and shortcut learning

- **Superhuman [D]**
  - Every interaction should take **under 100 ms**, ideally under 50 ms; the renderer hits 1–2 frames.
  - Mail is local and works offline. Likely next threads are preloaded *and pre-rendered*.
  - Animations that add delay are avoided.
- **Command palette rules [D]**
  - The same shortcut works everywhere.
  - It covers every action, with fuzzy and synonym matching.
  - It teaches the shortcut for next time.
- **Raycast [D]**
  - The search bar was made bigger to signal importance.
  - A bottom Action Bar shows the current actions *with their shortcuts*.
  - ⌘K opens all actions, ↵ runs the primary action, ⌘↵ submits.
  - One icon set with shared stroke and radius rules; a compact mode.

**Take away:**
- Measure interaction latency like a feature.
- Show shortcuts right where actions live.

## Figma UI3: what the redesign kept and what it reversed

- **Changes [D]:** a slim bottom toolbar, resizable and collapsible panels, about 200 redrawn icons, inputs with backgrounds, dropdowns with borders, togglable property labels. x/y stayed put "for muscle memory".
- **Reverted [D]:** floating panels, because they slowed people down. A minimal-label approach was also reverted because it broke screen readers.
- **Process [D]:** opt-out beta, with feedback driving the reversals.

**Take away:** in premium tools, expert speed beats novelty. Test redesigns with real workflows.

## Primer, Polaris, Atlassian, Fluent: system-level lessons

- **GitHub Primer [D]**
  - Three token tiers: base (reference only), functional (`fgColor-default`, `bgColor-muted`), component.
  - Nine themes. High-contrast themes move along the scale until they reach 7:1.
- **Shopify Polaris v12 "uplift" [D]**
  - Moved to Inter.
  - **Density is intentional:** high in data views, low in focused tasks.
  - **"Juicy interactions"**: primary buttons give a physical, dramatic response; hovers are smooth; checkbox ticks are animated.
- **Atlassian 2024–25 [D]**
  - Atlassian Sans + Mono share baseline, stroke and x-height.
  - Heading levels are more distinct.
  - Icons are now line icons with a lighter, consistent stroke.
- **Microsoft Fluent 2 [D]**
  - Elevation = key shadow (edge) + ambient shadow (distance).
  - Ramp: 2 pressed, 4 cards, 8 tooltips, 16 callouts, 28 drawers, 64 dialogs. Dark mode uses stronger shadows.
  - Materials: *Mica* is an opaque, wallpaper-tinted base window. *Acrylic* is frosted glass for transient surfaces. *Smoke* is the scrim behind modals.
- **Notion 2026 [D]**
  - Standardised spacing instead of a baseline grid.
  - Paragraph spacing is separate from line height.
  - An **adjacency system** reduces padding between neighbouring list items so they chunk together.

## Apple Liquid Glass (2025) and Material 3 Expressive (2025)

| | Liquid Glass (iOS/macOS 26) | Material 3 Expressive |
|---|---|---|
| What it is | A translucent, refracting material for the **control layer** (bars, sidebars, toolbars). Specular highlights, concentric with the hardware corners | Expressive update backed by 46 studies with >18,000 participants. Key elements were found up to 4× faster |
| Key rules [D] | Never in the content layer. No glass on glass. "Regular" (more opaque) for text-heavy surfaces; "clear" only over rich media, with a 35 % dimming layer on bright content. Scroll-edge blur instead of solid bars. Taller list rows. Title-case section headers | Springs replace duration/easing: the *standard* scheme for everyday UI, the *expressive* scheme for hero moments. "Spatial" springs may overshoot; "effects" springs (colour, opacity) never do. 35 new shapes with morphing. Emphasised type and variable axes |
| Accessibility | Reduce Transparency, Increase Contrast, a Clear/Tinted toggle (iOS 26.1). Legibility was a real concern | Use expressive motion only for rare moments |
| On the web | Glass only on floating chrome (nav, ⌘K, popovers). Fill at 70–85 % opacity + `backdrop-filter: blur() saturate()` + a 1 px low-alpha border + 2-layer shadow. Fall back on `prefers-reduced-transparency` (Chromium only), so default to fairly opaque glass. Never long text on clear glass | Spring presets from `tokens.mjs` (snappy/smooth for standard, bouncy for expressive). Shape and size emphasis on one primary action |

## Premium checklist: what the best products share

1. **Speed is the feature.** Feedback under 100 ms, optimistic writes, prefetch and pre-render, writes under 500 ms. (Superhuman, Linear, Vercel)
2. **No flicker.** Delay spinners 150–300 ms and keep them visible at least 300–500 ms. Skeletons equal the final layout. (Vercel)
3. **⌘K covers everything.** Fuzzy, synonym-aware, context-ranked, shows its shortcuts. (Superhuman, Linear, Raycast)
4. **Learnable keyboard.** A `?` sheet, shortcuts in menus and tooltips, two-key navigation. (Linear, Raycast, Notion Calendar)
5. **Perceptual, few-input colour system** with contrast guaranteed by step distance. (Linear, Stripe)
6. **Token tiers:** base → functional → component, and every scale step has one job. (Primer, Geist, Radix)
7. **Monochrome base, meaningful colour.** Colour always comes with a second cue. (Vercel, Linear)
8. **Felt, not seen, structure.** Hairlines, spacing before borders, "earn a surface". (Linear, Vercel)
9. **Layered elevation scale.** Key + ambient shadow; radius grows with elevation. (Fluent, Geist)
10. **Concentric radii.** (Apple, Vercel)
11. **Calm chrome, loud content.** (Linear 2026, Apple)
12. **Tabular, right-aligned numbers.** (Geist)
13. **Display vs text optical sizes; named type roles.** (Linear, Geist)
14. **One icon family** with shared stroke and radius. (Raycast, Figma, Atlassian)
15. **Optical alignment** to about 1 px. (Linear, Vercel)
16. **Motion only where it explains**, interruptible, reduced for frequent actions. (Vercel, Rauno, Superhuman)
17. **Tactile primary actions.** (Polaris, M3 Expressive)
18. **Undo over confirm**, and confirmation only when an action can't be undone. (Vercel, NN/g)
19. **Every state designed:** empty, sparse, dense, error, offline. (Vercel, Primer)
20. **URL is state.** (Vercel)
21. **Real copy:** sentence case, verbs, consistent terms, `…`. (Vercel)
22. **Defaults over settings.** (Stripe, Linear)
23. **Density matched to the task.** (Polaris)
24. **Accessibility in the system:** high-contrast themes, labelled icon buttons. (Linear, Primer)
25. **Respect muscle memory in redesigns.** (Figma)

## Trends 2025–2026: use when / avoid when

| Trend | Use when | Avoid when |
|---|---|---|
| "Linear look" (dark-first, brand-tinted near-black, subtle glow, bold type) | Dev tools, technical B2B SaaS | You need to stand out (it's everywhere now); light-mode data apps used all day |
| Calm UI (dim chrome, warm greys, fewer icons) | High-frequency productivity tools | Consumer or brand-led products that need personality |
| Liquid Glass / glassmorphism 2.0 | Floating nav, ⌘K, media overlays, with opaque fallbacks | Content layer, long text, low-end devices |
| M3 Expressive (springs, shape morph, emphasised type) | Hero actions, onboarding, consumer apps | Dense enterprise tables, very frequent actions |
| Bento grids (varied box sizes, ≤ 9 boxes, key item prominent) | Feature overviews, dashboard home, marketing | Sequential flows, content with a reading order |
| Grain/noise on gradients | Hero backgrounds, fixing gradient banding | Behind text, dense UI |
| Gradient borders | One highlighted card, plan or CTA | Every card (breaks "earn a surface") |
| Display optical sizes, variable fonts | Large headings, numerals, weight as feedback | Body UI; shipping many variable axes |
| Dark-mode-first | Developer and media tools, with both themes generated from one system | Light mode as an afterthought; pure black with saturated accents |
| Local-first sync | Collaborative tools where "instant" is the brand | Simple CRUD |
| Higher density | Expert, data-rich views | Onboarding, focused tasks |

## Sources

**Linear**
- https://linear.app/now/how-we-redesigned-the-linear-ui
- https://linear.app/now/behind-the-latest-design-refresh
- https://linear.app/changelog/2026-03-12-ui-refresh
- https://linear.app/enablement/guides/navigating-linear
- https://linear.app/method

**Stripe**
- https://stripe.com/blog/accessible-color-systems
- https://docs.stripe.com/stripe-apps/design

**Vercel**
- https://vercel.com/geist/colors
- https://vercel.com/geist/materials
- https://vercel.com/geist/typography
- https://vercel.com/design/guidelines
- https://vercel.com/blog/dashboard-redesign
- https://vercel.com/changelog/dashboard-navigation-redesign-rollout

**Superhuman and Raycast**
- https://blog.superhuman.com/superhuman-is-built-for-speed/
- https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/
- https://www.raycast.com/blog/a-fresh-look-and-feel
- https://manual.raycast.com/action-panel

**Figma**
- https://www.figma.com/blog/behind-our-redesign-ui3/
- https://www.figma.com/blog/our-approach-to-designing-ui3/

**Design systems (Primer, Polaris, Atlassian, Fluent, Notion)**
- https://primer.style/foundations/color/overview
- https://polaris-react.shopify.com/design/pro-design-language
- https://atlassian.design/whats-new/typography-and-iconography-updates/
- https://fluent2.microsoft.design/elevation
- https://fluent2.microsoft.design/material
- https://www.notion.com/blog/updating-the-design-of-notion-pages

**Apple Liquid Glass and Material 3 Expressive**
- https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
- https://developer.chrome.com/blog/css-prefers-reduced-transparency
- https://design.google/library/expressive-material-design-google-research

**Trends**
- https://blog.logrocket.com/ux-design/linear-design
- https://www.freecodecamp.org/news/bento-grids-in-web-design/
- https://css-tricks.com/?p=351302 (grainy gradients)
