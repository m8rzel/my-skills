# UI/UX principles

> This is the baseline. **Websites:** `website-playbook.md`. **Webapps:** `webapp-playbook.md`. Direction for a new project: `scripts/brief.mjs`. For expert depth read **`ui-craft.md`** (hierarchy, spacing, type, colour, depth, icons — with numbers from Refactoring UI, HIG, Material 3, Radix, Vercel), **`ui-patterns.md`** (research-backed rules per component: forms, tables, dashboards, navigation, overlays, states, settings, pricing, AI interfaces, mobile) and **`product-ui-teardowns.md`** (Linear, Stripe, Vercel, Superhuman, Raycast, Figma, Primer, Polaris, Fluent, Liquid Glass, M3 Expressive + premium checklist).

These are working rules for screens that look intentional and are easy to use. Each rule is a default; break one only when you can name the reason.

## 1. Start from the job, not the layout

Before drawing anything, write three lines for yourself:

1. **Who** is on this screen, and what did they just do?
2. **What one thing** should they achieve here? This becomes the primary action.
3. **What do they need to know** to do it confidently? This becomes the content, in order.

Then design top-down in this order: **headline → key information → primary action → supporting detail → secondary actions**. A screen with two equally loud primary actions has no primary action.

## 2. Visual hierarchy

Rank every element as one of: **1 = must see first**, **2 = scan**, **3 = when needed**. Only a handful of elements get rank 1.

- Express rank with **size, weight and colour contrast**, in that order of strength. Don't use all three at once on everything.
- **Body text is the baseline.** Headings step up through the type scale. Secondary text is the same size with `muted-foreground`, not smaller *and* lighter *and* thinner.
- **Squint test:** blur the screenshot. You should still be able to say what the page is about and where to click.
- **Labels are secondary, values are primary.** In a dashboard, "Revenue" is small and muted, "€48.250" is large.
- **De-emphasise instead of emphasise.** When everything shouts, make the secondary things quieter rather than making the primary louder.

## 3. Layout and spacing

- **Use a 4 px grid**, and mostly 8 px multiples:
  - 8–12 px inside components
  - 16–24 px between related groups
  - 32–64 px between sections
  - 96–160 px between marketing sections
- **Proximity is grouping.** Space *between* groups must be clearly larger (≈ 2×) than space *within* a group. Use whitespace before reaching for borders or cards.
- **Cards are for objects** (a project, an invoice), not for every section. Never nest cards.
- **Line length:** 45–75 characters for reading text (`max-width: 65ch`).
- **Alignment:**
  - Left-aligned by default.
  - Centre only short marketing blocks.
  - Right-align numbers in tables and use `font-variant-numeric: tabular-nums`.
- **Content width:** reading ~680 px, app content 1100–1280 px, dashboards can be fluid.
- **Gutter:** at least 16 px on mobile. No horizontal page scroll at 320–390 px.
- **Responsive order:** stack columns in reading order. Sidebars become sheets or top tabs, tables become cards, and secondary actions move into a menu.

## 4. Typography

- **One family** for UI, optionally plus a display face for marketing headlines and a mono for code and numbers.
- **Modular scale:**
  - About 1.2 ratio for app UI, 1.25–1.333 for marketing.
  - Make it fluid with `clamp()` between 360 and 1280 px.
  - `scripts/tokens.mjs` generates this.
- **Line height by size:**
  - body 1.5–1.6
  - UI labels 1.4
  - headings 1.1–1.25
  - huge display 0.9–1.05
