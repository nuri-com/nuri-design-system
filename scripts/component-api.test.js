/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT-API GUARD · the api layer's ONLY defence (Path C · Phase 1)
 *
 * Path C makes the descriptor DECLARE its public API (`api` section · pure DATA ·
 * docs/component-api-target.md). Phase 1 adds that data + THIS guard and NOTHING
 * else: the renderer still ignores `api`, so the 5 behaviour/drift gates + the RN
 * render snapshots stay byte-identical — they CANNOT see `api` drift (handoff
 * PHILOSOPHY §4 · the gates catch behaviour, never api-shape). So this guard is
 * the only thing standing between a well-formed `api` and a broken one; it must be
 * COMPLETE across every channel of the shape (the Arc-2 blind-spot-oracle lesson ·
 * [[verify-guard-completeness]] — a guard that reproduces but under-checks reads as
 * coverage it doesn't have).
 *
 * It reads the AUTHORED descriptor via its committed browser-ESM twin
 * (packages/prototype/generated/descriptors/<name>.js · node cannot import the .ts;
 * the twin is a verbatim passthrough of the source, gated fresh by Guard D), and
 * validates every api against the SAME descriptor's anatomy + variants — seven
 * channels, each its own test so a mutation lands on a NAMED subtest:
 *   1. every `slots[*].part` exists in the anatomy (walk `structure.anatomy`);
 *   2. every `behaviour.pressable.target` exists in the anatomy AND that part
 *      declares `interactive` (base or a variant value) — onPress must not exist
 *      independent of interactivity (review §9);
 *   3. every `api.axes` member is a real `variants` axis key;
 *   4. every `propMaps.selected` names a real axis + real true/false values of it;
 *   5. AT MOST ONE slot carries `default: true`;
 *   6. `multiple: true` only on a `kind: 'children'` slot;
 *   7. `prop` (the scalar shorthand) ONLY on a SINGULAR `kind: 'icon-name'` slot
 *      (Overrides §1a · never text/node/region/children · never a `multiple` slot).
 *
 * Sibling to docs-drift.test.js / naming.test.js — picked up by the existing
 * `node --test scripts/*.test.js` gate · zero new deps.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DESCRIPTOR_COMPONENTS, exportNameFor } from './parsers/descriptors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const TWINS = resolve(REPO_ROOT, 'packages/prototype/generated/descriptors');

// Load every authored descriptor via its browser-ESM twin (the Guard-D path ·
// node cannot import the .ts). Keyed by public name, each value the descriptor
// object { structure, variants?, defaults?, decorative?, api }.
const CATALOG = Object.fromEntries(
  await Promise.all(
    DESCRIPTOR_COMPONENTS.map(async ({ name }) => {
      const twin = pathToFileURL(resolve(TWINS, `${name}.js`)).href;
      const descriptor = (await import(twin))[exportNameFor(name)];
      return [name, descriptor];
    }),
  ),
);
const NAMES = DESCRIPTOR_COMPONENTS.map((s) => s.name);

// ── anatomy helpers (the descriptor's structural truth the api is checked against) ──

// Every part NAME the anatomy declares — the host `root` plus every nested part,
// walked recursively (compound regions / leaf parts). This is the universe a
// slot/behaviour `part` must live in.
function anatomyParts(anatomy) {
  const names = new Set(['root']);
  const walk = (node) => {
    if (!node || !node.parts) return;
    for (const [part, child] of Object.entries(node.parts)) {
      names.add(part);
      walk(child);
    }
  };
  walk(anatomy);
  return names;
}

// Every part that declares an `interactive` opt-in in ANY composition layer —
// `structure.base` OR any `variants[axis][value]` (interactivity can be
// selection-dependent · geometry-bake's consumer-generality case). A pressable
// target must be in here (review §9 · onPress ⊂ interactive).
function interactiveParts(descriptor) {
  const set = new Set();
  const scan = (partMap) => {
    if (!partMap) return;
    for (const [part, ns] of Object.entries(partMap)) {
      if (ns && ns.interactive) set.add(part);
    }
  };
  scan(descriptor.structure.base);
  const variants = descriptor.variants || {};
  for (const axis of Object.keys(variants)) {
    for (const value of Object.keys(variants[axis])) scan(variants[axis][value]);
  }
  return set;
}

const axisKeys = (descriptor) => Object.keys(descriptor.variants || {});
const axisValues = (descriptor, axis) => Object.keys((descriptor.variants || {})[axis] || {});
const slotEntries = (descriptor) => Object.entries(descriptor.api.slots || {});

