#!/usr/bin/env node
/**
 * Baut aus einer Quell-HTML eine einzelne, eigenständige Datei:
 *   - ersetzt <!-- shadcn:css --> und <!-- shadcn:js --> durch die benötigten Abschnitte aus assets/
 *   - ersetzt <i data-icon="name"></i> durch Inline-SVG (Lucide; fehlende Icons von unpkg)
 *   - --target artifact: ohne doctype/html/head/body, wie es das Artifact-Tool erwartet
 *
 * Aufruf:
 *   node build.mjs <quelle.html> [ziel.html] [--target file|artifact] [--all] [--offline]
 *
 * Ohne Ziel wird neben die Quelle geschrieben: seite.src.html → seite.html, sonst seite.build.html.
 * --all nimmt alle Abschnitte auf (Showcase), --offline holt keine fehlenden Icons nach.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, "..", "assets");
const LUCIDE = "https://unpkg.com/lucide-static@1.49.0/icons";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith("--")) {
    console.error(`${name} braucht einen Wert.`);
    process.exit(1);
  }
  return args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] || "").match(/^--target$/));
const [srcArg, outArg, ...extra] = positional;
if (extra.length) {
  console.error(`Zu viele Pfade: ${extra.join(" ")} – erwartet: <quelle.html> [ziel.html]`);
  process.exit(1);
}
if (!srcArg) {
  console.error("Aufruf: node build.mjs <quelle.html> [ziel.html] [--target file|artifact] [--all] [--offline]");
  process.exit(1);
}
const target = opt("--target", "file");
if (!["file", "artifact"].includes(target)) {
  console.error(`Unbekanntes Ziel "${target}" – erlaubt sind --target file und --target artifact.`);
  process.exit(1);
}
const known = new Set(["--target", "--all", "--offline"]);
const unknown = args.filter((a) => a.startsWith("--") && !known.has(a));
if (unknown.length) {
  console.error(`Unbekannte Option: ${unknown.join(", ")}`);
  process.exit(1);
}
const src = resolve(srcArg);
const out = resolve(outArg || (src.endsWith(".src.html") ? src.replace(/\.src\.html$/, ".html") : src.replace(/\.html?$/, ".build.html")));
if (out === src) {
  console.error("Ziel und Quelle sind dieselbe Datei – bitte einen anderen Zielpfad angeben.");
  process.exit(1);
}

let html = await readFile(src, "utf8");

// --- Abschnitte auswählen -------------------------------------------------
const parseSections = (text, kind) => {
  const re = kind === "css"
    ? /\/\* @(core|tail|component ([\w-]+) \| ([^*]+?)) \*\/([\s\S]*?)\/\* @end \*\//g
    : /\/\/ @(core|tail|component ([\w-]+) \| ([^\n]+?))\n([\s\S]*?)\/\/ @end/g;
  const header = text.slice(0, text.search(kind === "css" ? /\/\* @core \*\// : /\/\/ @core/));
  const sections = [];
  for (const m of text.matchAll(re)) {
    sections.push({ name: m[2] || m[1], always: !m[2], tokens: m[3] ? m[3].trim().split(/\s+/) : [], body: m[4] });
  }
  // Jede Abschnittsmarke muss einen Treffer ergeben – sonst fehlt irgendwo ein @end
  const heads = (text.match(kind === "css" ? /\/\* @(core|tail|component [^*]+?) \*\//g : /^\/\/ @(core|tail|component .+)$/gm) || []).length;
  const ends = (text.match(kind === "css" ? /\/\* @end \*\//g : /^\/\/ @end$/gm) || []).length;
  if (heads !== sections.length || ends !== sections.length) {
    console.error(`shadcn.${kind}: ${heads} Abschnittsmarken, ${ends} @end, aber ${sections.length} erkannte Abschnitte – Marken prüfen.`);
    process.exit(1);
  }
  return { header, sections };
};
const used = (tokens) => tokens.some((tok) => new RegExp(`\\b${tok.replace(/[-]/g, "\\-")}\\b`).test(html));
const pick = ({ header, sections }) => {
  const chosen = sections.filter((s) => s.always || flag("--all") || used(s.tokens));
  return { text: header.trim() + "\n" + chosen.map((s) => s.body.trim()).join("\n"), names: chosen.filter((s) => !s.always).map((s) => s.name) };
};
const css = pick(parseSections(await readFile(join(assets, "shadcn.css"), "utf8"), "css"));
const js = pick(parseSections(await readFile(join(assets, "shadcn.js"), "utf8"), "js"));

// --- Icons inlinen --------------------------------------------------------
const icons = JSON.parse(await readFile(join(assets, "icons.json"), "utf8"));
const fetched = [], missing = [];
const iconRe = /<i\s+([^>]*?)data-icon="([\w-]+)"([^>]*)>\s*<\/i>/g;
for (const name of new Set([...html.matchAll(iconRe)].map((m) => m[2]))) {
  if (icons[name] || flag("--offline")) continue;
  try {
    const res = await fetch(`${LUCIDE}/${name}.svg`);
    if (!res.ok) throw new Error(res.status);
    const svg = await res.text();
    icons[name] = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].replace(/\s*\n\s*/g, "").replace(/ \/>/g, "/>").trim();
    fetched.push(name);
  } catch {
    missing.push(name);
  }
}
let iconCount = 0;
html = html.replace(iconRe, (all, before, name, after) => {
  if (!icons[name]) return all;
  iconCount++;
  const attrs = `${before} ${after}`.trim();
  const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || "";
  const rest = attrs.replace(/class="[^"]*"/, "").trim();
  const a11y = /aria-label=/.test(rest) ? 'role="img"' : 'aria-hidden="true"';
  return `<svg class="${["icon", cls].join(" ").trim()}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${a11y}${rest ? " " + rest : ""}>${icons[name]}</svg>`;
});

