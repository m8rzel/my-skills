---
name: shadcn-artifacts
description: "Builds clean single-file HTML pages and Claude artifacts in the shadcn/ui look — vanilla HTML/CSS/JS, no React, no bundler. 57 components (button, card, dialog, sheet, dropdown, combobox, command, calendar, date picker, data table, chart, sidebar, tabs, toast …) styled through shadcn's design tokens with light and dark mode. Use when the user asks for an artifact, HTML page, dashboard, report, form, mockup or prototype 'im shadcn-Stil', 'clean wie shadcn', or wants a polished standalone HTML file. For a real React app with shadcn components use web-artifacts-builder instead."
---

# shadcn-artifacts

Single-file HTML in the shadcn/ui look. One stylesheet and one script (both inlined at build time) give you shadcn's tokens, every component as plain classes, and the behaviour that needs JavaScript (popovers, menus, dialogs, calendar, charts, data table, toasts). The result opens in any browser, works offline apart from the Geist font, and satisfies the Claude Artifact contract.

`<skill-dir>` below means the directory containing this SKILL.md.

## When to use

- Artifacts, dashboards, reports, forms, settings pages, mockups and click-prototypes that should look like shadcn/ui.
- Anything that must stay **one HTML file** without a build pipeline.
- Not for real React/Next.js apps (use the project's own shadcn setup or `web-artifacts-builder`).

## Workflow

1. **Start from the template**
   ```bash
   cp <skill-dir>/assets/template.html ./page.src.html
   ```
   It already has `<title>`, the Geist font link, the early theme script, the two markers `<!-- shadcn:css -->` / `<!-- shadcn:js -->` and a `.page` wrapper with the 16 px gutter.

2. **Write the content** with the components. Look up markup in `references/components.md`; for a full working example of any component, grep the showcase: `grep -n 'id="data-table"' <skill-dir>/examples/components.src.html`. Icons: `<i data-icon="calendar"></i>` with any [Lucide](https://lucide.dev/icons) name.

3. **Build** (Node 18+, no `npm install`):
   ```bash
   node <skill-dir>/scripts/build.mjs page.src.html page.html                     # standalone file
   node <skill-dir>/scripts/build.mjs page.src.html page.html --target artifact   # for the Artifact tool
   ```
   The build inlines only the CSS/JS sections the page uses (a small page is ~45 KB, the full showcase ~270 KB), replaces `<i data-icon>` with inline SVG (unknown names are fetched once from unpkg; `--offline` skips that) and, with `--target artifact`, strips doctype/html/head/body because the Artifact tool adds its own skeleton. `--all` includes every section.

4. **Check** in a browser: no console errors, light *and* dark (`data-theme` toggle), and ~390 px width without horizontal scroll.

### Without a shell (claude.ai)

Paste the full content of `assets/shadcn.css` in place of `<!-- shadcn:css -->` (inside `<style>`) and of `assets/shadcn.js` in place of `<!-- shadcn:js -->` (inside `<script>`). Write icons as inline SVG — the inner paths are in `assets/icons.json`:
`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">…paths…</svg>`.
Without this, `<i data-icon>` only renders the ten icons the script itself knows.

## Conventions

- **Base class + data attributes**, mirroring shadcn's props: `<button class="button" data-variant="outline" data-size="sm">`. Variants: `default` (no attribute), `secondary`, `destructive`, `outline`, `ghost`, `link`; sizes `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`.
- **Behaviour via attributes**, no init code needed: `popovertarget` (native Popover API) for dropdowns, popovers, select, combobox, date picker, menubar, navigation menu; `data-open="dialog-id"` / `data-close` for `<dialog class="dialog|sheet|drawer">`; `data-tooltip`, `data-hovercard`, `data-context-menu`, `data-toast`, `data-copy`, `data-sidebar-toggle`, `data-theme-toggle`.
- **Stateful widgets** (`.calendar`, `.chart`, `.data-table`, `.tabs`, `.carousel`, `.slider`, `.otp`, `.resizable`) initialise on load. For markup inserted later, call `shadcn.init(container)`.
- **Layout helpers** are deliberately few: `.page`, `.stack`, `.row` (`.between`, `.start`), `.grid` (`--min` column width), `.gap-1…12`, `.grow`, `.w-full`, `.muted`, `.text-sm/xs/lg`, `.font-medium/semibold`, `.mono`, `.tabular`, `.sr-only`. Everything else: a few lines of page CSS in the second `<style>` block, using tokens only.
- **JS API**: `toast("Saved", { description, type: "success"|"error"|"warning"|"info"|"loading", action: { label, onClick } })`, `toast.success(…)`, `toast.promise(p, { loading, success, error })`, `shadcn.setTheme("light"|"dark"|"system")`, `shadcn.setAccent("blue"|…|"")`, `shadcn.chart.update(el, { series })`, `shadcn.calendar.set(el, "2026-10-02")`, `shadcn.icon(name)`.
- **Events** (bubble): `command:select`, `combobox:change`, `change` on `.calendar` (`detail.value`, `detail.dates`), `select:change`, `tabs:change`, `toggle:change`, `otp:complete`, `sidebar:toggle`.

## Theming

All colours are shadcn tokens on `:root` (`--background`, `--foreground`, `--primary`, `--muted`, `--accent`, `--destructive`, `--success`, `--warning`, `--info`, `--border`, `--input`, `--ring`, `--chart-1…5`, `--sidebar-*`, `--radius`). Dark values live in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` **and** `:root[data-theme="dark"]` — the pattern the Artifact viewer needs. To brand a page, override tokens in the page's own `<style>` (light values on `:root`, dark values in both dark blocks), or set an accent preset: `<html data-accent="blue|green|orange|rose|violet">`. Never put a literal colour in a component rule.

## Artifact rules that matter here

- `<title>` is a 2–4 word name; it must sit in the first 8 KB — the build puts it first.
- No external images or stylesheets except Google Fonts: images as `data:` URI or inline SVG.
- Forms: handle `submit` with `preventDefault()` and give feedback with a toast — there is no backend.
- No `alert()`, `confirm()`, `prompt()`, `window.print()` or download links; use `role="alertdialog"` dialogs instead of `confirm()`.
- Every form control gets a stable `id`. Use `el.hidden` to hide things.
- Use real, plausible content — never lorem ipsum — and mark sample data as examples.
- Open the page in a realistic state: filled tables, a selected date, a chart with data.

## Files

```
shadcn-artifacts/
├── SKILL.md
├── LICENSES.md                 ← shadcn/ui (MIT), Lucide (ISC), Geist (OFL)
├── assets/
│   ├── shadcn.css              ← tokens, base, all components (sections: @core / @component)
│   ├── shadcn.js               ← behaviour, event delegation (sections: @core / @component / @tail)
│   ├── icons.json              ← Lucide icons used by the showcase (inner SVG)
│   └── template.html           ← starting point with markers
├── scripts/
│   └── build.mjs               ← inlines sections + icons → single file (file | artifact)
├── references/
│   └── components.md           ← markup for every component
└── examples/
    ├── components.src.html     ← showcase source: all 57 components
    └── components.html         ← built showcase (open in a browser)
```

After changing `assets/` or the showcase source, rebuild the showcase: `node <skill-dir>/scripts/build.mjs <skill-dir>/examples/components.src.html --all`.