// Sanity: every roster descriptor actually carries an `api` (REQUIRED · Path C
// Phase 1). A missing `api` would make every channel below vacuously pass.
test('component-api · every descriptor declares an `api` block', () => {
  for (const name of NAMES) {
    const api = CATALOG[name].api;
    assert.ok(api && typeof api === 'object', `${name}: descriptor has no \`api\` block (REQUIRED · Path C Phase 1)`);
    assert.ok(Array.isArray(api.axes), `${name}: api.axes must be an array`);
    assert.ok(api.slots && typeof api.slots === 'object', `${name}: api.slots must be an object`);
  }
});

// ── Channel 1 · every slot part is a real anatomy part ──
test('component-api · every slot part exists in the anatomy', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const parts = anatomyParts(d.structure.anatomy);
    for (const [slot, spec] of slotEntries(d)) {
      assert.ok(
        parts.has(spec.part),
        `${name}: slot '${slot}' targets part '${spec.part}', which is not in the anatomy (${[...parts].join(', ')})`,
      );
    }
  }
});

// ── Channel 2 · every pressable target is a real, INTERACTIVE anatomy part ──
test('component-api · every behaviour.pressable.target is an interactive anatomy part', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const target = d.api.behaviour?.pressable?.target;
    if (target === undefined) continue; // non-interactive components declare no pressable
    const parts = anatomyParts(d.structure.anatomy);
    const interactive = interactiveParts(d);
    assert.ok(parts.has(target), `${name}: pressable.target '${target}' is not an anatomy part`);
    assert.ok(
      interactive.has(target),
      `${name}: pressable.target '${target}' does not declare \`interactive\` in base or any variant — ` +
        `onPress must not exist independent of interactivity (review §9)`,
    );
  }
});

// ── Channel 3 · every public axis is a real variants axis ──
test('component-api · every api.axes member is a real variants axis', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const keys = axisKeys(d);
    for (const axis of d.api.axes) {
      assert.ok(keys.includes(axis), `${name}: api.axes names '${axis}', which is not a variants axis (${keys.join(', ') || 'none'})`);
    }
  }
});

// ── Channel 4 · propMaps.selected names a real axis + real true/false values ──
test('component-api · propMaps.selected maps to a real axis and real values', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const sel = d.api.propMaps?.selected;
    if (!sel) continue;
    const keys = axisKeys(d);
    assert.ok(keys.includes(sel.axis), `${name}: propMaps.selected.axis '${sel.axis}' is not a variants axis (${keys.join(', ') || 'none'})`);
    const values = axisValues(d, sel.axis);
    assert.ok(values.includes(sel.true), `${name}: propMaps.selected.true '${sel.true}' is not a value of axis '${sel.axis}' (${values.join(', ')})`);
    assert.ok(values.includes(sel.false), `${name}: propMaps.selected.false '${sel.false}' is not a value of axis '${sel.axis}' (${values.join(', ')})`);
  }
});

// ── Channel 5 · at most one default slot ──
test('component-api · at most one slot carries default: true', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const defaults = slotEntries(d).filter(([, spec]) => spec.default === true).map(([slot]) => slot);
    assert.ok(defaults.length <= 1, `${name}: ${defaults.length} slots carry default:true (${defaults.join(', ')}) — at most one is allowed`);
  }
});

// ── Channel 6 · multiple: true only on a children slot ──
test('component-api · multiple: true only on a kind:children slot', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const [slot, spec] of slotEntries(d)) {
      if (spec.multiple === true) {
        assert.equal(spec.kind, 'children', `${name}: slot '${slot}' is multiple but kind '${spec.kind}' — multiple is only legal on kind:'children'`);
      }
    }
  }
});

// ── Channel 7 · prop only on a singular icon-name slot (the scalar shorthand) ──
test('component-api · prop only on a singular kind:icon-name slot', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const [slot, spec] of slotEntries(d)) {
      if (spec.prop === undefined) continue;
      assert.equal(spec.kind, 'icon-name', `${name}: slot '${slot}' declares prop '${spec.prop}' but kind '${spec.kind}' — the scalar shorthand is only legal on kind:'icon-name' (Overrides §1a)`);
      assert.notEqual(spec.multiple, true, `${name}: slot '${slot}' declares prop '${spec.prop}' but is multiple — the scalar shorthand requires a SINGULAR slot`);
    }
  }
});
