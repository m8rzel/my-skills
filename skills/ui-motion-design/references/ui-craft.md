# Visual UI craft: the expert layer

`ux-principles.md` covers the basics. This file covers what separates good from excellent: the concrete moves from Refactoring UI, Apple HIG, Material 3, Radix, Vercel, Butterick and NN/g, with the numbers.

Tags used below:
- **[V]**: verified in the source.
- **[~]**: taken from a secondary source or a chapter title.
- **[U]**: common practice without a primary source.

Sources are at the end.

## 1. Hierarchy: emphasise by de-emphasising

- **Use colour and weight before size.** Two or three text colours are enough:
  - dark for primary content
  - grey for secondary
  - light grey for ancillary

  Use two weights: 400–500 for normal text and 600–700 for emphasis. Avoid weights under 400 in UI. [V] Refactoring UI, Apple HIG
- **When the main element doesn't stand out, make its competitors quieter** instead of making the main element louder. [~] Refactoring UI
- **Labels are a last resort.**
  - "12 left in stock" beats "In stock: 12".
  - Formats speak for themselves (email, phone, price).
  - When a label is needed, make it the secondary element: smaller or lighter.
  - Exception: spec sheets, where people scan *for* the label.
  
  [V] Refactoring UI
- **Visual hierarchy ≠ document hierarchy.** An `<h1>` can be small when it really works as a label, for example a settings section title. [~]
- **Never use grey text on coloured backgrounds.** Use the background's hue with adjusted lightness and saturation, or white at reduced opacity. [V]
- **Button hierarchy:**
  - primary = solid
  - secondary = outline or muted fill
  - tertiary = link style
  
  A destructive action is not automatically big and red. Make it secondary on the page and give it the loud red style only in the confirmation step. [V]
- **NN/g limits** [V]:
  - about 3 font sizes and about 3 contrast levels per view
  - at most 2 "big" elements
  - warm, saturated colours only for warnings
  - squint test
- **Scanning** [V]: users fall back to the F-pattern when the page gives no cues. Counter it:
  - key info first
  - headings that start with information-carrying words
  - bold key terms
  - lists
  - descriptive link text
- **Flat UI needs strong signifiers.** Weak signifiers cost 22 % more time and 25 % more fixations. Clickable things must look clickable. [V] NN/g
- **Laws of UX worth applying daily** [V]:
  - **Fitts:** big and near targets for frequent actions.
  - **Hick:** fewer choices per step.
  - **Proximity / common region:** grouping.
  - **Von Restorff:** one distinct item gets remembered.
  - **Doherty:** < 400 ms keeps flow.
  - **Aesthetic-usability:** beauty buys tolerance, but it doesn't fix usability.
- **Hobday's safe rules** [V]:
  - Order elements by visual weight.
  - Lower the contrast of icons next to text.
  - Everything aligns with something.
  - Outer padding ≥ inner padding.
  - Never put two hard dividers next to each other.

## 2. Spacing & layout

- **Start with too much whitespace, then remove it.** [~]
- **Use a non-linear scale, not pixel nudging:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128… Adjacent steps should differ by about 25 % or more. [U: book value]
- **Proximity beats colour and shape for grouping.** Check that groups survive responsive reflow. [V] NN/g Gestalt
- **Grids are overrated for app UI.**
  - Sidebars and fixed panels get a **fixed width**; only the content area flexes.
  - Use `max-width` instead of percentages.
  - Don't shrink an element before the container forces it to.
  
  [~]
- **Use fewer borders.** Separate with spacing, a background tint or a shadow instead. When you do need a border, it must contrast with both sides. [V]
- **Buttons:** horizontal padding ≈ 2× vertical padding. [V] Hobday
- **One control-height set for inputs, buttons and selects**, so they align in a row.
  - Common web values: 32 / 36 / 40 (dense / default / comfortable). [U]
  - Apple macOS: 28 / 32 / 44 / 52 / 64 pt. [V]
- **Density is a product decision.** Polaris: high density in data-rich views, low density in focused tasks and onboarding. [V]
- **Context-aware spacing:**
  - Notion's adjacency system tightens padding between neighbouring list items.
  - Notion keeps paragraph spacing separate from line-height.
  
  [V]