- **Letter-spacing:** tighten large headings (−0.02 to −0.05em). Leave body text at 0. Add a little tracking to small caps and uppercase labels (+0.04–0.08em).
- **Minimums:** 16 px body on mobile (also stops iOS zooming into inputs), 12 px for the smallest labels.
- **Weights:** 400 body, 500 UI labels and buttons, 600–700 headings. Avoid 300 on screens below ~20 px.
- **Avoid widows and orphans in headlines:** `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- **Formatting:** real typographic quotes („…“ in German), real dashes (–), correct number formatting for the locale (`Intl.NumberFormat('de-DE')` gives 1.234,56 €).

## 5. Colour

- **Build palettes in OKLCH.** Equal lightness steps look equal, and contrast is predictable. `scripts/tokens.mjs` makes ramps from one brand colour and checks contrast.
- **Semantic tokens over raw colours:** `--primary`, `--muted-foreground`, `--destructive`. Components only use semantic tokens; ramps feed the semantics.
- **Use colour for meaning,** with roughly one accent: most of the UI is neutral, and the accent marks the primary action, the selection and focus.
- **Status colours** (success, warning, destructive, info) always come with text or an icon. Colour alone never carries meaning (WCAG 1.4.1).
- **Contrast floors (WCAG 2.2 AA):**
  - Text 4.5:1, large text (≥ 24 px, or ≥ 18.66 px bold) 3:1.
  - UI boundaries and focus indicators 3:1.
  - APCA Lc as a second opinion: body ≥ 75, content ≥ 60, large ≥ 45.
  - `scripts/contrast.mjs` checks both.
- **Dark mode is its own palette,** not inverted:
  - surfaces get lighter as they rise (background < card < popover)
  - shadows barely work, so use borders and lightness steps
  - lower the accent chroma slightly
  - avoid pure #000 and #fff

## 6. Components and states

Every interactive element has these states. Design them all, not just the default:

| State | Rule |
|---|---|
| default | |
| hover | only on `(hover: hover)` devices; subtle (bg tint) |
| active / pressed | `scale(0.97)` or a darker tint, 100 ms |
| focus-visible | 2 px ring in `--ring`, offset 2 px, ≥ 3:1 against the background; **never `outline: none` without a replacement** |
| disabled | lower contrast plus `cursor: not-allowed`; explain why nearby or in a tooltip; prefer not disabling at all |
| loading | keep the width (spinner replaces the label or sits beside it), block double-submit |
| selected / current | `aria-current` / `aria-selected` plus visual weight |
| error | border plus message text plus icon |

Every **data view** also needs:

- **empty** (explain and offer the first action)
- **loading** (a skeleton in the final layout)
- **error** (what happened plus retry)
- **partial** (some data failed)
- **long content** (truncation with a tooltip or wrapping, 1 vs 1,000 items)

**Buttons:**
- Verb-first labels ("Rechnung senden", not "OK").
- One primary per view.
- Destructive actions are styled as destructive and confirmed, or better, undoable.

**Touch targets:** ≥ 24×24 px (WCAG 2.5.8), 44×44 px on touch. Pad small icons with an invisible hit area.

## 7. Forms

- **Labels above fields,** always visible. Placeholders are examples, not labels.
- **One column.** Group related fields with headings and space.
- **Pick the input by option count:**
  - 2–5 options: radio or segmented control
  - 5–15: select
  - more, or searchable: combobox
  - on/off that applies immediately: switch
  - on/off submitted with the form: checkbox
- **Correct input types and autocomplete:**
  - `type="email"`, `inputmode="numeric"`
  - `autocomplete="given-name"`, `autocomplete="postal-code"`, `autocomplete="one-time-code"`
- **Validate on blur, re-validate on input** after the first error. Never validate an empty field while the user is still typing.
- **Error messages** say what to do: "Bitte eine gültige IBAN eingeben (DE + 20 Ziffern)", not "Ungültige Eingabe".
- Put the error message **next to the field** and link it with `aria-describedby`. On submit, show an error summary at the top and move focus to the first error.
- **Smart defaults,** and mark the *optional* fields rather than the required ones.
- **Optimistic UI** for low-risk actions; **undo** instead of "are you sure?" wherever possible.

## 8. Navigation and wayfinding

- Users must always know **where they are** (active nav state, page title, breadcrumbs in deep trees), **what they can do** (visible primary action) and **how to go back**.
- **Primary navigation:**
  - up to 5–7 items
  - more → group them, or use a sidebar with sections
  - mobile → bottom bar for apps, menu sheet for sites
- **The URL reflects state:** filters, tabs, pagination and opened records are linkable and survive reloads.
- **Speed is UX:**
  - Respond to input within 100 ms (feedback).
  - Show progress after 1 s.
  - For > 10 s, explain what's happening and let users leave.
- **Keyboard:**
  - logical tab order
  - visible focus
  - `Esc` closes overlays
  - `Enter` submits
  - command palette (⌘K) for power users in apps

## 9. Content and microcopy

- **Write for scanning:** front-load the meaning, one idea per sentence, sentence case.
- Use **concrete numbers and real content** in designs (no lorem ipsum). Use German formatting when the product is German.
- **Empty states sell the next step:** "Noch keine Rechnungen. Erstelle deine erste in 30 Sekunden." plus a button.
- **Tone:** confident, plain and friendly. No blame in error messages ("Wir konnten … nicht laden", not "Du hast …").

## 10. Accessibility baseline (non-negotiable)

- Semantic HTML first: `button` for actions, `a` for navigation, a real `label`, headings in order, landmarks (`header`, `nav`, `main`, `footer`).
- Every interactive element is reachable by keyboard and has a visible focus and an accessible name.
- Images have `alt`; decorative ones get `alt=""`.
- Contrast meets the floors in section 5.
- Content reflows at 320 px and at 200 % zoom, and zoom is never blocked.
- Motion respects `prefers-reduced-motion` (see `motion-principles.md`).
- Overlays trap focus, restore it on close, and close with `Esc`. Toasts use `aria-live="polite"`.
- `lang` is set on `<html>`.
- Test with the keyboard only, at 200 % zoom, and with VoiceOver on one key flow.

`scripts/audit.mjs` automates many of these checks. The rest is in `review-checklist.md`.

## 11. Patterns by product type

| Type | Key moves |
|---|---|
| **Marketing site** | One promise in the hero (headline ≤ 8 words + subline + one CTA). Social proof early. Sections alternate rhythm (text-left/visual-right, then full-bleed). One signature effect (see `signature-effects.md`). The CTA repeats at the end. |
| **SaaS dashboard** | Summary stats → trend → table. Filters persist in the URL. Tables: sticky header, right-aligned numbers, row actions in a menu, bulk actions appear on selection. Charts: titled, units, one takeaway sentence. |
| **CRUD / admin / CMS** | List-detail. Inline edit for single fields, sheets for medium forms, full pages for large ones. Autosave with a visible "Gespeichert" state. Undo for deletes. |
| **Onboarding** | Show progress (step x/y). Ask only what's needed now; defer the rest. Give value before a sign-up wall where possible. |
| **Mobile app (Expo)** | Thumb zone: primary actions at the bottom. Bottom tabs ≤ 5. Sheets over full-screen modals. Native gestures (swipe back, pull to refresh). Haptics on commit, not on every tap. Safe areas. |
| **E-commerce / checkout** | Price, delivery and returns visible early. Guest checkout. Progress across steps. Payment trust signals beside the button. No surprise costs at the end. |
