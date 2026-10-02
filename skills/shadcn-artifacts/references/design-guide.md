# Design guide

How to compose a page from the components so it reads like a well-made shadcn app, not like a component dump. Read this before building anything larger than a single card. Markup for each component: `components.md`.

## 1. Principles

1. **One job per page.** The header states it: title, one-sentence description, the primary action on the right. If you can't write the description, the page has no clear job yet.
2. **Summary before detail.** Top to bottom: key numbers → trend → breakdown → raw records. A reader who stops after the first screen should still have the answer.
3. **Hierarchy from type and space, not from boxes.** Use a card only for a self-contained object (a metric, a chart, a form, a settings group). Never nest cards. Sections inside a card are separated by spacing or `.separator`, not by another border.
4. **Spacing rhythm on a 4 px grid.** Inside a component `gap-2`/`gap-3` (8–12 px); between related groups `gap-4`/`gap-6` (16–24 px); between page sections `gap-8`/`gap-12` (32–48 px). Spacing comes from `.stack`/`.row`/`.grid` gaps — no margins on children.
5. **A small type scale.** Page title `.h2` without border (dense tools: `.h3`), section title `.h4` or `.text-lg .font-semibold`, UI text `.text-sm`, secondary text `.muted`, prose 16 px in `.prose`. Numbers in columns and KPIs get `.tabular`.
6. **Neutral base, one accent, semantic colours only for state.** Brand colour goes into `--primary` (or `data-accent`). `--success`/`--warning`/`--destructive`/`--info` only for status. Charts use `--chart-1…5`. Never let colour be the only signal — pair it with text or an icon.
7. **Width follows content.** App pages: `.page` (72 rem). Forms: 28–40 rem column. Reading text: `.prose` (65 ch). Don't stretch a two-field form across a wide screen.
8. **Left-aligned by default.** Centre only empty states, single-purpose cards (login) and hero headlines.
9. **Real content.** Plausible names, amounts, dates; German formatting when `lang="de"`. Mark sample data as sample. Never lorem ipsum, never emoji as icons.
10. **Every data view has its states.** Empty (`.empty` with the next step), loading (`.skeleton` in the final shape, or a spinner in the button that triggered it), error (`.alert[data-variant="destructive"]` with what happened and what to do).

## 2. Choosing the right component

### Picking a value

| Situation | Use | Why |
|---|---|---|
| 2–5 options, user should see all at once | **Radio Group** (`.radio`), or `label.field-card` radios for plans/tiers | No click to reveal; comparison at a glance |
| 2–4 short options that switch a view or filter | **Toggle Group** `data-type="single"` (e.g. 7 / 30 / 90 Tage) | Compact, immediate |
| Switching between content panels | **Tabs** | Panels, not values |
| On/off that applies immediately | **Switch** | Settings semantics |
| On/off inside a form submitted later | **Checkbox** | Form semantics |
| 5–15 options, desktop-first | **Select** (`.select-trigger` + `role="listbox"`) | shadcn look, check mark, groups |
| Long form on mobile, or options from data | **Native Select** (`select.select`) | System picker on phones, zero JS |
| More than ~15 options, or the user knows what to type | **Combobox** | Search beats scrolling |
| Several values from a list | Checkboxes (≤8) or a dropdown with `menuitemcheckbox` | Select/Combobox here are single-value |
| An **action**, not a value ("Exportieren", "Löschen") | **Dropdown Menu** | Never use a Select for actions |

Labels: Select placeholder states the task ("Zeitzone wählen"), options are nouns in sentence case, group long lists with `.menu-label` headings, keep the current value visible in the trigger.

### Dates

| Situation | Use |
|---|---|
| One date inside a form (Fälligkeit, Termin) | **Date Picker** single; trigger shows the formatted date, placeholder "Datum wählen" |
| Reporting period | **Date Picker** `data-mode="range" data-months="2"`, plus a Toggle Group or Select with presets (Letzte 7 Tage / 30 Tage / Quartal) next to it — presets cover 90 % of use |
| Scheduling where the month view is the content | Inline **Calendar** in a card, with the day's items next to or below it |
| Date far in the past (Geburtsdatum) | Native `<input type="date" class="input">` or three Native Selects — paging a calendar back 40 years is hostile |
| Only certain dates valid | `data-min` / `data-max` on the calendar |

