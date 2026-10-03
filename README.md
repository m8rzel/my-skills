# my-skills

Marcels Agent Skills. Aufbau wie [anthropics/skills](https://github.com/anthropics/skills):
ein Ordner pro Skill unter `skills/`, darin eine `SKILL.md` mit YAML-Frontmatter (`name`, `description`),
dazu optional `scripts/`, `templates/`, `references/`. `.claude-plugin/marketplace.json` macht das Repo
zum Claude-Code-Plugin-Marketplace.

## Installieren

**Claude Code:**

```
/plugin marketplace add m8rzel/my-skills
/plugin install web-handout-pdf@my-skills
/plugin install shadcn-artifacts@my-skills
/plugin install ui-motion-design@my-skills
```

**Andere Agents (Codex, Cursor, Amp, …) über die skills-CLI:**

```
npx skills add m8rzel/my-skills
```

## Skills

| Skill | Zweck |
|---|---|
| `web-handout-pdf` | PDF-Handout bzw. Sales-Deck eines Web-Projekts: Playwright-Screenshots (Desktop + Mobile) in Mockup-Rahmen, gerendert als A4-PDF. Braucht einmalig `npm install` im Skill-Ordner. |
| `shadcn-artifacts` | Saubere Single-File-HTML-Seiten und Claude-Artifacts im shadcn/ui-Stil: 57 Komponenten als Vanilla HTML/CSS/JS, hell und dunkel, ohne React und ohne Build-Zwang. Beispiel mit allen Komponenten: `skills/shadcn-artifacts/examples/components.html`. |
| `ui-motion-design` | UI/UX- und Motion-Design für **Websites und Webapps** auf Expertenniveau. `brief.mjs` macht aus einer Produktbeschreibung Stil, Fonts, Farbe, Seitenmuster bzw. App-Shell und Anti-Patterns (MASTER.md + Seiten-Overrides); `tokens.mjs` (OKLCH-Tokens + Style-Tile), `contrast.mjs` (WCAG + APCA), `easing.mjs` (Springs → CSS/Motion/Reanimated/GSAP), `audit.mjs` (Playwright-Audit inkl. Reduced Motion; einmalig `npm install`). Wissen: Website- und Webapp-Playbooks, UI-Craft, Patterns (inkl. AI-UIs), Teardowns (Linear, Stripe, Apple, Awwwards), 21st.dev-Komponenten-Sourcing. Demos: `skills/ui-motion-design/examples/` (`landing-page.html`, `premium-ui.html` u. a.). |

## Neuer Skill

`skills/<name>/SKILL.md` anlegen (`name` = Ordnername, kebab-case) und als Plugin in
`.claude-plugin/marketplace.json` eintragen.
