# Component reference

Minimal markup per component. Full, working versions of each live in `examples/components.src.html` under `<section id="<name>">`. `<i data-icon="…">` takes any Lucide icon name.

## Actions

**Button** — `data-variant`: secondary · destructive · outline · ghost · link; `data-size`: sm · lg · icon · icon-sm · icon-lg
```html
<button class="button">Save</button>
<button class="button" data-variant="outline" data-size="sm"><i data-icon="plus"></i>Add</button>
<button class="button" data-variant="ghost" data-size="icon" aria-label="More"><i data-icon="ellipsis"></i></button>
<button class="button" disabled><i data-icon="loader-circle" class="spinner"></i>Saving</button>
<a class="button" data-variant="link" href="#">Link</a>
```

**Button Group** — `data-orientation="vertical"`, `.button-group-text`, `.button-group-separator`
```html
<div class="button-group" role="group"><button class="button" data-variant="outline">Archive</button><button class="button" data-variant="outline">Report</button></div>
```

**Toggle / Toggle Group** — `aria-pressed`; group `data-type="single|multiple"`; `data-variant="outline"`, `data-size="sm|lg"`
```html
<button class="toggle" aria-label="Bold"><i data-icon="bold"></i></button>
<div class="toggle-group" data-type="single" data-variant="outline">
  <button class="toggle" data-variant="outline" data-value="left" aria-pressed="true"><i data-icon="align-left"></i></button>
  <button class="toggle" data-variant="outline" data-value="right"><i data-icon="align-right"></i></button>
</div>
```

## Display

**Badge** — variants secondary · destructive · outline · success · warning; `.pill`, `.tabular`
```html
<span class="badge" data-variant="success"><i data-icon="circle-check"></i>Paid</span>
```

**Card** — `.card-action` sits top right; `data-size="sm"`; `.card-header.bordered`, `.card-footer.bordered`
```html
<div class="card">
  <div class="card-header"><div class="card-title">Title</div><div class="card-description">Description</div><div class="card-action">…</div></div>
  <div class="card-content">…</div>
  <div class="card-footer"><button class="button">Save</button></div>
</div>
```

**Alert** — `data-variant="destructive"`; icon optional
```html
<div class="alert"><i data-icon="info"></i><div class="alert-title">Heads up</div><div class="alert-description">Text.</div></div>
```

**Avatar** — `data-size="sm|lg"`, `.rounded-lg`, `.avatar-group`; images only as data: URI in artifacts
```html
<span class="avatar"><span class="avatar-fallback">JB</span></span>
```

**Item** — `data-variant="outline|muted"`, `data-size="sm"`; media `data-variant="icon|image"`; `.item-group`, `.item-separator`; `<a class="item">` is clickable
```html
<div class="item" data-variant="outline">
  <div class="item-media" data-variant="icon"><i data-icon="shield"></i></div>
  <div class="item-content"><div class="item-title">Two-factor</div><p class="item-description">Text</p></div>
  <div class="item-actions"><button class="button" data-variant="outline" data-size="sm">Set up</button></div>
</div>
```

**Empty**
```html
<div class="empty"><div class="empty-header"><div class="empty-media" data-variant="icon"><i data-icon="folder"></i></div><div class="empty-title">No projects</div><p class="empty-description">Text</p></div><div class="empty-content"><button class="button">Create</button></div></div>
```

**Kbd** — `<kbd class="kbd">⌘</kbd>`, group in `.kbd-group`.
**Separator** — `<hr class="separator">`, vertical: `<div class="separator" data-orientation="vertical"></div>`.
**Skeleton** — `<div class="skeleton" style="height:1rem;width:12rem"></div>`.
**Spinner** — `<i data-icon="loader-circle" class="spinner"></i>`.
**Progress** — `<div class="progress" role="progressbar" aria-valuenow="60" style="--value:60%"></div>`.
**Aspect Ratio** — `<div class="aspect-ratio" style="--ratio:16/9"><img src="data:…" alt=""></div>`.
**Scroll Area** — `<div class="scroll-area" style="height:18rem">…</div>`.

**Typography** — `.h1 .h2 .h3 .h4 .lead .large .small .muted .blockquote .list .inline-code`, or wrap raw HTML in `<article class="prose">`.

