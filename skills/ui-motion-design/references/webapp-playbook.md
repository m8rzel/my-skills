# Webapp playbook — product UIs people use every day

Web apps are judged by **speed, clarity and trust over repeated use**, not by first impression. Rules for individual components are in `ui-patterns.md`; visual craft in `ui-craft.md`; what premium products do in `product-ui-teardowns.md`. Reference build: `examples/premium-ui.html`.

## 1. Pick the shell first (`data/patterns.json` → `webapp`)

| Shell | When | Key rules |
|---|---|---|
| **Sidebar shell** | most B2B SaaS, admin, CRM | collapsible sidebar (workspace switcher top, primary nav, secondary nav, user bottom); topbar with breadcrumbs + ⌘K + page actions; content max-width for forms/settings, fluid for data |
| **List ↔ detail** | records (invoices, tickets, contacts) | filters + table/list; detail in a **non-modal side panel** or its own route; `j/k` to move, `Enter` to open, `Esc` to close; URL reflects the open record |
| **Inbox / triage** | messages, approvals, support | three panes; bulk actions; single-key actions (e archive, r reply); undo toast after each action |
| **Dashboard home** | overviews | KPI row with context → trends → breakdowns → activity; one global date range; "Stand: …" |
| **Editor / canvas** | builders, design, CMS | canvas full-bleed; floating toolbars (glass ok); inspector right, layers left; autosave + version history |
| **Wizard** | setup, applications | one question per step, progress x/y, back link, save & resume |
| **Settings** | every app | left sub-nav by category; one save model per page; danger zone at the bottom |
| **Chat / agent** | assistants, copilots | conversation ≤ 760 px wide, composer pinned, artifacts in side panel, step list + approvals inline |
| **Mobile tabs (Expo)** | consumer/companion apps | 3–5 bottom tabs, stack per tab, sheets for short tasks |

## 2. Information architecture

- **Objects first**: list the nouns (Kunde, Rechnung, Projekt) and their relationships before screens. Navigation = top-level objects + "Home/Inbox" + Settings.
- **Max ~7 primary nav items**; group the rest; put rarely used items in Settings or ⌘K.
- **Every object has a canonical URL**; filters, tabs, sort, open panels live in the URL (shareable, back button works).
- **Workspaces/teams**: switcher at the top of the sidebar; current workspace always visible; role-aware UI (hide what you can't do, or explain why it's locked — never silently disable).

## 3. Speed is the feature

- Feedback < 100 ms for every interaction; **optimistic updates** for likely-success, low-risk actions (rename, toggle, reorder, archive) with rollback + inline error.
- **No spinner flicker**: show after 150–300 ms, keep ≥ 300–500 ms; skeletons mirror final layout; keep previous data visible while refetching (stale-while-revalidate).
- **Prefetch** on hover/viewport for likely next routes; preload detail data when a row gets focus.
- **Local-first or cache-first** where "instant" is the brand (Linear-style); otherwise good caching (TanStack Query, SWR, RSC + `use cache`).
- Long tasks (> 10 s) run in the background with a progress toast/notification and a place to find results.

## 4. Density & layout

- **Default comfortable, offer compact** for data views (row 44 → 36/32 px). Persist the user's choice.
- **Tables**: right-aligned tabular numbers, sticky header, column visibility, saved views, bulk bar replaces toolbar on selection, row menu always reachable on touch (rules: `ui-patterns.md` §2).
- **Side panels over modals** for viewing/editing records; modals only for short, blocking decisions.
- **Forms in apps**: inline edit for single fields, side sheet for medium forms, full page for large ones; autosave with visible "Gespeichert ✓" *or* explicit Save bar — never both on one page.
- **Empty states** teach the first action (button), filter-empty states offer "Filter zurücksetzen", error states say what failed + Retry.

## 5. Keyboard & power users

- **⌘K palette** covering every action and object (fuzzy + synonyms, recent first, shortcuts shown).
- **`?` shortcut sheet**; shortcuts visible in menus and tooltips ("Archivieren E").
- Two-key navigation for sections (G then R = Rechnungen); `/` focuses search; `Esc` closes the topmost layer.
- **Focus management**: opening a panel moves focus into it; closing restores focus; route changes move focus to the page heading.
- Never animate keyboard-initiated actions (instant or ≤ 100 ms opacity).

## 6. Feedback, safety, trust

- **Undo over confirm** for reversible actions (toast with "Rückgängig", ≥ 6–10 s, pause on hover/hidden tab).
- **Confirm only irreversible** actions: name the consequence, action-labelled buttons, type-to-confirm for high-risk.
- **Status visibility**: saving/sync indicator, offline banner, background job progress, "zuletzt geändert von … vor 2 Min."
- **Collaboration**: presence avatars, live cursors only where it helps, conflict handling ("Diese Rechnung wurde von Lisa geändert — neu laden / meine Änderungen behalten").
- **Notifications**: in-app inbox for things that need action; toasts only for confirmations; email digests configurable per type.
- **Errors**: inline next to the cause; degrade per widget instead of whole-page failure; never lose user input.

## 7. Onboarding & activation

- Get the user to the **first meaningful result** fast (import, template, sample data clearly labelled "Beispiel").
- Checklist with 3–7 real tasks that complete automatically; dismissible, recoverable.
- Contextual tips at the feature ("pull revelations"), not a 6-slide tour.
- Empty states double as onboarding.

## 8. Billing, account, admin pages

- **Billing**: current plan, usage vs limit (with forecast), next invoice date/amount, invoices list (download PDF), payment method, upgrade/downgrade with prorating explained, cancel without dark patterns.
- **Team**: members table (role, last active), invite by email with role, pending invites, transfer ownership in danger zone.
- **Security**: sessions/devices, 2FA, API keys (show once, copy, revoke), audit log.
- **Data**: export (CSV/JSON), import with preview + mapping + dry run, delete account with clear consequences.

## 9. AI inside apps (see `ui-patterns.md` §9)

- Put AI **where the work is** (inline suggestions, a side panel with context), not only in a separate chat page.
- Status model submitted → streaming → ready/error; Stop/Retry; specific progress text.
- Agent steps visible; **approval cards for side effects**; citations to the user's own records; undo for AI edits.
- Label AI-generated content; keep a non-AI path.

## 10. Visual system for apps

- Style: usually **Calm Product** or **Data-Dense** (see `style-catalog.md`); marketing site may be more expressive than the app — that's fine and common.
- Chrome calm, content loud: dimmed sidebar, hairline separators, colour only for meaning/state.
- One control-height set (32/36/40), one radius scale (concentric), one icon set (16/20 px).
- Motion: calm level — origin-aware popovers, FLIP for lists, springs for layout, nothing decorative.

## 11. Mobile apps (Expo/React Native)

- Bottom tabs 3–5; sheets with detents for short tasks; gestures always with visible alternatives.
- Thumb zone for primary actions; 44 pt targets; safe areas.
- Optimistic UI + offline queue; pull-to-refresh on lists.
- Haptics on commit (success, destructive confirm), not on every tap.
- Reanimated springs from `tokens.ts`; `ReduceMotion.System`.

## 12. Webapp QA

- `audit.mjs` on key screens (list, detail, settings, empty state) → 0 errors/warnings.
- Keyboard-only run through the main flow; focus visible and restored.
- Throttle network (Slow 4G) and CPU (4×): skeletons, optimistic updates, no flicker.
- Long content (very long names, 0 / 1 / 10.000 rows), permissions (viewer/admin), errors (500, offline).
- Light + dark + 200 % zoom.
