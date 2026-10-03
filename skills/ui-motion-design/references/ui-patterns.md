# UI patterns: research-backed rules per component and screen

This reference draws on NN/g, Baymard, GOV.UK Design System, Luke Wroblewski, Stephen Few, design systems (Primer, Polaris, Carbon, Apple HIG, Material, Fluent), Microsoft HAX, Google PAIR and the Vercel AI SDK. Where the sources disagree, the conflict is stated together with a default choice.

**Tags:** [D] means the source states it directly. [I] marks synthesis or common practice.

## 1. Forms

**Layout**
- One column. Short related fields (postcode + city) may share a row. Forms that followed the guidelines were submitted correctly on the first try 78 % of the time, versus 42 % for forms that didn't. [D] NN/g
- Labels go **above** fields. Never use a placeholder as the label: it disappears, has low contrast, is unreliable with screen readers and looks like a pre-filled value. Hints are one short sentence without links. [D] NN/g, GOV.UK
- Use radios for 2–5 options instead of a dropdown. No Reset or Clear buttons. [D] NN/g

**Required vs optional (sources conflict)**
- NN/g uses an asterisk on required fields. GOV.UK says "never use asterisks" and marks fields "(optional)".
- **Default:** when most fields are required, mark the optional ones "(optional)". When the mix is real, use an asterisk plus a legend. Always set `required` in code to match. [D]+[I]

**Field width and input types**
- Field width matches the expected input. Fixed-length data such as year or CVV gets an exact width; variable data gets a consistent default. A wrong width makes people doubt the label. [D] Baymard
- Choose the keyboard on purpose:
  - `type`, `inputmode`, `autocomplete` (WCAG 1.3.5)
  - `autocorrect="off"` for names, addresses and email
  - `autocapitalize` where it fits
  - 54 % of mobile sites show the wrong keyboard. [D] Baymard

**Validation timing (sources conflict)**
- Inline validation **on blur**, never while the user is still typing. In Wroblewski's study this gave +22 % success, −22 % errors, +31 % satisfaction and −42 % completion time. [D]
- Remove the error on the keystroke that fixes it. Show positive confirmation for fields that are hard to get right. [D] Baymard
- Primer instead validates on submit first and inline only after that.
- **Default:** validate on blur once the field has been touched, and validate everything on submit. [I]

**Error messages (GOV.UK)**
- Say what is wrong and how to fix it, reusing the words of the label.
  - Empty field: "Gib deine IBAN ein".
  - Constraint broken: "IBAN muss mit DE beginnen und 22 Zeichen haben".
- Avoid "ungültig", "bitte", "sorry", "oops", "Fehler aufgetreten".
- Keep the user's input. Prefix the message with a visually hidden "Fehler:".

  [D]
- **Error summary** on submit:
  - at the top of `<main>`, titled "Es gibt ein Problem"
  - receives focus
  - each item links to its field, worded identically to the inline message
  - page `<title>` prefixed with "Fehler: "

  [D]
- Don't put errors in tooltips. If the same error repeats three or more times, escalate the help offered. [D] NN/g

**Buttons and flow**
- Verb labels ("Weiter", or "Speichern und weiter" when the step saves). One primary button.
- Avoid disabled submit buttons: let the user submit and show what's missing. [D] GOV.UK, Primer
- Prevent double submits.
- **Multi-step forms:**
  - Use "one thing per page" for long or rare flows, with a Back link at the top.
  - Wizards suit novices and infrequent tasks, not experts.
  - Show the steps and allow save and resume.
  - The number of fields matters more than the number of steps: the average checkout has 11.3 fields, and 8 is achievable.

  [D] GOV.UK, NN/g, Baymard

**Dates**
- Memorable dates such as a birthday use three text fields (Tag / Monat / Jahr). Use a picker only for dates near today or when the weekday matters, and always keep typing possible. Never use three dropdowns. Accept any separator. [D] GOV.UK, NN/g

**Passwords**
- Minimum 6–8 characters, no character-class rules, requirements shown up front, a show/hide toggle. 82 % of sites have rules that are too complex. [D] Baymard

**Addresses**
- Hide address line 2 behind a link. Validate the address and show suggestions prominently. Autocomplete lookups miss apartment numbers. [D] Baymard

**Checkout**
- Guest checkout: forced accounts cause 18 % of abandonments.
- Show total costs early: surprise costs cause 40 %.

  [D] Baymard

## 2. Data tables