**Table** — numbers right-aligned with `.num`; wrap for horizontal scroll; `.table-bordered` for a framed table
```html
<div class="table-wrap"><table class="table"><caption>…</caption><thead><tr><th>Invoice</th><th class="num">Amount</th></tr></thead><tbody><tr><td>R-01</td><td class="num">250,00 €</td></tr></tbody><tfoot><tr><td>Total</td><td class="num">250,00 €</td></tr></tfoot></table></div>
```

**Chart** — JSON config; `type`: bar · line · area · donut · pie; `stacked`, `dots`, `height`, `format` (Intl.NumberFormat options), `legend:false`, `yAxis:false`, `centerLabel`/`centerValue` (donut), `colors` (donut), per-series `color`
```html
<figure class="chart"><script type="application/json">
{"type":"bar","labels":["Jan","Feb","Mär"],"series":[{"name":"Desktop","data":[186,305,237]},{"name":"Mobil","data":[80,200,120]}],"format":{"maximumFractionDigits":0}}
</script></figure>
```

## Forms

```html
<div class="field"><label class="label" for="email">E-Mail</label><input class="input" id="email" type="email"><p class="field-description">Hint</p></div>
<div class="field" data-invalid><label class="field-label" for="card">Card</label><input class="input" id="card" aria-invalid="true"><p class="field-error">Error</p></div>
<textarea class="textarea" id="msg"></textarea>
<select class="select" id="tz"><option>Europe/Berlin</option></select>
<label class="label"><input type="checkbox" class="checkbox" id="terms">Accept</label>
<label class="label"><input type="checkbox" role="switch" class="switch" id="wifi">Wi-Fi</label>
<div class="radio-group" role="radiogroup"><label class="label"><input type="radio" class="radio" name="d" checked>Default</label></div>
<label class="field-card"><input type="radio" class="radio" name="plan">…</label>       <!-- choice card -->
<input type="range" class="slider" id="vol" min="0" max="100" value="40" data-output="vol-out" data-suffix=" %">
```
Structure: `.fieldset` + `.field-legend`, `.field-group`, `.field-separator` (text in the middle), `.field[data-orientation="horizontal"]`.

**Input Group**
```html
<div class="input-group"><span class="input-group-addon"><i data-icon="search"></i></span><input class="input" placeholder="Search"><span class="input-group-addon"><kbd class="kbd">⌘K</kbd></span></div>
```

**Input OTP** — fires `otp:complete`; `data-pattern` (regex for one char, default digits)
```html
<div class="otp"><div class="otp-group"><input class="otp-slot"><input class="otp-slot"><input class="otp-slot"></div><div class="otp-separator"><i data-icon="minus"></i></div><div class="otp-group"><input class="otp-slot"><input class="otp-slot"><input class="otp-slot"></div></div>
```

**Label** — `<label class="label" for="id">`.

## Overlays

All floating layers use the native Popover API: a trigger with `popovertarget="id"` and a target with `popover`. Placement: `data-side="bottom|top|right|left"`, `data-align="start|center|end"`, `data-offset`. IDs must be unique.

**Dropdown Menu** — items are buttons or links; `role="menuitemcheckbox|menuitemradio"` + `aria-checked`; radio items grouped in `role="group"`; `data-variant="destructive"`; `data-inset`; `data-keep-open`
```html
<button class="button" data-variant="outline" popovertarget="m1">Open</button>
<div popover id="m1" class="menu" data-align="end">
  <div class="menu-label">My account</div><div class="menu-separator"></div>
  <button class="menu-item"><i data-icon="user"></i>Profile<span class="menu-shortcut">⇧⌘P</span></button>
  <button class="menu-item" role="menuitemcheckbox" aria-checked="true">Status bar</button>
</div>
```

**Popover** — `<div popover id="p1" class="popover">…</div>`; `.p-0` removes padding.

**Select** (shadcn-style list; `.select` on a `<select>` is the native variant) — value goes to a hidden input placed directly before or after the trigger; fires `select:change`
```html
<div><input type="hidden" name="fruit">
  <button class="select select-trigger" popovertarget="s1" data-empty><span>Pick a fruit</span></button>
  <div popover id="s1" class="menu" role="listbox"><button class="menu-item select-item" role="option" data-value="apple">Apple</button>…</div></div>
```

**Context Menu** — `<div data-context-menu="cm1">area</div>` + `<div popover id="cm1" class="menu">…</div>`.

**Hover Card** — `<a data-hovercard="hc1">@name</a>` + `<div popover="manual" id="hc1" class="popover hovercard">…</div>`.