Format dates for humans: "2. Oktober 2026" in text and triggers, "02.10.2026" in tables, relative ("vor 3 Tagen") only for activity feeds.

### Overlays

| Situation | Use |
|---|---|
| Confirm something destructive or irreversible | **Alert Dialog** — title as a question ("Projekt löschen?"), consequence in the description, destructive button names the verb ("Endgültig löschen"), cancel left of it |
| Short focused task, 2–5 fields | **Dialog** |
| Longer form or record details while keeping the list visible | **Sheet** `data-side="right"` |
| Actions or a small form on phones | **Drawer** |
| Small inline settings next to their trigger | **Popover** |
| Name of an icon-only button | **Tooltip** — always, plus `aria-label` |
| Preview of a linked person/item | **Hover Card** (never the only way to reach information) |

### Feedback

| Situation | Use |
|---|---|
| Result of the user's action | **Toast**, past tense ("Rechnung gesendet"), optional undo action; errors as `toast.error` with the reason |
| Condition that stays true on this page | **Alert** at the top of the affected area |
| Problem with one field | `.field[data-invalid]` + `aria-invalid="true"` + `.field-error` replacing the description |
| Something is loading | Skeleton in the final layout; spinner only inside the button that started it (and disable it) |

### Showing records

| Situation | Use |
|---|---|
| Up to ~10 rows, read-only | **Table** with `.num` for numbers and a `tfoot` total if sums matter |
| Many rows, user filters/sorts/selects | **Data Table**, `data-page-size="10"`, filter on the most identifying column, row actions in a ghost icon button with a dropdown |
| Entities with an action each (members, integrations) | **Item** group with `.item-separator` |
| One key number | Stat card: muted label, big `.tabular` number, delta badge, one-line context in the footer |
| Status of a row | **Badge** (`success`/`warning`/`destructive`/`secondary`) with a word, optional icon |

### Navigation

