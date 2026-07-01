/* ──────────────────────────────────────────────────────────────
 * NURI · NAMING-COHERENCE GUARD · CI-ENFORCED DETERMINISTIC NAMING
 *
 * Nuri's naming rule (README · handoff §5): ONE public kebab name per component →
 * web `nuri-{kebab}` · RN `Pascal({kebab})`, mechanically derived by `nuriNames`
 * (no lookup table, no hand-authored platform string). The rule is only as strong
 * as its WEAKEST restatement — the same kebab is hand-typed across ~6 sites (the
 * spec source basename · the export identifier · the exports subpath · the RN
 * binding's `nuriNames(...)` · the web recipe's `nuriNames(...)` · the doc/drift
 * rosters), and the 5 behaviour/drift gates never check NAMING coherence (Guard D
 * pins shape + axes, never names · debt-register §2). So a rename that misses ONE
 * site sails through green — exactly the drift SEED-2/D7 paid down (`composition-
 * button`→`button` · `tab`→`tab-bar-item`, dropping the `public`/`source`
 * overrides so `name === public`).
 *
 * This guard is the anti-rot net: the ONE build-side roster
 * (parsers/descriptors.js#DESCRIPTOR_COMPONENTS, `name === public`) is the
 * authority, and every hand-typed name must agree with it. A future rename that
 * touches the source but forgets a `nuriNames(...)` call — or a roster that drifts
 * from the drift-guard's pins — FAILS here at PR time.
 *
 * Sibling to docs-drift.test.js / no-unused-exports.test.js — picked up by the
 * existing `node --test scripts/*.test.js` gate · zero new deps.
 *
 * THREE pins (the register's §2 "Naming coherence"):
 *   (a) basename === name === export/subpath — every roster name has its authored
 *       source at components/<name>.ts exporting `<camel(name)>Descriptor`, its
 *       exports subpath ./descriptors/<name> → components/<name>.ts, its web recipe
 *       recipes/<name>.js, and its generated twin generated/descriptors/<name>.js.
 *   (b) nuriNames(x) ⊂ the roster — every `nuriNames('…')` in the RN bindings
 *       (rn/generated/components/*.ts · Phase 2) + the web recipes (prototype/recipes/*.js) names an
 *       x ∈ the roster, and every roster name is bound on BOTH targets (no site
 *       missed, no orphaned roster entry).
 *   (c) the parallel rosters agree — the drift-guard's EXPECTED_DESCRIPTORS keys
 *       (scripts/docs-drift.test.js) === the roster, and the doc component roster
 *       (@nuri/doc descriptor-ir.js#DOC_COMPONENTS) ⊂ the roster.
 * (BROWSER_DESCRIPTOR_COMPONENTS is NOT pinned here — it now DERIVES from the
 * roster · map(spec => spec.name) · so it is coherent by construction.)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DESCRIPTOR_COMPONENTS, exportNameFor } from './parsers/descriptors.js';
import { DOC_COMPONENTS } from '../packages/doc/pipeline/descriptor-ir.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SPEC = resolve(REPO_ROOT, 'packages/spec');
const RECIPES = resolve(REPO_ROOT, 'packages/prototype/recipes');
const TWINS = resolve(REPO_ROOT, 'packages/prototype/generated/descriptors');
// The RN binding's `nuriNames(...)` call sites moved from the hand-written
// factory/index.ts to the GENERATED per-component surfaces (Path C · Phase 2 · one
// `createNuriComponent(descriptor, nuriNames('<name>').rn, …)` per file); the barrel
// now just re-exports them. The guard reads the generated dir (like the web recipes).
const RN_COMPONENTS = resolve(REPO_ROOT, 'packages/rn/generated/components');

const read = (p) => readFileSync(p, 'utf8');
const ROSTER = DESCRIPTOR_COMPONENTS.map((spec) => spec.name);
const rosterSet = new Set(ROSTER);

// Extract every `nuriNames('X')` / `nuriNames("X")` argument literal from the CODE
// of a source (block + line comments stripped so a doc-comment example that names
// the helper — e.g. `// nuriNames('…')` — is not read as a call site).
function nuriNamesArgs(src) {
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const out = [];
  const re = /nuriNames\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(code)) !== null) out.push(m[1]);
  return out;
}

// The TOP-LEVEL keys of an object literal `const NAME = { … };` in a source file —
// keys at exactly 2-space indent (quoted or bare), stopping at the closing `};`.
// (Used to read the drift-guard's hand-typed roster without importing the .test.js,
// which would double-register its tests.)
function topLevelObjectKeys(src, constName) {
  const start = src.indexOf(`const ${constName} = {`);
  assert.notEqual(start, -1, `[naming] could not locate \`const ${constName} = {\` — the guard's parse anchor drifted`);
  const body = src.slice(start);
  const end = body.indexOf('\n};');
  assert.notEqual(end, -1, `[naming] could not find the closing \`};\` for ${constName}`);
  const slice = body.slice(0, end);
  const keys = [];
  const re = /^ {2}(?:'([\w-]+)'|([\w-]+)) *: *\{/gm;
  let m;
  while ((m = re.exec(slice)) !== null) keys.push(m[1] ?? m[2]);
  return keys;
}

// ── (a) basename === name === export identifier === subpath === twin === recipe ──
test('naming · every roster name is its source basename · export · subpath · twin · recipe', () => {
  const pkg = JSON.parse(read(resolve(SPEC, 'package.json')));
  for (const name of ROSTER) {
    const srcPath = resolve(SPEC, `components/${name}.ts`);
    assert.ok(existsSync(srcPath), `${name}: no authored source at packages/spec/components/${name}.ts (basename must === name)`);

    const src = read(srcPath);
    const exportId = exportNameFor(name);
    assert.match(
      src,
      new RegExp(`export const ${exportId}\\b`),
      `${name}: components/${name}.ts must export \`${exportId}\` (the derived export identifier)`,
    );

    const subpath = `./descriptors/${name}`;
    assert.equal(
      pkg.exports[subpath],
      `./components/${name}.ts`,
      `${name}: @nuri/spec exports map is missing \`${subpath}\` → ./components/${name}.ts`,
    );

    assert.ok(
      existsSync(resolve(TWINS, `${name}.js`)),
      `${name}: no generated twin at packages/prototype/generated/descriptors/${name}.js (run \`node scripts/tokens-parser.js\`)`,
    );
    assert.ok(
      existsSync(resolve(RECIPES, `${name}.js`)),
      `${name}: no web recipe at packages/prototype/recipes/${name}.js (basename must === name)`,
    );
  }

  // No STALE exports subpath — every ./descriptors/<x> (bar the shared schema) is a
  // roster name, so a renamed-but-not-removed subpath is caught too.
  for (const subpath of Object.keys(pkg.exports)) {
    const m = subpath.match(/^\.\/descriptors\/(.+)$/);
    if (!m || m[1] === 'schema') continue;
    assert.ok(rosterSet.has(m[1]), `@nuri/spec exports has a stale descriptor subpath \`${subpath}\` (not in the roster)`);
  }
});

// ── (b) every nuriNames(x) site names a roster x · both targets · no orphan ──
test('naming · every nuriNames(x) call site names a roster component, on both targets', () => {
  const sites = {};
  for (const name of ROSTER) {
    sites[`rn/generated/components/${name}.ts`] = nuriNamesArgs(read(resolve(RN_COMPONENTS, `${name}.ts`)));
    sites[`prototype/recipes/${name}.js`] = nuriNamesArgs(read(resolve(RECIPES, `${name}.js`)));
  }

  // No unknown name at any site.
  for (const [where, args] of Object.entries(sites)) {
    for (const arg of args) {
      assert.ok(rosterSet.has(arg), `${where}: nuriNames('${arg}') is not a roster component name (${ROSTER.join(', ')})`);
    }
  }

  // Coverage — every roster name is bound on the RN side (its generated exact-surface
  // file) AND has a web recipe that binds the SAME name (so a rename that misses one
  // target fails here).
  for (const name of ROSTER) {
    const rnArgs = new Set(sites[`rn/generated/components/${name}.ts`]);
    assert.ok(rnArgs.has(name), `${name}: no \`nuriNames('${name}')\` binding in rn/generated/components/${name}.ts (the RN component is missing or misnamed)`);
    const recipeArgs = new Set(sites[`prototype/recipes/${name}.js`]);
    assert.ok(recipeArgs.has(name), `${name}: recipes/${name}.js does not \`nuriNames('${name}')\` (the web tag is missing or misnamed)`);
  }
});

// ── (c) the parallel hand-typed rosters agree with the one roster ──
test('naming · the drift-guard + doc rosters agree with DESCRIPTOR_COMPONENTS', () => {
  const driftKeys = topLevelObjectKeys(read(resolve(__dirname, 'docs-drift.test.js')), 'EXPECTED_DESCRIPTORS');
  assert.deepEqual(
    [...driftKeys].sort(),
    [...ROSTER].sort(),
    'scripts/docs-drift.test.js#EXPECTED_DESCRIPTORS keys drifted from DESCRIPTOR_COMPONENTS',
  );

  for (const spec of DOC_COMPONENTS) {
    assert.ok(rosterSet.has(spec.name), `@nuri/doc DOC_COMPONENTS names a non-roster component '${spec.name}'`);
  }
});
