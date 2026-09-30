#!/usr/bin/env node
/**
 * Render an HTML file to PDF via Chromium.
 *
 * Usage:
 *   node render-pdf.mjs [html-path] [pdf-path]
 *
 * Defaults:
 *   html-path = ./handout/handout.html
 *   pdf-path  = ./handout/handout.pdf
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const arg = (i, fallback) => {
  const v = process.argv[i];
  if (!v) return resolve(process.cwd(), fallback);
  return isAbsolute(v) ? v : resolve(process.cwd(), v);
};

const htmlPath = arg(2, "handout/handout.html");
const pdfPath = arg(3, "handout/handout.pdf");

if (!existsSync(htmlPath)) {
  console.error(`✗ HTML not found: ${htmlPath}`);
  process.exit(1);
}

console.log(`→ Rendering ${htmlPath}`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  if (document.fonts) await document.fonts.ready;
});
await page.waitForTimeout(500);

await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: true
});

await browser.close();
console.log(`→ PDF written to ${pdfPath}`);
