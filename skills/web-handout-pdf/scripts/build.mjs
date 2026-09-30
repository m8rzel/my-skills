#!/usr/bin/env node
/**
 * Orchestrate capture + render with default paths.
 * Equivalent to:
 *   node capture.mjs handout/capture.config.json
 *   node render-pdf.mjs handout/handout.html handout/handout.pdf
 */

import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(script, args = []) {
  return new Promise((res, rej) => {
    const proc = spawn(process.execPath, [resolve(__dirname, script), ...args], {
      stdio: "inherit",
      cwd: process.cwd()
    });
    proc.on("close", (code) => (code === 0 ? res() : rej(new Error(`${script} exited ${code}`))));
  });
}

await run("capture.mjs");
await run("render-pdf.mjs");
console.log("\n✓ Handout build complete.");