// --- CSS/JS einsetzen -----------------------------------------------------
const styleTag = `<style data-shadcn>\n${css.text}\n</style>`;
const scriptTag = `<script data-shadcn>\n${js.text}\n</script>`;
html = html.includes("<!-- shadcn:css -->") ? html.replace("<!-- shadcn:css -->", () => styleTag) : html.replace(/<\/head>/i, () => `${styleTag}\n</head>`);
html = html.includes("<!-- shadcn:js -->") ? html.replace("<!-- shadcn:js -->", () => scriptTag) : html.replace(/<\/body>/i, () => `${scriptTag}\n</body>`);

// --- Zielformat -----------------------------------------------------------
if (target === "artifact") {
  // Das Artifact-Tool setzt doctype/html/head/body selbst; <title> muss in den ersten 8 KB stehen.
  const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, ""])[1];
  const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [, html])[1];
  const lang = (html.match(/<html[^>]*\blang="([^"]+)"/i) || [])[1];
  const cleanHead = head.replace(/<meta\s+charset[^>]*>\s*/i, "").replace(/<meta\s+name="viewport"[^>]*>\s*/i, "");
  const title = (cleanHead.match(/<title>[\s\S]*?<\/title>/i) || [""])[0];
  const langScript = lang ? `<script>document.documentElement.lang=${JSON.stringify(lang)}</script>\n` : "";
  html = `${title}\n${langScript}${cleanHead.replace(title, "").trim()}\n${body.trim()}\n`;
} else if (!/^\s*<!doctype/i.test(html)) {
  html = `<!doctype html>\n${html}`;
}

await writeFile(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`✓ ${basename(out)} (${kb} KB, Ziel: ${target})`);
console.log(`  CSS-Abschnitte: ${css.names.join(", ") || "nur Basis"}`);
console.log(`  JS-Abschnitte:  ${js.names.join(", ") || "nur Basis"}`);
console.log(`  Icons: ${iconCount} eingesetzt${fetched.length ? `, nachgeladen: ${fetched.join(", ")}` : ""}`);
if (missing.length) console.warn(`  ⚠ Unbekannte Icons (nicht ersetzt): ${missing.join(", ")} – Namen auf lucide.dev prüfen`);
if (Buffer.byteLength(html) > 16 * 1024 * 1024) console.warn("  ⚠ Größer als 16 MB – das Artifact-Tool lehnt die Datei ab");