- **Breakpoints:** use container queries for components and a few page breakpoints. Material window classes for reference: compact < 600, medium 600–840, expanded 840–1200, large 1200–1600, xl ≥ 1600. [V]

## 3. Typography

- **Hand-pick a constrained scale.** A strict modular ratio is only a starting point. `tokens.mjs` generates a fluid one; adjust it by eye.
- **Line height falls as size rises and grows with line length:**
  - narrow body text ≈ 1.5
  - wide body text up to 2
  - big headlines ≈ 1–1.1
  
  [V] Refactoring UI. Butterick: 120–145 % for text. [V]
- **Line length:** 45–90 characters (Butterick), ≈ 60–70 ideal (Vercel uses 60–68). [V]
- **Tracking:**
  - Negative at large sizes, positive at small sizes.
  - SF Pro reference (1/1000 em): 10 pt +12, 12 pt 0, 14 pt −11, 17 pt −26. [V]
  - All caps and small caps: +5–12 %, and only for less than one line. [V] Butterick
- **Optical sizes:**
  - Use the Display cut for headings and the Text cut for UI. Linear uses Inter Display + Inter. [V]
  - Inter 4 ships an `opsz` axis.
  - `font-optical-sizing: auto` is the default for variable fonts.
- **Number features:**
  - `font-variant-numeric: tabular-nums` wherever numbers get compared (tables, KPIs, timers, prices in lists).
  - Inter extras: `zero` (slashed zero), `cv11` (single-storey a), `ss01` (alternate digits), `case` (punctuation that matches capitals).
  
  [V]
- **Platform minimums:**
  - iOS: body 17 pt, minimum 11 pt.
  - macOS: 13 / 10 pt.
  - Web body ≥ 16 px; inputs ≥ 16 px on mobile, otherwise iOS zooms on focus.
  - Support 200 % text enlargement.
  
  [V] Apple HIG, Vercel
- **Reference scales** when you need one fast:

| iOS Dynamic Type (default) | pt / leading | Material 3 | sp / line |
|---|---|---|---|
| Large Title | 34 / 41 | Display L / M / S | 57/64 · 45/52 · 36/44 |
| Title 1 / 2 / 3 | 28/34 · 22/28 · 20/25 | Headline L / M / S | 32/40 · 28/36 · 24/32 |
| Headline (semibold), Body | 17 / 22 | Title L / M / S | 22/28 · 16/24 · 14/20 |
| Callout, Subhead | 16/21 · 15/20 | Body L / M / S | 16/24 · 14/20 · 12/16 |
| Footnote, Caption 1 / 2 | 13/18 · 12/16 · 11/13 | Label L / M / S | 14/20 · 12/16 · 11/16 |

- **Wrapping and microtypography:**
  - `text-wrap: balance` on headings (applied to ≤ 6 lines in Chromium); `text-wrap: pretty` on paragraphs.
  - Curly quotes („…“ in German), the `…` character, `&nbsp;` between number and unit, and "Speichern…" for actions that open something.
  - `font-synthesis: none`, so a missing weight never renders as faux bold.
  
  [V] MDN, Vercel
- **Typefaces:** two at most. Pairings that work:
  - one neutral sans (Inter, Geist) + one mono for data
  - or a characterful display face + a neutral text face

## 4. Colour

- **Palette size:**
  - greys: 8–10 shades
  - primary: 5–10 shades
  - each accent: several shades
  
  Define every shade in advance; never generate them at runtime with `lighten()`. [V] Refactoring UI
- **Generate in OKLCH.** HSL lightness lies: yellow and blue at the same L look very different. [V] Comeau. Stripe uses CIELAB and Linear uses LCH for the same reason.
- **Give every scale step a job.** The Radix 12-step semantics are the best mental model, and `tokens.mjs` steps map onto them [V]:

