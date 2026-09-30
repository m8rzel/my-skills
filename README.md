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
```

**Andere Agents (Codex, Cursor, Amp, …) über die skills-CLI:**

```
npx skills add m8rzel/my-skills
```

## Skills

| Skill | Zweck |
|---|---|
| `web-handout-pdf` | PDF-Handout bzw. Sales-Deck eines Web-Projekts: Playwright-Screenshots (Desktop + Mobile) in Mockup-Rahmen, gerendert als A4-PDF. Braucht einmalig `npm install` im Skill-Ordner. |

## Neuer Skill

`skills/<name>/SKILL.md` anlegen (`name` = Ordnername, kebab-case) und als Plugin in
`.claude-plugin/marketplace.json` eintragen.
