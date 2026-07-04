#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────
 * DS-PULL · vendors @nuri/rn into this app from a nuri-design-system
 * git tag (or a local checkout for the dev loop).
 *
 *   node tools/ds-pull.mjs rn/v0.1.0-alpha.1     # pin to a tag
 *   node tools/ds-pull.mjs --local ../nuri       # local dev loop
 *
 * Mechanics: clone the DS repo at the tag (shallow) into a temp dir,
 * run THAT CHECKOUT'S scripts/export-rn.mjs (exporter and code version
 * together), replace ds/nuri/ wholesale, stamp the tag into
 * ds/nuri/MANIFEST.json, then gate on this app's own `tsc --noEmit`.
 * ds/nuri/ is generated — never hand-edit it; re-pull instead.
 * ────────────────────────────────────────────────────────────── */

import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DS_GIT = 'git@github.com:nuri-com/nuri-design-system.git';
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(appRoot, 'ds/nuri');

const args = process.argv.slice(2);
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'inherit', 'inherit'] });

let checkout;
let cleanup = () => {};
let ref;

if (args[0] === '--local') {
  checkout = resolve(appRoot, args[1] ?? '');
  ref = 'local';
  if (!existsSync(join(checkout, 'scripts/export-rn.mjs'))) {
    console.error(`--local: ${checkout} is not a nuri-design-system checkout (no scripts/export-rn.mjs)`);
    process.exit(1);
  }
} else if (args[0]) {
  ref = args[0];
  const tmp = mkdtempSync(join(tmpdir(), 'nuri-ds-'));
  cleanup = () => rmSync(tmp, { recursive: true, force: true });
  console.log(`cloning ${DS_GIT} @ ${ref} …`);
  run(`git clone --depth 1 --branch ${ref} ${DS_GIT} ${tmp}/ds`);
  checkout = join(tmp, 'ds');
} else {
  console.error('usage: node tools/ds-pull.mjs <tag> | --local <path-to-ds-checkout>');
  process.exit(1);
}

try {
  rmSync(vendorDir, { recursive: true, force: true });
  run(`node scripts/export-rn.mjs ${vendorDir}`, checkout);

  // Stamp the pin into the exporter's manifest.
  const manifestPath = join(vendorDir, 'MANIFEST.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify({ ref, ...manifest }, null, 2) + '\n');

  console.log(`vendored ${manifest.files} files @ ${ref} (${String(manifest.commit).slice(0, 7)}) → ds/nuri`);
  console.log('gate: tsc --noEmit …');
  run('npx tsc --noEmit', appRoot);
  console.log('OK — vendored DS typechecks on this app’s TS/config.');
} finally {
  cleanup();
}