| Radix step | Job | ≈ tokens.mjs / shadcn |
|---|---|---|
| 1 | app background | `--background` |
| 2 | subtle background (sidebar, cards, striped rows, code) | `--card`, `--muted` (light) |
| 3 | UI element background | `--secondary`, `--accent` |
| 4 | hover background | accent hover |
| 5 | active / selected background | `--primary-subtle` |
| 6 | subtle borders and separators (non-interactive) | `--border` |
| 7 | interactive borders, **focus ring** | `--input`, `--ring` |
| 8 | hovered border | — |
| 9 | solid fill, the "pure" brand colour | `--primary` |
| 10 | hovered solid | primary hover |
| 11 | low-contrast text (APCA Lc 60 on step 2) | `--muted-foreground`, `--primary-subtle-foreground` |
| 12 | high-contrast text (Lc 90 on step 2) | `--foreground` |

  Vercel Geist uses a similar 10-step model: 1–3 backgrounds, 4–6 borders, 7–8 high-contrast fills, 9 secondary text, 10 primary text. [V]
- **Contrast through step distance.** Stripe guarantees 4.5:1 when two colours are ≥ 5 steps apart, and 3:1 at ≥ 4 steps. Design your ramps so a rule like this holds. [V]
- **Saturation at the extremes:**
  - Raise chroma towards very light and very dark steps, or they look washed out.
  - Optionally rotate the hue slightly: towards yellow or cyan when lightening, towards blue or red when darkening.
  
  [~]
- **Tinted neutrals.**
  - Greys carry a hint of the brand hue (`--neutral-chroma`).
  - Use warm or cool neutrals, never both.
  - Prefer near-black and near-white to pure black and white.
  
  [V] Hobday. Linear's 2026 refresh moved to *warmer, less saturated* greys for a calmer feel. [V]
- **Restraint:**
  - "Design in monochrome. Use colour only when it adds significant meaning." [V] Vercel
  - Linear reduced how much brand blue feeds its chrome. [V]
  - Brand colour belongs on the primary action, selection, focus and key data.
- **State layers (Material 3):**
  - Overlay the content colour on the container at hover 8 %, focus 10 %, pressed 10 % and dragged 16 % (current tokens; older versions used 12 %).
  - In CSS: `background: color-mix(in oklch, var(--primary-foreground) 8%, var(--primary))`.
  
  [V]
- **Mixing towards neutrals:** `color-mix(in oklab, var(--warning) 60%, var(--foreground))`. In `oklch`, mixing amber (h≈75) with a blue-tinted ink (h≈280) swings the hue through **red**, which the audit caught in `examples/premium-ui.html`. Use `oklch` mixing only between colours of similar hue. [V: own test]
- **Gradients:**
  - Interpolate in OKLCH: `linear-gradient(in oklch, …)`. sRGB passes through a grey "dead zone" between saturated colours.
  - Add subtle noise against banding.
  
  [V] Comeau
- **Contrast:**
  - WCAG AA: 4.5:1 for text, 3:1 for large text and UI.
  - Apple dark mode: aim for 7:1 for small text.
  - Vercel: hover, active and focus states need *more* contrast than the rest state; use APCA as a second opinion.
  
  [V]
- **Dark mode:**
  - It's a separate palette, not an inversion.
  - **Higher elevation means a lighter surface:** Material tonal surface containers; Apple's "base" vs "elevated" backgrounds.
  - Set `color-scheme: dark` and a matching `<meta name="theme-color">`.
  - Slightly dim images that have white backgrounds.
  - NN/g: light mode performs better for most people at small text sizes. Offer dark mode, don't force it.
  
  [V]

## 5. Depth, surfaces, shape

- **One light source.** Every shadow uses the same x:y ratio, roughly y = 2x, or straight down.
  - Higher elevation → larger offset, larger blur, *lower* opacity.
  - Blur ≈ 2 × offset.
  
  [V] Comeau, Hobday
- **Layered shadows** instead of one big blur [V]:
  - Medium: `1px 2px 2px c/.33, 2px 4px 4px c/.33, 3px 6px 6px c/.33`.
  - High: 5 layers (1/2/2 → 16/32/32) at about 0.2 opacity each.
  - Tint `c` with the background hue instead of black, because black desaturates whatever it falls on.
  - Vercel: use at least 2 layers (ambient + direct) and combine them with a semi-transparent border for a crisp edge.
- **Elevation scales from real systems:**
  - Fluent 2 [V]: 2 pressed, 4 cards, 8 tooltips and command bars, 16 callouts and hover cards, 28 drawers and bottom sheets, 64 dialogs. Key shadow + ambient shadow; dark mode uses stronger opacity.
  - Geist materials [V]: base and small at 6 px radius; medium and large at 12 px; tooltip 6 px; menu 12 px; modal 12 px; fullscreen 16 px. **Radius grows with elevation.**
