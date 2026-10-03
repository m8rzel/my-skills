# Design review checklist

Use this list to critique a screen, a prototype or a live site. Run `scripts/audit.mjs` first, because it covers about a third of these points automatically. Then walk through this list by hand.

Write findings as follows:

- **Severity**
  - **Blocker:** breaks a task or accessibility
  - **Major:** clearly hurts usability or perceived quality
  - **Minor:** polish
- **Where:** screen or element.
- **What:** observed vs expected.
- **Fix:** concrete change, with a token or value where possible.

Lead with the 3–5 most important findings, not 40 nitpicks.

## 0. Priority order (fix in this order)

| # | Category | Impact | Typical blockers |
|---|---|---|---|
| 1 | Accessibility | critical | contrast, focus visible, keyboard, labels/names, zoom blocked |
| 2 | Touch & interaction | critical | targets < 24/44 px, hover-only, no press/loading feedback |
| 3 | Performance | high | LCP > 2.5 s, CLS > 0.1, heavy canvas/JS, unoptimized images |
| 4 | Style fit & consistency | high | style doesn't match product/audience, mixed styles, emoji icons, random shadows/radii |
| 5 | Layout & responsive | high | horizontal scroll, broken stacking, no max-width |
| 6 | Typography & colour | medium | body < 16 px, grey on grey, raw hex in components |
| 7 | Motion | medium | no reduced motion, layout-property animation, decorative loops without pause |
| 8 | Forms & feedback | medium | placeholder labels, errors only at top, disabled submit |
| 9 | Navigation | high | hidden desktop nav, broken back, no deep links |
| 10 | Charts & data | low | colour-only meaning, no context, no units |

(Order adapted from ui-ux-pro-max-skill, MIT.)

## 1. Purpose & hierarchy

- [ ] Within 5 seconds a user can tell what this screen is for and what to do next.
- [ ] There is one primary action per view. It is visually dominant, and its label starts with a verb.
- [ ] Squint test: the hierarchy holds when blurred, and no competing focal points remain.
- [ ] Secondary information is de-emphasised through colour/weight, not by shrinking it below 12 px.
- [ ] Real, plausible content is used (no lorem ipsum). German formatting is used where the product is German.

## 2. Layout & spacing

- [ ] Spacing sits on the 4/8 px grid. Gaps between groups are about 2× the gaps inside groups.
- [ ] No nested cards, and no borders where whitespace would do.
- [ ] Reading text runs 45–75 characters per line. Numbers are right-aligned and use tabular figures.
- [ ] At 320 px and 390 px: no horizontal scroll, at least a 16 px gutter, and a sensible stacking order.
- [ ] Wide screens: content has a max width, and nothing stretches to 2,000 px lines.

## 3. Typography & colour

- [ ] One type scale is used consistently, and headings use tighter tracking. Body text is ≥ 16 px on mobile.
- [ ] `text-wrap: balance` is set on headings. No widows in the hero.
- [ ] Contrast: text ≥ 4.5:1 (large ≥ 3:1), and focus/UI boundaries ≥ 3:1, in **both** themes. Check with `scripts/contrast.mjs`.
- [ ] Colour is never the only carrier of meaning.
- [ ] Dark mode is a real palette: surfaces rise in lightness, no pure black/white, and accents are adjusted.

## 4. Components & states

- [ ] Hover, active, focus-visible, disabled, loading and error states exist for every interactive element.
- [ ] Focus is clearly visible everywhere. There is no `outline: none` without a replacement.
- [ ] Targets are ≥ 24 px, and ≥ 44 px on touch.
- [ ] Data views have empty, loading (skeleton), error and long-content states.
- [ ] Destructive actions are undoable or confirmed, and styled as destructive.
- [ ] Icons-only buttons have an `aria-label` and a tooltip.

## 5. Forms

- [ ] Every field has a visible label. Placeholders are examples only.
- [ ] Input types, `inputmode` and `autocomplete` are correct.
- [ ] Errors appear inline, are specific, and are linked with `aria-describedby`. On submit, focus moves to the first error.
- [ ] Submit buttons show loading and prevent double submit. Success gives feedback.

## 6. Navigation & flow

- [ ] The current location is always clear: active nav, title, breadcrumbs.
- [ ] Filters, tabs and opened records are reflected in the URL.
- [ ] `Esc` closes overlays. Focus is trapped while an overlay is open and restored after it closes.
- [ ] Feedback for input arrives within about 100 ms. Anything over 1 s shows progress.

## 7. Motion

