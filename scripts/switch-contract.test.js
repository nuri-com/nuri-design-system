/* ──────────────────────────────────────────────────────────────
 * NURI · GUARD · THE SWITCH CONTRACT (prompts/admission-switch.md)
 *
 * Three claims the gates do not otherwise prove, each with the comparison surface
 * named (a guard proves only what it COMPARES · docs/archive/debt-register.md §2):
 *
 *   1 · PARITY — list-switch's trailing pill is a STATIC COPY of switch's look:
 *       list-switch.{track,thumb} ≡ switch.{root,thumb} over `structure.base` AND
 *       every `state` value, plus the `state` vocab + default. Compared DEEP and
 *       key-order-insensitive, MINUS `interactive` (press feedback belongs to the
 *       CONTROL — the row root washes, the standalone pill carries none) and minus
 *       the anatomy `el` (host vs view · structure, not look). A visual change to
 *       the switch edits BOTH descriptor files; this fails until both move.
 *   2 · THE `checked` BRIDGE — maps to a real INTERNAL axis + real true/false values
 *       (the Channel-4 twin for the `selected` sibling).
 *   3 · ROLE COUPLING — `role: 'switch'` ⇔ `propMaps.checked`, both directions, and
 *       never `selected` + `checked` on one descriptor (one state semantic per control).
 *
 * 2 + 3 also fail loudly at emit time (components-api.js validatePropMapBridges);
 * here they are pinned against the committed twins, and every claim is
 * MUTATION-CHECKED with a synthetic descriptor (the guard-completeness lesson:
 * reproducing a guard is not enough — prove what it rejects).
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DESCRIPTOR_COMPONENTS, exportNameFor } from './parsers/descriptors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TWINS = resolve(__dirname, '../packages/prototype/generated/descriptors');

// The committed browser-ESM twins (the Guard-D path · node cannot import the .ts).
const CATALOG = Object.fromEntries(
  await Promise.all(
    DESCRIPTOR_COMPONENTS.map(async ({ name }) => {
      const twin = pathToFileURL(resolve(TWINS, `${name}.js`)).href;
      return [name, (await import(twin))[exportNameFor(name)]];
    }),
  ),
);
const NAMES = DESCRIPTOR_COMPONENTS.map((s) => s.name);

// ── 1 · the parity comparison ──────────────────────────────────────────────

// Deep key-sorted canonical form, so authoring order never masks or manufactures
// a delta (the two files may list `stack`/`box`/`palette` in any order).
function canon(value) {
  if (Array.isArray(value)) return value.map(canon);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canon(value[k])]));
  }
  return value;
}
const stripInteractive = (ns) => {
  if (!ns || typeof ns !== 'object') return ns ?? null;
  const { interactive, ...rest } = ns;
  return rest;
};
const show = (v) => JSON.stringify(canon(v));

// Every delta between the switch look and the row's copy — [] means parity.
export function switchLookDelta(sw, row) {
  const deltas = [];
  const pairs = [['root', 'track'], ['thumb', 'thumb']];
  const surfaces = [['structure.base', sw?.structure?.base, row?.structure?.base]];
  const swStates = Object.keys(sw?.variants?.state || {});
  for (const value of swStates) surfaces.push([`variants.state.${value}`, sw.variants.state[value], row?.variants?.state?.[value]]);
  for (const [label, swMap, rowMap] of surfaces) {
    if (!rowMap) {
      deltas.push(`${label}: missing on list-switch`);
      continue;
    }
    for (const [swPart, rowPart] of pairs) {
      const a = show(stripInteractive(swMap?.[swPart]));
      const b = show(stripInteractive(rowMap?.[rowPart]));
      if (a !== b) deltas.push(`${label}: switch.${swPart} ${a} ≠ list-switch.${rowPart} ${b}`);
    }
  }
  const rowStates = Object.keys(row?.variants?.state || {});
  if ([...swStates].sort().join() !== [...rowStates].sort().join()) {
    deltas.push(`state vocab differs: switch [${swStates}] vs list-switch [${rowStates}]`);
  }
  if (sw?.defaults?.state !== row?.defaults?.state) deltas.push('defaults.state differs');
  return deltas;
}

test('switch-contract · 1 · list-switch.{track,thumb} ≡ switch.{root,thumb} (base + every state · minus interactive)', () => {
  assert.ok(CATALOG.switch, 'switch twin is in the catalog');
  assert.ok(CATALOG['list-switch'], 'list-switch twin is in the catalog');
  assert.deepEqual(switchLookDelta(CATALOG.switch, CATALOG['list-switch']), []);
  // The exclusion is DELIBERATE and asymmetric by design: the row root washes, the
  // standalone pill carries no press-down effect. Pin both so neither drifts silently.
  assert.deepEqual(CATALOG.switch.structure.base.root.interactive, { disabledOpacity: true });
  assert.equal(CATALOG['list-switch'].structure.base.track.interactive, undefined, 'the static track never reacts');
  assert.equal(CATALOG['list-switch'].structure.base.thumb.interactive, undefined);
});

test('switch-contract · 1 · the parity comparison REJECTS a drifted copy (mutation check)', () => {
  const sw = CATALOG.switch;
  const mutate = (fn) => {
    const row = structuredClone(CATALOG['list-switch']);
    fn(row);
    return switchLookDelta(sw, row);
  };
  // geometry drift in base
  assert.ok(mutate((r) => { r.structure.base.track.box.width = 'lg'; }).length > 0, 'a track width drift is caught');
  // colour drift in a state value
  assert.ok(mutate((r) => { r.variants.state.off.track.palette = { chrome: 'strong' }; }).length > 0, 'an off-track chrome drift is caught');
  // thumb park position drift
  assert.ok(mutate((r) => { r.variants.state.on.track.stack.justify = 'center'; }).length > 0, 'a thumb park drift is caught');
  // a missing part
  assert.ok(mutate((r) => { delete r.structure.base.thumb; }).length > 0, 'a dropped thumb is caught');
  // a missing state value / a changed default
  assert.ok(mutate((r) => { delete r.variants.state.off; }).length > 0, 'a dropped state value is caught');
  assert.ok(mutate((r) => { r.defaults.state = 'on'; }).length > 0, 'a default drift is caught');
  // …while `interactive` on the ROW root is outside the comparison (by design) —
  // and so is key order (the canonical form).
  assert.deepEqual(mutate((r) => { r.structure.base.root.interactive = { pressScale: true }; }), []);
  assert.deepEqual(
    mutate((r) => { r.structure.base.track = { box: r.structure.base.track.box, stack: r.structure.base.track.stack }; }),
    [],
    'authoring order is not a delta',
  );
});

// ── 2 + 3 · the checked bridge + the role coupling ────────────────────────

export function assertSwitchSemantics(name, d) {
  const checked = d.api?.propMaps?.checked;
  const selected = d.api?.propMaps?.selected;
  const role = d.api?.behaviour?.pressable?.role;
  if (checked) {
    const axes = Object.keys(d.variants || {});
    assert.ok(axes.includes(checked.axis), `${name}: propMaps.checked.axis '${checked.axis}' is not a variants axis (${axes.join(', ') || 'none'})`);
    const values = Object.keys(d.variants[checked.axis] || {});
    assert.ok(values.includes(checked.true), `${name}: propMaps.checked.true '${checked.true}' is not a value of axis '${checked.axis}'`);
    assert.ok(values.includes(checked.false), `${name}: propMaps.checked.false '${checked.false}' is not a value of axis '${checked.axis}'`);
    assert.notEqual(checked.true, checked.false, `${name}: propMaps.checked arms must differ`);
    assert.ok(!(d.api.axes || []).includes(checked.axis), `${name}: propMaps.checked axis '${checked.axis}' must be INTERNAL (not in api.axes)`);
    assert.equal(role, 'switch', `${name}: propMaps.checked requires behaviour.pressable.role 'switch'`);
    assert.equal(selected, undefined, `${name}: propMaps.selected and propMaps.checked are mutually exclusive`);
  }
  if (role === 'switch') {
    assert.ok(checked, `${name}: behaviour.pressable.role 'switch' requires a declared propMaps.checked bridge`);
  }
}

test('switch-contract · 2 + 3 · every descriptor honours the checked bridge + the switch-role coupling', () => {
  for (const name of NAMES) assertSwitchSemantics(name, CATALOG[name]);
  // and the two toggles actually declare it (the rule is not vacuously true).
  for (const name of ['switch', 'list-switch']) {
    assert.equal(CATALOG[name].api.behaviour.pressable.role, 'switch');
    assert.deepEqual(CATALOG[name].api.propMaps.checked, { axis: 'state', true: 'on', false: 'off' });
    assert.deepEqual(CATALOG[name].api.axes, [], `${name}: the state axis is never a public attribute`);
  }
});

test('switch-contract · 2 + 3 · the semantics check REJECTS each malformed shape (mutation check)', () => {
  const base = CATALOG.switch;
  const mutated = (fn) => {
    const d = structuredClone(base);
    fn(d);
    return () => assertSwitchSemantics('synthetic', d);
  };
  assert.throws(mutated((d) => { d.api.propMaps.checked.axis = 'mode'; }), /not a variants axis/);
  assert.throws(mutated((d) => { d.api.propMaps.checked.true = 'selected'; }), /not a value of axis/);
  assert.throws(mutated((d) => { d.api.axes = ['state']; }), /must be INTERNAL/);
  assert.throws(mutated((d) => { d.api.behaviour.pressable.role = 'button'; }), /requires behaviour.pressable.role 'switch'/);
  assert.throws(mutated((d) => { d.api.propMaps.selected = { axis: 'state', true: 'on', false: 'off' }; }), /mutually exclusive/);
  assert.throws(mutated((d) => { delete d.api.propMaps.checked; }), /requires a declared propMaps.checked bridge/);
  // the well-formed shape passes
  assert.doesNotThrow(mutated(() => {}));
});
