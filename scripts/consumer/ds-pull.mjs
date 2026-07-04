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
 * together) into a staging dir NEXT TO ds/nuri (same volume · atomic
 * rename), stamp the pin into MANIFEST.json, swap it in with the old
 * copy kept as a backup, then gate on this app's own `tsc --noEmit`.
 * Any failure — export, stamp, or gate — restores the previous
 * vendored copy; the app is never left without a working DS.
 * ds/nuri/ is generated — never hand-edit it; re-pull instead.
 * ────────────────────────────────────────────────────────────── */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Override for HTTPS/token auth: DS_GIT_URL=https://github.com/nuri-com/nuri-design-system.git
const DS_GIT = process.env.DS_GIT_URL ?? 'git@github.com:nuri-com/nuri-design-system.git';
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorParent = join(appRoot, 'ds');
const vendorDir = join(vendorParent, 'nuri');

const args = process.argv.slice(2);
const run = (cmd, cmdArgs, cwd) =>
  execFileSync(cmd, cmdArgs, { cwd, stdio: ['ignore', 'inherit', 'inherit'] });

let checkout;
let cleanupClone = () => {};
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
  if (!/^[\w./-]+$/.test(ref) || ref.startsWith('-')) {
    console.error(`refusing suspicious ref: ${ref}`);
    process.exit(1);
  }
  const tmp = mkdtempSync(join(tmpdir(), 'nuri-ds-'));
  cleanupClone = () => rmSync(tmp, { recursive: true, force: true });
  console.log(`cloning ${DS_GIT} @ ${ref} …`);
  run('git', ['clone', '--depth', '1', '--branch', ref, DS_GIT, join(tmp, 'ds')]);
  checkout = join(tmp, 'ds');
} else {
  console.error('usage: node tools/ds-pull.mjs <tag> | --local <path-to-ds-checkout>');
  process.exit(1);
}

// Staging + backup live NEXT TO the vendor dir: same volume, so the
// swap is two atomic renames, and a failed pull can always restore.
mkdirSync(vendorParent, { recursive: true });
const staging = mkdtempSync(join(vendorParent, '.stage-'));
const stagedOut = join(staging, 'nuri');
const backupDir = join(vendorParent, `.backup-${basename(staging)}`);
let swapped = false;

try {
  run('node', ['scripts/export-rn.mjs', stagedOut], checkout);

  // Stamp the pin into the exporter's manifest while still staged.
  const manifestPath = join(stagedOut, 'MANIFEST.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify({ ref, ...manifest }, null, 2) + '\n');

  // Swap: old copy → backup, staged copy → live.
  if (existsSync(vendorDir)) renameSync(vendorDir, backupDir);
  swapped = true;
  renameSync(stagedOut, vendorDir);

  console.log(`vendored ${manifest.files} files @ ${ref} (${String(manifest.commit).slice(0, 7)}) → ds/nuri`);
  console.log('gate: tsc --noEmit …');
  run('npx', ['tsc', '--noEmit'], appRoot);

  rmSync(backupDir, { recursive: true, force: true });
  console.log('OK — vendored DS typechecks on this app’s TS/config.');
} catch (err) {
  if (swapped) {
    rmSync(vendorDir, { recursive: true, force: true });
    if (existsSync(backupDir)) {
      renameSync(backupDir, vendorDir);
      console.error('pull failed — previous vendored copy restored.');
    } else {
      console.error('pull failed — no previous vendored copy existed; ds/nuri removed.');
    }
  } else {
    console.error('pull failed before touching ds/nuri — nothing changed.');
  }
  throw err;
} finally {
  rmSync(staging, { recursive: true, force: true });
  cleanupClone();
}