- [ ] Every animation has a nameable job: feedback, orientation, continuity, status, or a rare moment of delight.
- [ ] Frequent and keyboard-triggered actions have no animation, or ≤ 100 ms of opacity.
- [ ] UI motion runs ≤ 300 ms. Exits are shorter than enters. Stagger totals ≤ 400 ms.
- [ ] Curves are custom ease-out for enter/exit and springs for gestures or interruptible moves. No browser `ease-in` on small UI.
- [ ] Popovers grow from their trigger. Nothing scales from 0.
- [ ] Animations are interruptible (transitions or springs, not keyframes, for state), and input is never blocked while one runs.
- [ ] Only `transform`, `opacity`, `filter` and `clip-path` are animated. No `transition: all`. `will-change` is only set while animating.
- [ ] The interaction is smooth at 4× CPU throttle and on a mid-range phone.
- [ ] `prefers-reduced-motion`: movement is gone, meaning stays (fades, still images). Verify by toggling the OS setting or with `audit.mjs`.
- [ ] Anything moving longer than 5 s can be paused. Nothing flashes more than 3 times per second.
- [ ] Animation causes no layout shift (CLS ≤ 0.1).

## 8. Signature / marketing effects

- [ ] There is one signature idea, and the rest of the page is calm.
- [ ] Content lives in semantic DOM, and the canvas is decoration on top.
- [ ] A static placeholder renders first, so the canvas is not the LCP element. LCP is ≤ 2.5 s on 4G.
- [ ] DPR is capped, rendering pauses off-screen, and there is a quality tier or poster for weak devices.
- [ ] Scroll stays native: no wheel hijacking, and anchors, find-in-page and keyboard paging still work.
- [ ] Mobile has its own simpler version, not a scaled-down desktop experience.
- [ ] Sound is opt-in and can be muted.

## 8a. Dashboards (Stephen Few)

- [ ] Fits one screen for monitoring; most important KPI top-left; one time-range control; "Stand: …" timestamp.
- [ ] Every number has context (target, previous period, range); deltas use sign + arrow, not colour alone.
- [ ] No gauges / 3D / pies > 5 slices; precision fits the decision (48,3 k € not 48.251,37 €).
- [ ] No vanity metrics; colour only for meaning; no decoration.

## 8b. AI interfaces (HAX / NN/g / Apple)

- [ ] Capabilities and limits are clear up front; prompt suggestions are specific and curated.
- [ ] Streaming doesn't auto-scroll away from the start of the answer; Stop while streaming; Retry/Regenerate after.
- [ ] Agent progress is specific (current step, tools, sources, elapsed) — no silent multi-minute waits.
- [ ] Every external side effect (send, pay, delete, publish) has an approval card: action, target, consequence, Approve/Deny.
- [ ] Edit / undo / alternatives next to output; corrections acknowledged; feedback optional.
- [ ] Citations inline next to the claim; caveats near the input with an action; non-AI fallback exists.

## 8c. Premium polish (see `product-ui-teardowns.md`)

- [ ] Interaction feedback < 100 ms; optimistic updates with rollback; no spinner flicker.
- [ ] ⌘K covers every action; shortcuts visible in menus/tooltips; `?` sheet.
- [ ] Monochrome base, colour = meaning; hairline structure; layered elevation; concentric radii.
- [ ] Tabular, right-aligned numbers; one icon family; optical alignment.
- [ ] Undo instead of confirm for reversible actions; URL holds view state.

## 9. Accessibility pass (manual)

- [ ] Keyboard only: every task can be completed, the tab order is logical, and there are no traps.
- [ ] Page zoom at 200 %: content reflows, and nothing is cut off or overlapping.
- [ ] Screen reader: headings outline the page, landmarks are present, live regions announce toasts, and split text is read as whole words.
- [ ] `lang` is set, and zoom is not blocked in the viewport meta.
- [ ] WCAG 2.2 additions: focus not obscured by sticky headers/cookie banners (2.4.11); every drag has a single-pointer/keyboard alternative (2.5.7); targets ≥ 24 px or spaced (2.5.8); help in a consistent place (3.2.6); no redundant re-entry in one process (3.3.7); login allows paste/password managers, no cognitive puzzles (3.3.8).
- [ ] Skip link to main content; sticky headers don't cover anchored headings (`scroll-margin-top`).


## Review output template

```
## Summary
<one paragraph: overall quality, biggest risk, biggest opportunity>

## Top findings
1. [Blocker] <where> — <what>. Fix: <how>.
2. [Major] …
3. …

## Quick wins (< 1h each)
- …

## Motion notes
- …

## Automated audit
<paste the summary table from ux-audit/report.md>
```