- Numbers right-aligned in `tabular-nums`, text left-aligned, headers aligned like their data, nothing centred. Units go in the header, not in each cell. [D] Polaris
- The first column is a human-readable identifier, not an ID. Order columns by importance and keep related ones together. [D] NN/g
- **Wrap rather than truncate** when values share a prefix. Otherwise truncate with a tooltip and the full value in the detail view. [D] Polaris
- **Freeze the header and the first column** when the table is bigger than the viewport. Help rows be tracked with zebra striping, row hover or borders. [D] NN/g
- **Density:** offer 2–3 row heights; Carbon has 5. Header height follows the body rows. [D]
- **Sorting:** a click on the header sorts. The arrow is always visible on the sorted column and appears on hover elsewhere. Set `aria-sort`. [D] Carbon
- **Filtering:**
  - Filters should be discoverable.
  - Show active filters as removable chips and offer "Alle Filter löschen".
  - Allow multi-select within a facet (OR).
  - 28 % of sites show no summary of applied filters.

  [D] NN/g, Baymard
- **Row actions:** an overflow menu (⋯) that is always visible on touch. Hover-reveal is fine on desktop.
- **Bulk actions:** checkbox column plus "select all". A batch bar replaces the toolbar and row actions are disabled while it's shown. [D] Carbon
- **Editing a record:** use a non-modal side panel so the table stays visible, or inline edit for single fields. [D] NN/g
- **Pagination vs infinite scroll vs Load more:**
  - Infinite scroll only suits aimless feeds.
  - Search results: 25–75 per page.
  - E-commerce lists: lazy-load, then "Mehr laden".
  - **Admin and data tables: paginate**, with a page-size option and a total count, because people refer to positions, export data and compare.
  - Restore the scroll position on Back.

  [D] NN/g, Baymard + [I]
- **Responsive:** design the desktop table first, then lock the header and first column. Let users reduce columns or filter before viewing on mobile, or switch to a card list. Never require rotating the device. [D] NN/g
- **Empty states differ by cause** [D] NN/g + [I]:
  - **First use:** explain the value and give a CTA.
  - **No results from filters:** echo the query and offer "Filter zurücksetzen".
  - **Error:** say what failed and offer a retry.
  - Never show "keine Daten" while data is still loading.

## 3. Dashboards

- A dashboard is "a single-screen display of the most important information needed to do a job, designed for rapid monitoring". [D] Stephen Few
- **Every number needs context**: a target, the previous period or a range. Show the delta with sign + arrow + colour, never colour alone. Few's **bullet graph** beats gauges. [D] Few
- **Layout** [I], consistent with Few:
  - **KPI row** at the top: label (muted), value (large, tabular), delta and comparison period, optional sparkline.
  - Trends in the middle; breakdowns and tables below.
  - Most important item at the top left.
  - One global time-range control and an "Stand: …" timestamp.
- **Chart choice:**
  - Length and position are the most accurate encodings, so prefer bars and lines.
  - Avoid gauges, 3D, and pies with more than 5 slices.
  - Colour shows category, not quantity; sequential data uses one hue of varying lightness.
  - No red/green pairs without a second cue.
  - Soft colours for the data, bright only for highlights.

  [D] NN/g, Few. For chart construction, use the `dataviz` skill.
- **Few's pitfalls make a good review list:**
  - more than one screen
  - missing context
  - too much precision (€48.251,37 → €48,3 k)
  - indirect measures
  - meaningless variety of chart types
  - decoration
  - colour overuse
  - poor arrangement

  [D]
- **No vanity metrics.** A metric belongs on the dashboard only if it drives a decision and can't be trivially inflated: retention beats total sign-ups, active use beats downloads. [D]
- **Operational vs analytical:** operational dashboards are live and support decisions within minutes; analytical dashboards are explored more slowly. Design for one of the two. [D] NN/g

## 4. Navigation, search, command palette

- **Navigation visibility:**
  - Never hide primary navigation on desktop. A hamburger cut discoverability by more than 20 % and made users ≥ 39 % slower.
  - On mobile, show up to 4 items directly and use a menu beyond that.

  [D] NN/g
- **Mobile app navigation:**
  - Bottom tab bar with 3–5 destinations. Tabs navigate and never trigger actions.
  - Tabs are always visible and never disabled.
  - Use single-word labels and avoid a "More" tab.
  - On larger screens, use a rail, then a sidebar.

  [D] Apple, Android
