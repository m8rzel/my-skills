#!/usr/bin/env node
/**
 * Initialize handout/ in the current project: copy template + example config.
 *
 * Usage:
 *   node init.mjs            (creates handout/ in CWD; aborts if exists)
 *   node init.mjs --force    (overwrites existing files)
 */

import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(__dirname, "..");
const targetDir = resolve(process.cwd(), "handout");
const force = process.argv.includes("--force");

if (existsSync(targetDir) && !force) {
  console.error(`✗ ${targetDir} already exists. Use --force to overwrite.`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
mkdirSync(resolve(targetDir, "screenshots"), { recursive: true });

const files = [
  { from: "templates/handout.html", to: "handout.html" },
  { from: "examples/capture.config.json", to: "capture.config.json" }
];

for (const f of files) {
  const src = resolve(skillDir, f.from);
  const dst = resolve(targetDir, f.to);
  copyFileSync(src, dst);
  console.log(`  ✓ ${f.to}`);
}

console.log(`\n→ Initialized in ${targetDir}`);
console.log(`\nNext steps:`);
console.log(`  1. Edit handout/handout.html — replace placeholder copy with your project content`);
console.log(`  2. Edit handout/capture.config.json — set baseUrl, auth, routes`);
console.log(`  3. Start your preview server`);
console.log(`  4. node ${resolve(__dirname, "build.mjs")}`);