**Tooltip** — `data-tooltip="Text"`, optional `data-tooltip-side="top|right|bottom|left"`.

**Menubar** — `<div class="menubar" role="menubar"><button class="menubar-trigger" popovertarget="mb1">File</button>…</div>` + one `.menu` per trigger.

**Navigation Menu** — `<nav class="nav-menu"><button class="nav-trigger" popovertarget="n1">Services</button><a class="nav-link" href="#">Docs</a></nav>` + `<div popover id="n1" class="popover nav-panel"><div class="nav-panel-grid"><a href="#"><strong>Title</strong><span>Text</span></a></div></div>` (`.nav-feature` for a highlighted tile).

**Dialog / Alert Dialog** — native `<dialog>`; Esc, focus trap and focus return come from the browser. Click outside closes, except `role="alertdialog"`. `data-hotkey="k"` opens with ⌘K / Ctrl+K.
```html
<button class="button" data-open="d1">Edit</button>
<dialog id="d1" class="dialog" aria-labelledby="d1-t">
  <form class="dialog-body">
    <div class="dialog-header"><h2 class="dialog-title" id="d1-t">Edit profile</h2><p class="dialog-description">Text</p></div>
    …
    <div class="dialog-footer"><button type="button" class="button" data-variant="outline" data-close>Cancel</button><button class="button">Save</button></div>
    <button type="button" class="dialog-close" data-close aria-label="Close"><i data-icon="x"></i></button>
  </form>
</dialog>
```

**Sheet** — `<dialog class="sheet" data-side="right|left|top|bottom">` with `.sheet-header .sheet-title .sheet-description .sheet-content .sheet-footer`.

**Drawer** — `<dialog class="drawer"><div class="drawer-inner"><div class="drawer-header">…</div>…<div class="drawer-footer">…</div></div></dialog>`.

**Sonner / Toast** — `toast("Saved")`, `toast.success("…", { description })`, `toast.promise(p, {loading, success, error})`, or `<button data-toast="Saved" data-toast-type="success" data-toast-description="…">`.

## Navigation

**Tabs** — triggers and panels pair by `data-value`; `aria-selected="true"` sets the initial tab; `data-variant="line"`
```html
<div class="tabs"><div class="tabs-list"><button class="tabs-trigger" data-value="a">Account</button><button class="tabs-trigger" data-value="b">Password</button></div>
  <div class="tabs-content" data-value="a">…</div><div class="tabs-content" data-value="b">…</div></div>
```

**Accordion / Collapsible** — `<details>`; same `name` = only one open
```html
<div class="accordion"><details class="accordion-item" name="faq" open><summary class="accordion-trigger">Question</summary><div class="accordion-content"><p>Answer</p></div></details></div>
<details class="collapsible"><summary class="collapsible-trigger">…</summary><div class="collapsible-content">…</div></details>
```

**Breadcrumb** — separators come from CSS; `data-separator="slash"`
```html
<nav aria-label="Breadcrumb"><ol class="breadcrumb"><li><a href="#">Home</a></li><li><span aria-current="page">Page</span></li></ol></nav>
```

**Pagination** — `<nav class="pagination"><ul><li><a class="button" data-variant="ghost" data-size="icon" href="#">1</a></li><li><a class="button" data-variant="outline" data-size="icon" aria-current="page" href="#">2</a></li>…</ul></nav>`; `.pagination-ellipsis`.

**Sidebar** — `data-variant="inset"`; collapses to icons on wide containers, becomes an overlay below 768 px container width; ⌘B / Ctrl+B. For a demo box set `style="--sidebar-min-height:0; --sidebar-height:100%; height:30rem"`.
```html
<div class="sidebar-layout">
  <aside class="sidebar">
    <div class="sidebar-header">…</div>
    <div class="sidebar-content"><div class="sidebar-group"><div class="sidebar-group-label">Platform</div>
      <ul class="sidebar-menu"><li class="sidebar-menu-item"><a class="sidebar-menu-button" href="#" aria-current="page"><i data-icon="house"></i><span>Home</span></a><span class="sidebar-menu-badge">12</span></li></ul>
    </div></div>
    <div class="sidebar-footer">…</div>
  </aside>
  <div class="sidebar-inset"><header class="sidebar-inset-header"><button class="button" data-variant="ghost" data-size="icon-sm" data-sidebar-toggle aria-label="Toggle sidebar"><i data-icon="panel-left"></i></button></header>…</div>
</div>
```

