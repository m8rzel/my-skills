#!/usr/bin/env node
/**
 * Capture screenshots based on a JSON config.
 *
 * Usage:
 *   node capture.mjs [config-path]
 *
 * Config defaults to ./handout/capture.config.json (relative to CWD).
 * Output PNGs go to <outDir>/<slug>-<viewport>.png
 */

import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));

const cwdConfig = resolve(process.cwd(), "handout/capture.config.json");
const configPath = process.argv[2]
  ? (isAbsolute(process.argv[2]) ? process.argv[2] : resolve(process.cwd(), process.argv[2]))
  : cwdConfig;

if (!existsSync(configPath)) {
  console.error(`✗ Config not found: ${configPath}`);
  console.error(`  Run: node ${__dirname}/init.mjs   (in your project root)`);
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(configPath, "utf8"));
const outDir = resolve(dirname(configPath), "..", cfg.outDir ?? "screenshots");
mkdirSync(outDir, { recursive: true });

const baseUrl = cfg.baseUrl?.replace(/\/$/, "") ?? "http://localhost:3000";
const auth = cfg.auth?.user
  ? { username: cfg.auth.user, password: cfg.auth.pass ?? "" }
  : undefined;
const viewports = cfg.viewports ?? [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];
const routes = cfg.routes ?? [{ slug: "home", path: "/" }];
const settleMs = cfg.settleMs ?? 800;
const waitUntil = cfg.waitUntil ?? "networkidle";

console.log(`→ Capturing from ${baseUrl}`);
console.log(`  ${viewports.length} viewport(s) × ${routes.length} route(s) = ${viewports.length * routes.length} screenshots`);

const browser = await chromium.launch();
const context = await browser.newContext({
  httpCredentials: auth,
  deviceScaleFactor: cfg.deviceScaleFactor ?? 2
});
const page = await context.newPage();

let count = 0;
for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const route of routes) {
    const url = baseUrl + route.path;
    process.stdout.write(`  ${vp.name.padEnd(8)} ${route.slug.padEnd(20)} `);
    try {
      await page.goto(url, { waitUntil, timeout: 60000 });
      await page.waitForTimeout(settleMs);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      const file = `${outDir}/${route.slug}-${vp.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log("✓");
      count++;
    } catch (e) {
      console.log("✗", e.message);
    }
  }
}

await browser.close();
console.log(`\n→ ${count} screenshot(s) written to ${outDir}`);