- **In-page tabs:**
  - One row; 1–2-word labels, not in all caps.
  - At least two cues for the selected tab.
  - The default tab is the one used most.
  - Never mix navigation tabs with content-switching tabs.

  [D] NN/g
- **Breadcrumbs:**
  - They show hierarchy, not history. The current page comes last and isn't a link.
  - Skip them on flat sites.
  - On mobile, show only the last level or two.

  [D] NN/g
- **Mega menus:**
  - About 0.5 s hover delay before opening, render in under 0.1 s, about 0.5 s delay before closing.
  - Handle diagonal mouse movement.
  - Groups follow the users' mental model.

  [D] NN/g
- **Command palette (⌘K):**
  - Available everywhere with the same shortcut.
  - Covers **every** action.
  - Fuzzy and synonym matching ("lnik" finds "link"; "archive" also matches "done").
  - Ranking uses context without hiding commands.
  - Shows each command's shortcut so people learn it.

  [D] Superhuman, Raycast, Linear
- **More about the palette** [I]:
  - Show recent items first and group results by type.
  - Arrows / Enter / Esc work.
  - It speeds things up but is never the only path to an action.
- **Search autocomplete** [D] Baymard:
  - At most 10 suggestions on desktop and 4–8 on mobile, without a scrollbar.
  - Bold the *predicted* part of each suggestion.
  - Support arrow keys, and copy the highlighted suggestion into the field.
  - Style scope suggestions ("in Rechnungen") differently.
  - Keep the query on the results page and tolerate typos (69 % of sites don't).
- **Scoped search:** the default scope is "Alle". Show the current scope and offer "überall suchen". [D] NN/g
- **Zero results:** echo the query, suggest a spelling fix, broaden the scope, suggest categories, offer contact. [I]

## 5. Feedback & overlays

- **Use a modal** only for critical warnings, irreversible actions, required missing input or a short wizard. Avoid modals for marketing, for interrupting high-stakes flows such as checkout, and for decisions that need information hidden behind the modal. Otherwise use a non-modal panel or inline UI. [D] NN/g
- **Confirmation dialogs:**
  - Only for real consequences; routine confirmations get clicked through.
  - Name the consequence.
  - Buttons say the action: "Rechnung löschen" / "Behalten", not "Ja/Nein".
  - For very risky actions, ask the user to type the resource name.
  - **Prefer undo whenever the action is reversible.**

  [D] NN/g
- **Toasts (sources conflict):** Carbon and Polaris allow them in a narrow way; Primer avoids them for accessibility.
  - **Default rules:**
    - Toasts confirm successful, low-stakes actions in at most about 3 words ("Rechnung gesendet").
    - Never use a toast for errors; use an inline message or a banner.
    - A toast with an action (Undo) stays at least 10 s or doesn't auto-dismiss, and that action must also exist elsewhere on the page.
    - Pause the timer on hover and when the tab is hidden.
    - Use `aria-live="polite"`.

  [D] Polaris, Carbon + [I]
- **Notification ladder** [D] Carbon, NN/g:
  - inline message next to the cause
  - section or page banner
  - global banner (system status)
  - toast (transient success)
  - modal (blocking)

  Pick the least interruptive level that works.
- **Tooltip vs toggletip:**
  - Tooltip: hover or focus, short, non-interactive, only on focusable elements.
  - Toggletip: click, may contain links, closes with Esc.
  - Never put essential information or the only label of an icon button in a tooltip alone; use `aria-label` as well.

  [D] Carbon, Primer
- **Sheets:**
  - One at a time.
  - Medium and large detents with a grabber.
  - Cancel on the leading side, Done on the trailing side.
  - Back or Esc dismisses.
  - Long or complex flows go full-screen.

  [D] Apple, NN/g

## 6. Loading, empty, error, offline, saving

- **Response-time limits:** 0.1 s feels instant; 1 s keeps the flow of thought; 10 s is the limit of attention. [D] NN/g
- **Indicators by duration:**
  - **< 1 s:** no indicator, because a flash is worse than nothing.
  - **1–3 s:** indeterminate indicator, or a skeleton for a full page.
  - **3–10 s:** determinate indicator.
  - **> 10 s:** progress bar with cancel; consider moving the work to the background.
  - Place indicators where the content will appear, and merge adjacent loaders into one.

  [D] NN/g, Primer
- **Skeletons** mirror the final layout. Never use "frame-only" skeletons that show only header and footer. [D] NN/g
- **Degraded experiences:**
  - If secondary content fails, render the page without it and show an inline error.
  - Show a full error page only when the primary content fails.
  - Show system problems in a banner with a status link.
  - Never hide the global header.

  [D] Primer
- **Saving:**
  - Explicit save by default. Autosave only single controls such as toggles and single selects.
  - **Never mix explicit save and autosave on one page.**
  - Warn about unsaved changes with `beforeunload`.
  - Offer undo after saving.

  [D] Primer
- **Optimistic UI** suits likely-to-succeed, low-risk actions (like, reorder, toggle, rename). Roll back with an inline message and Retry. Never use it for payments or destructive actions. [I] / Vercel [D]
- **Offline:**
  - A persistent but non-blocking banner.
  - Cached content stays readable.
  - Queued writes show "ausstehend".
  - Announce when the connection is back.

  [I]

## 7. Onboarding & settings

- **Contextual help beats upfront tutorials.** Card-deck tutorials get skipped and forgotten. Use "pull revelations": small, dismissible tips shown where the feature is. [D] NN/g
- **Progressive disclosure:**
  - Frequent features first, advanced ones on request, with labels that say what's behind them.
  - At most 2 levels.
  - Decide the split from usage data.

  [D] NN/g
- **Checklists:**
  - 3–7 meaningful tasks with progress.
  - Tasks complete automatically when the user does the real action.
  - The checklist can be dismissed and brought back.

  [I]
- **Toggle vs checkbox:**
  - A toggle takes effect immediately and needs no Save button.
  - Checkboxes belong in forms that are submitted.
  - Never put toggles inside a form with a Save button.
  - The label names the thing being switched ("E-Mail-Benachrichtigungen"); it should still read correctly with "an/aus" appended.

  [D] NN/g
- **Settings structure:**
  - A left sub-navigation by category: Profil, Benachrichtigungen, Sicherheit, Abrechnung, Team.
  - Each page saves one way only: either autosaving toggles, or a sticky save bar that appears when something changes.
  - Large settings areas get a search.

  [I]
- **Danger zone** (GitHub-style):
  - A red-bordered section at the very bottom of the page.
  - Each row says what happens and has a secondary destructive button.
  - The confirmation names the consequence and asks for the resource name to be typed.

  [D] Primer, NN/g + [I]

## 8. Marketing, landing & pricing

- **Trust** comes from four things [D] NN/g:
  - design quality (typos and broken links cost credibility)
  - upfront disclosure (price, fees, contact)
  - comprehensive, current content
  - connection to the rest of the web (reviews, press)
- **Hero** [I]:
  - A specific headline: what it is and for whom, in ≤ 8 words.
  - A subline with the outcome or proof.
  - One primary CTA and at most one secondary.
  - A real product visual.
  - Proof directly below it (logos, a metric, a short quote).
- **Social proof** goes next to the claim or CTA it supports: name, role, photo and a concrete result. Specific beats generic. [I]
- **Never auto-advance carousels.** They hurt accessibility, people read them as ads, and each slide is seen only briefly. [D] NN/g
- **Pricing page** [D] Smashing / NN/g:
  - 2–4 plans, with a "recommended" plan highlighted and given the stronger CTA.
  - Monthly/annual toggle at the top, showing the saving.
  - Plan names and prices sticky while the comparison table scrolls.
  - Key differences first, the full comparison in accordions, and a "nur Unterschiede" filter.
  - On mobile, use plan tabs instead of horizontal scrolling.
  - Use tap accordions, not hover tooltips.
- **FAQ** next to pricing: answer the real objections (Kündigung, Daten/DSGVO, Migration, Support). [I]
- **Every section has one job.** The CTA repeats at the end. Keep the footer full: legal, contact, sitemap. [I]

## 9. AI interfaces

AI products are core work for Marcel; this section goes deeper.

**Framework: Microsoft HAX (18 guidelines), as an audit list** [D]:
- Initially:
  1. Make clear what the system can do.
  2. Make clear how well it can do it.
- During interaction:
  3. Time help based on context.
  4. Show contextually relevant information.
  5. Match social norms.
  6. Mitigate social biases.
- When it's wrong:
  7. Support efficient invocation.
  8. Support efficient dismissal.
  9. Support efficient correction.
  10. Scope services when in doubt.
  11. Make clear why the system did what it did.
- Over time:
  12. Remember recent interactions.
  13. Learn from user behaviour.
  14. Update and adapt cautiously.
  15. Encourage granular feedback.
  16. Convey the consequences of user actions.
  17. Provide global controls.
  18. Notify users about changes.

**Pattern vocabulary** [D] Shape of AI:
- **Wayfinders:** examples, suggestions, follow-up prompts.
- **Inputs:** inline actions, regenerate, restyle.
- **Tuners:** attachments, connectors, modes.
- **Governors:** action plans, branching, citations, cost estimates, draft mode, memory, thought streams, variations, verification.
- **Trust builders:** caveats, consent, disclosure markers.
- **Identifiers:** avatar, colour, name.

**Rules**

- **Start states:**
  - Use specific, context-aware openers, not "Wie kann ich helfen?".
  - Offer 3–4 prompt suggestions as chips next to the input. They should be curated, specific and match the user's expertise.

  [D] NN/g
- **Streaming:**
  - **Don't auto-scroll long answers.** Keep the start of the new message in view and offer a "jump to latest" button.
  - Use progressive disclosure for long outputs.

  [D] NN/g
- **Status model:** `submitted` → `streaming` → `ready | error` (Vercel AI SDK).
  - A **Stop** button replaces Send while submitted or streaming.
  - "Regenerate" is available from ready or error.
  - Errors show a generic message with Retry and no stack traces.

  [D]
- **Progress messages:** say what is happening ("Fasse die Kernthemen deiner Notizen zusammen…"), not "Verarbeite…". [D] Apple HIG
- **Agents:**
  - Show a live step list: the current step, the tools and sources in use, elapsed time.
  - Ask clarifying questions *before* long runs.
  - Long silent waits and unexplained breadth ("96 Quellen") erode trust.

  [D] NN/g + [I]
- **Tool calls:**
  - Render each tool part by its state: `input-streaming`, `input-available`, `approval-requested`, `output-available`, `output-error`, `output-denied`. Handle every state.
  - Collapsed row: tool name, one-line summary of the arguments, status. Expand to see full input and output.

  [D] AI SDK + [I]
- **Human-in-the-loop:**
  - Every external side effect (sending, paying, deleting, publishing) needs an **approval card**.
  - The card shows: what will happen, the target, the consequence, Approve / Ablehnen, and an optional reason.
  - Never automate deletions or purchases.

  [D] Apple + [I]
- **Correction:**
  - Edit, Undo, Retry and Adjust sit next to the output.
  - Acknowledge when a correction took effect.
  - Offer alternative versions.
  - When output is blocked, coach the user toward a request that will work.

  [D] Apple HIG
- **Branching:**
  - Editing an earlier user message forks the conversation.
  - Earlier versions stay navigable (‹ 1/3 ›).
  - Never overwrite silently.

  [I] / Shape of AI
- **Citations:**
  - Inline, next to the claim, labelled by source title, deep-linked.
  - Users rarely click them, so citations alone can create false confidence.
  - Don't present "reasoning" displays as proof; they are often not faithful to what the model did.

  [D] NN/g
- **Uncertainty:**
  - Show confidence only if it changes what the user decides.
  - Prefer categories (hoch/mittel/niedrig) with guidance, or alternatives, over raw percentages.
  - Raise the level of automation only after trust is earned.

  [D] PAIR
- **Disclosure and feedback:**
  - Mark where AI is used.
  - Thumbs up/down plus optional detail, always voluntary.
  - Put caveats near the input with an action ("Zahlen vor dem Versand prüfen"), not in the footer.
  - Always provide a non-AI fallback path.

  [D] Apple, NN/g

## 10. Mobile apps (Expo)

- **Grip:** one hand 49 %, cradled 36 %, two thumbs 15 %, and grips change constantly. Put primary and frequent actions in the lower half and keep destructive ones out of easy reach. [D] Hoober + [I]
- **Targets:** 44 pt on iOS, 48 dp on Android with 8 dp spacing. [D]
- **Gestures supplement visible controls and never replace them.** Keep the Back button even when edge-swipe works. Swipe-to-delete also needs a menu path. Don't fight the system edge gestures. [D] Apple
- **Sheets over full-screen modals** for short tasks, with a grabber, detents and a visible close.
- **Pull-to-refresh** for feeds, plus auto-refresh.
- **Haptics:** use system patterns only for their documented meaning, as a complement to visual feedback, and sparingly. The best haptics go unnoticed until they're missing. [D] Apple
- **Mobile forms:** labels on top, the right keyboard, autocorrect off for names, a visible search submit button. [D] Baymard

## Sources

**Forms, errors, input**
- NN/g: https://www.nngroup.com/articles/web-form-design/ · https://www.nngroup.com/articles/form-design-placeholders/ · https://www.nngroup.com/articles/required-fields/ · https://www.nngroup.com/articles/errors-forms-design-guidelines/ · https://www.nngroup.com/articles/error-message-guidelines/ · https://www.nngroup.com/articles/wizards/ · https://www.nngroup.com/articles/date-input/
- GOV.UK: https://design-system.service.gov.uk/components/error-message/ · https://design-system.service.gov.uk/components/error-summary/ · https://design-system.service.gov.uk/patterns/question-pages/ · https://design-system.service.gov.uk/patterns/dates/ · https://design-system.service.gov.uk/components/button/ · https://design-system.service.gov.uk/components/text-input/
- Wroblewski, inline validation: https://alistapart.com/article/inline-validation-in-web-forms/
- Baymard: https://baymard.com/blog/inline-form-validation · https://baymard.com/blog/form-field-usability-matching-user-expectations · https://baymard.com/blog/mobile-touch-keyboards · https://baymard.com/blog/password-requirements-and-password-reset · https://baymard.com/blog/checkout-flow-average-form-fields · https://baymard.com/lists/cart-abandonment-rate · https://baymard.com/blog/autocomplete-design · https://baymard.com/research-articles/external-article-state-of-ecommerce-filters

**Tables, dashboards, navigation**
- NN/g: https://www.nngroup.com/articles/data-tables/ · https://www.nngroup.com/articles/mobile-tables/ · https://www.nngroup.com/articles/infinite-scrolling-tips/ · https://www.nngroup.com/articles/empty-state-interface-design/ · https://www.nngroup.com/articles/dashboards-preattentive/ · https://www.nngroup.com/articles/hamburger-menus/ · https://www.nngroup.com/articles/tabs-used-right/ · https://www.nngroup.com/articles/breadcrumbs/ · https://www.nngroup.com/articles/mega-menus-work-well/ · https://www.nngroup.com/articles/scoped-search/
- Design systems: https://carbondesignsystem.com/components/data-table/usage/ · https://polaris-react.shopify.com/components/tables/data-table
- Stephen Few: https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf · https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf
- Superhuman, command palette: https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/

**Overlays, feedback, states, settings**
- NN/g: https://www.nngroup.com/articles/modal-nonmodal-dialog/ · https://www.nngroup.com/articles/confirmation-dialog/ · https://www.nngroup.com/articles/indicators-validations-notifications/ · https://www.nngroup.com/articles/response-times-3-important-limits/ · https://www.nngroup.com/articles/skeleton-screens/ · https://www.nngroup.com/articles/onboarding-tutorials/ · https://www.nngroup.com/articles/progressive-disclosure/ · https://www.nngroup.com/articles/toggle-switch-guidelines/ · https://www.nngroup.com/articles/bottom-sheet/
- Carbon and Polaris: https://carbondesignsystem.com/components/notification/usage/ · https://carbondesignsystem.com/components/toggletip/usage/ · https://polaris-react.shopify.com/components/deprecated/toast
- Primer: https://primer.style/product/ui-patterns/loading · https://primer.style/product/ui-patterns/degraded-experiences/ · https://primer.style/product/ui-patterns/saving · https://primer.style/product/ui-patterns/forms · https://primer.style/product/ui-patterns/notification-messaging
- Apple: https://developer.apple.com/design/human-interface-guidelines/sheets · https://developer.apple.com/design/human-interface-guidelines/tab-bars

**Marketing**
- NN/g: https://www.nngroup.com/articles/trustworthy-design/ · https://www.nngroup.com/articles/auto-forwarding/
- Pricing pages: https://smashingmagazine.com/2022/07/designing-better-pricing-page

**AI interfaces**
- Microsoft HAX: https://www.microsoft.com/en-us/haxtoolkit/library/pattern/
- Shape of AI: https://www.shapeof.ai/
- NN/g: https://www.nngroup.com/articles/ai-chatbots-design-guidelines/ · https://www.nngroup.com/articles/designing-use-case-prompt-suggestions/ · https://www.nngroup.com/articles/explainable-ai/
- Google PAIR: https://pair.withgoogle.com/chapter/explainability-trust/
- Apple HIG, generative AI: https://developer.apple.com/design/human-interface-guidelines/generative-ai
- Vercel AI SDK: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot · https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

**Mobile**
- Hoober, how users hold phones: https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php
- Apple gestures: https://developer.apple.com/design/human-interface-guidelines/gestures
- Apple haptics: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
