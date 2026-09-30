---
name: web-handout-pdf
description: "Generates a polished, brand-themed PDF handout/sales-deck of any web project. Captures full-page screenshots of multiple routes (desktop + mobile) via Playwright, embeds them in browser-/phone-mockup frames, and renders a multi-page A4 PDF with cover, design system showcase, mockup pages, mobile grid, and closing/next-steps. Use when the user asks for a handout, mockup deck, presentation PDF, vorschau-pdf, sales deck, or pitch document of a website."
---

# Web Handout PDF

Generates a polished A4 PDF presentation of a web project — cover, design system, mockup pages, mobile preview, tech & next steps — with real screenshots embedded in browser- and phone-frames.

## When to use

Invoke this skill whenever the user wants:

- A PDF handout / sales deck / pitch document of a website
- Screenshots of multiple pages compiled into a presentation
- A „Vorschau-PDF" / „Mockup-Deck" for a relaunch project
- A polished printable summary of a web project to show to stakeholders

Skip if the user just wants a single screenshot, a Markdown report, or a slide deck in PowerPoint/Keynote/Google Slides format.

## Prerequisites

- **Node.js 18+** (uses `node:` built-ins and ES modules)
- **A running preview** of the target website. The skill captures from a URL — start the dev/prod server *before* running the capture step.
- **Basic Auth credentials** if the preview is password-protected (configurable)
- The skill manages its own Playwright install in `<skill-dir>/node_modules/`. Run `npm install` inside the skill directory once after first install.

`<skill-dir>` below means the directory containing this SKILL.md — wherever the skill was installed (e.g. `~/.claude/skills/web-handout-pdf`, `~/.agents/skills/web-handout-pdf` or a plugin cache folder).

## Setup (one time)

```bash
cd <skill-dir>
npm install
npx playwright install chromium
```

## Usage

The skill provides three scripts and one starter template. Recommended flow per project:

### 1. Initialize the handout in the user's project

```bash
node <skill-dir>/scripts/init.mjs
```

Run from the project root. Creates:
- `handout/handout.html` — fully-styled HTML template with all brand tokens, page layouts (cover, compare, design-system, showcase-tall, showcase-pair, mobile-grid, tech-protect, stats, closing). User edits this directly to insert project content and screenshot references.
- `handout/capture.config.json` — capture config (base URL, auth, viewports, routes).

If `handout/` already exists, the script aborts to avoid overwriting.

### 2. Adapt the template & config

Open `handout/handout.html` and replace the placeholder copy:
- Project name, tagline, lede on cover
- KPIs in the cover meta-grid
- Vorher/Nachher table rows
- Color swatches & typography specimens
- Page sections (eyebrow, title, lede, screenshot references)
- Stats, tech bullets, next steps

Open `handout/capture.config.json` and set:
- `baseUrl` (e.g. `http://localhost:3000` or `https://staging.example.com`)
- `auth.user` / `auth.pass` (only if Basic Auth is required, otherwise leave empty)
- `routes` — list of `{ slug, path }` per page to screenshot
- `viewports` — usually keep `desktop` (1440x900) + `mobile` (390x844)

The template references screenshots by filename in `handout/screenshots/<slug>-<viewport>.png` — keep slug naming consistent between config and template.

### 3. Capture & render

Start the target website's preview server (whichever way that project does it). Then:

```bash
node <skill-dir>/scripts/capture.mjs handout/capture.config.json
node <skill-dir>/scripts/render-pdf.mjs handout/handout.html handout/handout.pdf
```

Or in one shot:

```bash
node <skill-dir>/scripts/build.mjs
```

`build.mjs` runs both steps using the default file paths (`handout/capture.config.json`, `handout/handout.html`, `handout/handout.pdf`).

## What you get

A multi-page A4 PDF (typically 8–12 pages, ~5–15 MB):

1. **Cover** — Forest/dark gradient with project tagline, accent KPI strip
2. **Compare** — Vorher/Nachher 2-column table (e.g. „121 Seiten waren zu viele · 10 sind genug")
3. **Design system** — color swatches (chip+hex+role) + typography specimens + principle pills
4. **Showcase-tall pages** — single mockup with browser bar + URL + screenshot, eyebrow/title/lede above
5. **Showcase-pair pages** — two mockups side by side with captions
6. **Mobile-grid** — 4 phone frames in a row with screenshot + caption
7. **Tech & protect** — bullets + dark protection card + 4-tile stat grid
8. **Closing** — dark page with next-steps grid (numbered) + signature

## Customization

The HTML template uses CSS variables at the top (`:root { --forest-800: ... }`). Re-color the deck by editing those tokens — every component pulls from them.

To change page order or add/remove pages, edit the `<section class="page">` blocks in `handout.html` directly.

The browser-mockup `.mockup` and phone-mockup `.phone` are reusable: copy/paste the markup with a different screenshot to add new mockup pages.

## Layout gotchas (already solved in template)

- **No `box-shadow` on mockups/phones** — they render as visible gray halos in print. Use `border` only.
- **Screenshot heights**: `.mockup.tall img` is `height: 175mm` (fits one A4 page), `.mockup.crop-top img` is `height: 120mm` (fits two side-by-side per page). Bigger values overflow to next page and leave blank frames.
- **Phone width**: 40mm × 4 phones + gaps fit on one A4 row. Larger phones wrap.
- **Color swatch labels**: stack chip-on-top, text-below. Horizontal layout overflows narrow grid columns at >12pt.
- **Image loading via Next.js**: if the target site uses `next/image` and the project has a Basic Auth middleware, exclude `/images/` from the middleware matcher — otherwise the optimizer's internal fetch fails and screenshots show broken images.

## Files in this skill

```
web-handout-pdf/
├── SKILL.md              ← this file
├── package.json          ← Playwright dependency
├── scripts/
│   ├── init.mjs          ← copies template + config into target project
│   ├── capture.mjs       ← Playwright screenshots from config
│   ├── render-pdf.mjs    ← renders any HTML file → PDF via Chromium
│   └── build.mjs         ← orchestrates capture + render with default paths
├── templates/
│   └── handout.html      ← starter template (cover → closing) with all CSS
└── examples/
    └── capture.config.json ← reference config
```