- **Dark UI:**
  - Shadows barely read. Separate with lighter surfaces and hairline borders.
  - A 1 px lighter top edge or inner highlight makes cards feel lit. [U]
  - "Don't mix depth techniques." [V] Hobday
- **Borders:**
  - Passive separators use a subtle step (Radix 6); interactive borders use step 7; hover uses step 8.
  - Linear 2026 made separators lower-contrast with rounded ends: "structure should be felt, not seen". [V]
- **Concentric radius:** outer radius = inner radius + padding. A child's radius is ≤ its parent's. This isn't needed when the inner radius is 0 or a pill. [V] Vercel, jakub.kr, Apple
- **Squircles:** iOS uses continuous corners. Figma's corner smoothing at 60 % approximates them. CSS `corner-shape: squircle` is arriving, Chromium first. Capsule buttons are calmer to look at. [V]
- **Material 3 shape scale (dp):** 0 / 4 / 8 / 12 / 16 / 28 / full. Elevation levels: 0, 1, 3, 6, 8, 12. [V]
- **Glass (Liquid Glass / Fluent Acrylic):**
  - **Only on the floating control layer:** nav bars, toolbars, popovers, the command palette. **Never in the content layer.**
  - Never glass on glass.
  - Text-heavy glass uses the "regular" (more opaque) variant. Clear glass goes only over rich media, with a dimming layer (Apple: 35 %) when the content below is bright.
  
  [V] Apple HIG. Web recipe:
  ```css
  .glass { background: color-mix(in oklch, var(--background) 78%, transparent); backdrop-filter: blur(16px) saturate(1.4);
           border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent); box-shadow: var(--shadow-lg); }
  @media (prefers-reduced-transparency: reduce) { .glass { background: var(--popover); backdrop-filter: none; } }
  ```
  `prefers-reduced-transparency` works in Chromium only, so default to fairly opaque glass. Keep blur below 20 px for text legibility. Text contrast stays ≥ 4.5:1.

## 6. Icons & imagery

- **One icon family:**
  - same stroke width, grid and corner radius
  - sizes: 16 inline, 20 in buttons, 24 standalone
  - Raycast, Figma UI3 and Atlassian all redrew their sets for consistency. [V]
- **Never scale up small icons.** Put them in a tinted shape, or use a set drawn for the larger size. [V]
- **Icons next to text:**
  - Lower the icon's contrast slightly to the text's level.
  - Centre it on the cap height or x-height, not the line box.
  - Use less padding on the icon side of a button.
  
  [V] Hobday, jakub.kr
- **Optical alignment:** nudge by about 1 px when geometry looks wrong, for example the play triangle, round shapes next to square ones, or quotes in headlines. Bake the correction into the SVG, not into margins. [V]
- **User-uploaded images:**
  - Fixed aspect ratio with `object-fit: cover`.
  - A subtle inset outline (`outline: 1px solid rgb(0 0 0 / .08); outline-offset: -1px`) so light images don't bleed into the background.
  - Always set `width`/`height` or `aspect-ratio` to avoid CLS.
  
  [~]
- **Text on images:** use a gradient scrim or an overlay, never bare text on a busy photo. [~]

## 7. Details that read as "premium"