| Situation | Use |
|---|---|
| App with 5+ areas | **Sidebar** (`data-variant="inset"` looks most like current shadcn apps) |
| 2–5 sibling views on one page | **Tabs** |
| Deep hierarchy | **Breadcrumb** in the page header |
| Optional detail, FAQ | **Accordion** |
| Website header | **Navigation Menu** |
| Long result lists | **Pagination** (or the Data Table's own paging) |

## 3. Charts

**Pick the type from the question:**

| Question | Type | Notes |
|---|---|---|
| How does it develop over time? | `area` (volume) or `line` (rates, comparing series) | `dots: true` for ≤ 8 points |
| Which category is biggest? | `bar` | ≤ 12 bars; sort descending unless the order is natural (months, steps) |
| How is a total composed, over time? | `bar` with `stacked: true` | ≤ 4 segments |
| How is a total composed, once? | `donut` | ≤ 5 slices — more becomes a sorted bar chart; put the total in the centre (`centerLabel`) |
| What is the one number? | No chart — a stat card | |

**Rules**

- Every chart sits in a card: `.card-title` says *what* ("Umsatz nach Produkt"), `.card-description` the *period and unit* ("Januar – Juni 2026, in Euro"), `.card-footer` one sentence of *insight* ("Wartung wächst seit März jeden Monat"). The chart without that sentence leaves the reader to do the analysis.
- At most 3–4 series. To emphasise one series, give the others `"color": "var(--muted-foreground)"`.
- Format numbers through `format` (Intl options): `{"style":"currency","currency":"EUR","maximumFractionDigits":0}`, `{"style":"percent"}` with values as fractions, `{"maximumFractionDigits":1}` for rates.
- Short axis labels: "Jan", "KW 36", "Q3". Put the unit in the description, not on every tick.
- Height 220–280 px; `"height"` in the config. Two charts side by side: `.grid` with `--min: 22rem` so they stack on phones.
- Never mix two units on one axis — make two charts.
- Charts are data, so the data must be real or clearly marked as an example.

```html
<div class="card">
  <div class="card-header"><div class="card-title">Umsatz nach Produkt</div><div class="card-description">Januar – Juni 2026, in Euro</div></div>
  <div class="card-content">
    <figure class="chart"><script type="application/json">
      {"type":"area","stacked":true,"labels":["Jan","Feb","Mär","Apr","Mai","Jun"],
       "series":[{"name":"Websites","data":[12400,15800,14200,18900,21300,24100]},{"name":"Wartung","data":[4200,4300,4300,4600,4700,4900]}],
       "format":{"style":"currency","currency":"EUR","maximumFractionDigits":0}}
    </script></figure>
  </div>
  <div class="card-footer text-sm"><span class="font-medium">Wartung wächst seit März jeden Monat.</span></div>
</div>
```

## 4. Forms

- **One column**, label above the control, description below it, error replaces the description. Two columns only for pairs that belong together (PLZ + Ort, Monat + Jahr) via `.grid` with a small `--min`.
- **Group** with `.fieldset` + `.field-legend`; separate groups with `.field-group` spacing, alternatives with `.field-separator` ("oder").
- **Size inputs to their content**: PLZ, CVV, Menge narrow; E-Mail, Name full width of the column.
- **Mark the exception**: if most fields are required, mark the optional ones ("optional" in `.muted`), not the required ones.
- **One primary button per view**, labelled with the outcome ("Konto anlegen", "Rechnung senden" — never "OK"/"Absenden"). Secondary actions `outline` or `ghost`. In cards and dialogs the actions sit in the footer; on a plain page under the last field, left-aligned with it.
- **Defaults**: pre-select the most likely option, pre-fill what you know.
- **Submit** in artifacts: `preventDefault()`, validate, set `aria-invalid` + `.field-error` on problems, otherwise close the dialog and show a toast.

## 5. Page blueprints

Compose from these; adapt, don't pad. Each is valid markup for the template's `<main class="page">`.

**Page header** (every page)
```html
<header class="row between gap-4">
  <div class="stack gap-1"><h1 class="h2" style="border: 0; padding: 0">Übersicht</h1><p class="muted text-sm">Umsatz, Projekte und offene Rechnungen im Oktober.</p></div>
  <div class="row gap-2"><button class="button" data-variant="outline"><i data-icon="download"></i>Export</button><button class="button"><i data-icon="plus"></i>Neues Projekt</button></div>
</header>
```

**Dashboard** — header → 3–4 stat cards → main chart (wide) + secondary chart/list → recent records
```html
<div class="stack gap-8">
  <!-- header -->
  <section class="grid" style="--min: 13rem">
    <div class="card" data-size="sm">
      <div class="card-header"><div class="card-description">Umsatz Oktober</div><div class="card-title tabular" style="font-size: 1.75rem">48.230 €</div><div class="card-action"><span class="badge" data-variant="success">+12,5 %</span></div></div>
      <div class="card-footer text-sm muted">gegenüber September</div>
    </div>
    <!-- 2–3 weitere Kennzahlen -->
  </section>
  <section class="grid" style="--min: 22rem">
    <!-- Chart-Karte (siehe oben), daneben z. B. Item-Liste "Nächste Termine" -->
  </section>
  <section class="stack gap-4">
    <h2 class="h4">Letzte Rechnungen</h2>
    <!-- Table oder Data Table -->
  </section>
</div>
```

**Settings** — tabs (or a left nav on wide pages) → one card per topic, save in each card's footer
```html
<div class="tabs" style="max-width: 40rem">
  <div class="tabs-list"><button class="tabs-trigger" data-value="profile">Profil</button><button class="tabs-trigger" data-value="notifications">Benachrichtigungen</button></div>
  <div class="tabs-content" data-value="profile">
    <form class="card" data-settings-form>
      <div class="card-header"><div class="card-title">Profil</div><div class="card-description">So sehen dich Kunden im Portal.</div></div>
      <div class="card-content field-group">…fields…</div>
      <div class="card-footer bordered" style="justify-content: flex-end"><button class="button">Speichern</button></div>
    </form>
  </div>
  <div class="tabs-content" data-value="notifications">…switch rows as label.field-card…</div>
</div>
```

**Records** — toolbar (filter, columns, primary action) → data table → detail in a sheet. Filter and paging controls must sit inside `.data-table`, that is how they are wired. Include `[data-table-selected]` only when rows have selection checkboxes, and paging only when there can be more rows than `data-page-size`.
```html
<div class="data-table" data-page-size="10">
  <div class="data-table-toolbar">
    <input class="input" placeholder="Kunde suchen …" data-table-filter="1" aria-label="Kunde suchen">
    <span class="grow"></span>
    <button class="button" data-variant="outline" popovertarget="cols">Spalten<i data-icon="chevron-down"></i></button>
    <div popover id="cols" class="menu" data-align="end">…menuitemcheckbox mit data-table-column…</div>
    <button class="button" data-open="new-invoice"><i data-icon="plus"></i>Rechnung</button>
  </div>
  <div class="table-bordered table-wrap"><table class="table">…</table></div>
  <div class="data-table-footer"><span data-table-selected></span><div class="row gap-2"><span data-table-page></span>…Zurück/Weiter…</div></div>
</div>
<dialog id="new-invoice" class="sheet" data-side="right">…</dialog>
```

**Report / document** — `.prose` for the narrative, charts and tables as figures between paragraphs, a short summary up front
```html
<article class="prose">
  <p class="lead" style="color: var(--muted-foreground)">Der Relaunch hat die Ladezeit halbiert und die Anfragen um ein Drittel erhöht.</p>
  <h2>Ladezeit</h2>
  <p>…</p>
</article>
<div class="card" style="max-width: 65ch">…chart…</div>
```

## 6. Copy and formatting

- Sentence case everywhere ("Neues Projekt", not "Neues Projekt Anlegen"). Uppercase only for tiny eyebrow labels (`.text-xs` + letter-spacing).
- Buttons are verbs, toasts are past tense, errors say what happened and what to do.
- Numbers: `toLocaleString("de-DE")`, currency "1.250,00 €", percent "12,5 %" (non-breaking space), right-aligned and `.tabular` in tables.
- Keep IDs, codes and e-mails in `.mono` only where users copy them; add a `data-copy` button there.
- Empty state text: what is missing + how to add the first one ("Noch keine Rechnungen. Lege die erste an oder importiere aus Lexoffice.").

## 7. Accessibility checklist

- Every control has a visible label or `aria-label`; every icon-only button also gets `data-tooltip`.
- Status never by colour alone — badge text or icon.
- Don't remove focus rings; keep `:focus-visible` styles.
- Dialogs: `aria-labelledby` pointing at the title; alert dialogs `role="alertdialog"`.
- Form controls get stable `id`s; error text linked via `aria-describedby`.
- Test at 390 px: nothing scrolls sideways except tables in `.table-wrap`.

## 8. Anti-patterns

- **Card soup** — every block in an identical card. Use cards for objects, whitespace for grouping.
- **Several primary buttons** in one view.
- **Select for actions**, **dropdown menu for values**.
- **Charts without title, period, unit or takeaway**; pie/donut with more than 5 slices; two units on one axis.
- **Everything centred**, or a 100vh hero on a tool page.
- **Tooltips that hold essential information** (unreachable on touch).
- **Literal colours** in page CSS — use tokens so dark mode keeps working.
- **Nested scroll areas** and fixed heights on content that can grow.
- **Placeholder as label** — placeholders disappear when typing.
- **Fake precision** — "48.231,47 €" in a KPI where "48.230 €" is what matters.