**Command** — filter, arrow keys, Enter; fires `command:select` (`detail.value`); `.command.bordered` standalone, inside `<dialog class="dialog command-dialog">` as a palette
```html
<div class="command bordered"><div class="command-input-wrap"><i data-icon="search"></i><input class="command-input" placeholder="Search…"></div>
  <div class="command-list"><div class="command-empty" hidden>No results.</div>
    <div class="command-group"><div class="command-group-heading">Suggestions</div><button class="command-item" data-value="cal"><i data-icon="calendar"></i>Calendar<span class="command-shortcut">⌘C</span></button></div>
  </div></div>
```

**Combobox** — popover + command; value lands in the trigger label and an optional hidden input; `combobox:change`
```html
<div class="combobox"><input type="hidden" name="fw">
  <button class="button combobox-trigger" data-variant="outline" popovertarget="cb1" data-empty><span>Select…</span><i data-icon="chevrons-up-down"></i></button>
  <div popover id="cb1" class="popover p-0"><div class="command">…<button class="command-item" data-value="next">Next.js<i data-icon="check" class="check"></i></button>…</div></div>
</div>
```

**Calendar** — `data-mode="single|range"`, `data-value="2026-10-02"` or `"2026-10-02,2026-10-09"`, `data-month`, `data-months="2"`, `data-min`, `data-max`, `data-week-start`; fires `change`.
```html
<div class="calendar bordered" data-value="2026-10-14"></div>
```

**Date Picker** — label follows the selection; closes when complete; `data-format="short"`
```html
<div class="date-picker"><button class="button date-picker-trigger" data-variant="outline" popovertarget="dp1" data-empty><i data-icon="calendar"></i><span>Pick a date</span></button>
  <div popover id="dp1" class="popover calendar-popover"><div class="calendar"></div></div></div>
```

**Data Table** — client-side filter (`data-table-filter="<column index>"` or empty for whole row), sort (`.sort-button` in `th`, value from `td[data-value]`), selection, column toggles (`data-table-column="<index>"` on menuitemcheckbox), paging (`data-page-size`)
```html
<div class="data-table" data-page-size="10">
  <div class="data-table-toolbar"><input class="input" data-table-filter="2" placeholder="Filter…"></div>
  <div class="table-bordered table-wrap"><table class="table">
    <thead><tr><th><input type="checkbox" class="checkbox" data-table-select-all></th><th><button class="sort-button">Email</button></th><th class="num"><button class="sort-button">Amount</button></th></tr></thead>
    <tbody><tr><td><input type="checkbox" class="checkbox" data-table-select></td><td>a@b.de</td><td class="num" data-value="250">250,00 €</td></tr>
      <tr class="data-table-empty"><td colspan="3">No results.</td></tr></tbody>
  </table></div>
  <div class="data-table-footer"><span data-table-selected></span><div class="row gap-2"><span data-table-page></span><button class="button" data-variant="outline" data-size="sm" data-table-prev>Previous</button><button class="button" data-variant="outline" data-size="sm" data-table-next>Next</button></div></div>
</div>
```

**Carousel** — `--per-view`, `--carousel-gap`; empty `.carousel-dots` gets filled
```html
<div class="carousel" style="--per-view:3"><div class="carousel-viewport"><div class="carousel-item">…</div>…</div>
  <div class="carousel-controls"><button class="button" data-variant="outline" data-size="icon-sm" data-carousel-prev aria-label="Previous"><i data-icon="arrow-left"></i></button><div class="carousel-dots"></div><button class="button" data-variant="outline" data-size="icon-sm" data-carousel-next aria-label="Next"><i data-icon="arrow-right"></i></button></div></div>
```

**Resizable** — `data-direction="vertical"`, `data-min` (px); panel size via `--size` (flex-grow)
```html
<div class="resizable"><div class="resizable-panel" style="--size:1">…</div><div class="resizable-handle" data-with-handle></div><div class="resizable-panel" style="--size:2">…</div></div>
```

## Utilities

`data-theme-toggle` (light ↔ dark), `data-set-theme="light|dark|system"`, `data-set-accent="blue|green|orange|rose|violet|"`, `select[data-theme-select]`, `select[data-accent-select]`, `data-copy="text"` / `data-copy-target="id"` (clipboard with select fallback).