| Detail | How | Seen at |
|---|---|---|
| Speed is the feature | Feedback < 100 ms (target 50); optimistic updates with rollback or undo; preload likely next views; POST/PATCH < 500 ms | Superhuman, Linear, Vercel [V] |
| No spinner flicker | Show after 150–300 ms, keep at least 300–500 ms; skeleton = final layout | Vercel [V] |
| Keyboard-first | ⌘K palette with fuzzy and synonym search covering every action; `?` shortcut sheet; two-key navigation (G then I); shortcuts shown next to menu items and in tooltips | Linear, Raycast, Superhuman [V] |
| Calm chrome, loud content | Dimmer sidebar, fewer coloured icons, low-contrast separators | Linear 2026 [V] |
| Restrained colour | Monochrome base, colour = meaning | Vercel, Linear [V] |
| Tabular numbers, right-aligned | All numeric columns and KPIs | Vercel/Geist [V] |
| Named type roles | "Label" (single line, pairs with icons) vs "Copy" (multi-line); no ad-hoc sizes | Geist [V] |
| Hairline + layered depth | 1 px semi-transparent borders + 2-layer shadows; radius grows with elevation | Vercel, Fluent [V] |
| Tactile primary action | Pressed state with real feedback (scale or tint), animated checkbox ticks | Polaris "juicy interactions" [V] |
| Every state designed | Empty, sparse, dense, error, long content | Vercel [V] |
| Undo over confirm | Toast with Undo for reversible actions; confirmation only for irreversible ones | Vercel, NN/g [V] |
| URL is state | Filters, tabs, opened panels deep-linkable | Vercel [V] |
| Real copy | Sentence case, verbs on buttons, consistent terms, `…` on actions that open something | Vercel [V] |
| Defaults over settings | Fewer options, better defaults; 98 theme variables → 3 inputs | Linear, Stripe [V] |
| Accessibility built in | High-contrast themes (Linear 30–100 contrast slider, Primer 7:1), labelled icon buttons | Linear, Primer [V] |
| Respect muscle memory | Redesigns keep positions; betas with opt-out; Figma reverted floating panels because they slowed people down | Figma UI3 [V] |
| Small finishing touches | `::selection` and `caret-color` in brand colour, themed scrollbars via `color-scheme`, accent border on the active nav item | [U] / Refactoring UI [V] |

## 8. Platform specifics

- **Touch targets:**
  - iOS: 44×44 pt (minimum 28).
  - Android: 48×48 dp with 8 dp spacing.
  - Web: ≥ 24 px (WCAG 2.5.8), 44 px on touch.
  
  [V]
- **Safe areas:**
  - `env(safe-area-inset-*)` on the web.
  - Bars float over full-bleed content with a scroll-edge blur, not a solid bar (iOS 26).
  
  [V]
- **Dynamic Type / text scaling:** at large sizes, switch inline layouts to stacked ones and reduce the number of columns. Truncate as little as possible. [V]
- **System appearance:** follow the system light/dark setting. Apple advises against an app-specific switch; on the web, offer "System / Light / Dark" with System as the default. [V]
- **Material 3 Expressive (2025):**
  - Spring-based motion schemes: *standard* for everyday UI, *expressive* for hero moments.
  - Each comes as "spatial" springs, which may overshoot, and "effects" springs for colour and opacity, which don't.
  - Shape morphing; emphasised type.
  - Research: key elements found up to 4× faster.
  - Use the expressive scheme only for rare, important moments.
  
  [V]

## Sources

**Craft and colour**
- Refactoring UI: https://refactoringui.com/ · https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 · https://refactoringui.com/previews/labels-are-a-last-resort · https://refactoringui.com/previews/building-your-color-palette
- Anthony Hobday, safe rules: https://anthonyhobday.com/sideprojects/saferules/
- Radix Colors scale: https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- Josh W. Comeau: https://www.joshwcomeau.com/css/designing-shadows/ · https://www.joshwcomeau.com/css/make-beautiful-gradients/ · https://www.joshwcomeau.com/css/color-formats/
- Concentric radius: https://jakub.kr/work/concentric-border-radius
- Optical alignment: https://jakub.kr/components/optical-alignment
- Figma, squircles: https://www.figma.com/blog/desperately-seeking-squircles/

**Typography**
- Butterick: https://practicaltypography.com/summary-of-key-rules.html
- Inter: https://rsms.me/inter/
- MDN text-wrap: https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap

**Platform guidelines**
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/ (typography, color, dark-mode, materials, accessibility, buttons, layout)
- Material 3 tokens: https://github.com/flutter/flutter/tree/master/dev/tools/gen_defaults/data
- Material 3 Expressive: https://design.google/library/expressive-material-design-google-research

**Research**
- NN/g: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ · https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/ · https://www.nngroup.com/articles/dark-mode/ · https://www.nngroup.com/articles/gestalt-proximity/
- Laws of UX: https://lawsofux.com/

**Design systems**
- Vercel guidelines: https://vercel.com/design/guidelines
- Geist: https://vercel.com/geist/colors · https://vercel.com/geist/materials · https://vercel.com/geist/typography
- Fluent 2 elevation: https://fluent2.microsoft.design/elevation
