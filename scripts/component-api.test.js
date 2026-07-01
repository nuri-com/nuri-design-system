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
 * validates every api against the SAME descriptor's anatomy + variants — one
 * channel per test so a mutation lands on a NAMED subtest. It covers EVERY
 * Phase-2-codegen-critical field (not just part existence · the review's ask):
 *   1.  every `slots[*].part` exists in the anatomy (walk `structure.anatomy`);
 *   1b. every slot `kind` is a legal literal AND matches its part's `el`
 *       (`text`→text · `icon-name`→icon · `region`/`node`→view · `children`→OPEN view);
 *   2.  every `behaviour.pressable.target` exists in the anatomy AND that part
 *       declares `interactive` (base or a variant value) — onPress must not exist
 *       independent of interactivity (review §9);
 *   2b. `behaviour.pressable.props` are a non-empty, duplicate-free subset of the
 *       legal public props (`onPress`/`disabled`/`accessibilityLabel`);
 *   3.  every `api.axes` member is a real `variants` axis key;
 *   3b. every `variants` axis is ACCOUNTED FOR — public in `api.axes` or bridged
 *       by a propMap (so no style axis silently drops from the public surface);
 *   4.  every `propMaps.selected` names a real axis + real true/false values of it;
 *   5.  AT MOST ONE slot carries `default: true`;
 *   6.  `multiple: true` only on a `kind: 'children'` slot;
 *   7.  `prop` (the scalar shorthand) ONLY on a SINGULAR `kind: 'icon-name'` slot
 *       (Overrides §1a · never text/node/region/children · never a `multiple` slot);
 *   8.  `themeScope.accent` is declared `true` on every descriptor (universal · §2).
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

// Index the anatomy by part NAME → its `PartAnatomy` node — the host `root` (the
// anatomy object itself) plus every nested part, walked recursively (compound
// regions / leaf parts). The universe a slot/behaviour `part` must live in, AND
// the source of each part's `el`/`open` for the kind↔el check below.
function anatomyIndex(anatomy) {
  const index = new Map([['root', anatomy]]);
  const walk = (node) => {
    if (!node || !node.parts) return;
    for (const [part, child] of Object.entries(node.parts)) {
      index.set(part, child);
      walk(child);
    }
  };
  walk(anatomy);
  return index;
}

// The legal slot `kind` vocabulary + the anatomy `el` each kind must target
// (Phase-2 codegen branches on `kind`, so a kind that contradicts the part's
// element would mis-generate). `text`→a text leaf · `icon-name`→the glyph leaf ·
// `region`/`children`/`node`→a view host (a `children` sink must also be OPEN).
const KIND_EL = { text: 'text', 'icon-name': 'icon', region: 'view', children: 'view', node: 'view' };
const KINDS = Object.keys(KIND_EL);

// The public behaviour props a `pressable` may expose (mirrors the schema union
// `('onPress' | 'disabled' | 'accessibilityLabel')[]` · schema.ts). Codegen emits
// these onto the wrapper, so a bogus/missing entry must fail here.
const PRESSABLE_PROPS = ['onPress', 'disabled', 'accessibilityLabel'];

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
    const index = anatomyIndex(d.structure.anatomy);
    for (const [slot, spec] of slotEntries(d)) {
      assert.ok(
        index.has(spec.part),
        `${name}: slot '${slot}' targets part '${spec.part}', which is not in the anatomy (${[...index.keys()].join(', ')})`,
      );
    }
  }
});

// ── Channel 1b · every slot `kind` is legal AND matches its part's element ──
// Phase-2 codegen branches on `kind`; a kind that contradicts the target part's
// `el` (`text` on a glyph · `icon-name` on a text leaf) would mis-generate. A
// `children` sink must additionally be an OPEN view (the positional-children host).
test('component-api · every slot kind is legal and matches its part element', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const index = anatomyIndex(d.structure.anatomy);
    for (const [slot, spec] of slotEntries(d)) {
      assert.ok(KINDS.includes(spec.kind), `${name}: slot '${slot}' has illegal kind '${spec.kind}' (${KINDS.join(', ')})`);
      const node = index.get(spec.part);
      if (!node) continue; // part-existence is Channel 1's failure to report
      assert.equal(
        node.el,
        KIND_EL[spec.kind],
        `${name}: slot '${slot}' is kind '${spec.kind}' but its part '${spec.part}' is el '${node.el}' — expected el '${KIND_EL[spec.kind]}'`,
      );
      if (spec.kind === 'children') {
        assert.equal(node.open, true, `${name}: slot '${slot}' is kind 'children' but part '${spec.part}' is not an \`open\` view (the positional-children host)`);
      }
    }
  }
});

// ── Channel 2 · every pressable target is a real, INTERACTIVE anatomy part ──
test('component-api · every behaviour.pressable.target is an interactive anatomy part', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const target = d.api.behaviour?.pressable?.target;
    if (target === undefined) continue; // non-interactive components declare no pressable
    const index = anatomyIndex(d.structure.anatomy);
    const interactive = interactiveParts(d);
    assert.ok(index.has(target), `${name}: pressable.target '${target}' is not an anatomy part`);
    assert.ok(
      interactive.has(target),
      `${name}: pressable.target '${target}' does not declare \`interactive\` in base or any variant — ` +
        `onPress must not exist independent of interactivity (review §9)`,
    );
  }
});

// ── Channel 2b · pressable.props exist, are an array, and are all legal ──
// Codegen emits these onto the wrapper's public surface, so a missing/bogus prop
// must fail now (before the wrappers exist to catch it).
test('component-api · behaviour.pressable.props are a non-empty subset of the legal props', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const pressable = d.api.behaviour?.pressable;
    if (pressable === undefined) continue;
    const props = pressable.props;
    assert.ok(Array.isArray(props) && props.length > 0, `${name}: pressable.props must be a non-empty array (got ${JSON.stringify(props)})`);
    for (const p of props) {
      assert.ok(PRESSABLE_PROPS.includes(p), `${name}: pressable.props has illegal member '${p}' (${PRESSABLE_PROPS.join(', ')})`);
    }
    assert.equal(new Set(props).size, props.length, `${name}: pressable.props has duplicates (${props.join(', ')})`);
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

// ── Channel 3b · every variants axis is ACCOUNTED FOR — public or bridged ──
// The reverse of Channel 3: an axis that exists in `variants` but is neither
// surfaced in `api.axes` nor bridged by a propMap would silently drop from the
// generated wrapper's public surface. Every axis must be one or the other.
test('component-api · every variants axis is public (api.axes) or bridged (propMaps)', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const publicAxes = new Set(d.api.axes);
    const bridgedAxes = new Set(Object.values(d.api.propMaps || {}).map((m) => m.axis));
    for (const axis of axisKeys(d)) {
      assert.ok(
        publicAxes.has(axis) || bridgedAxes.has(axis),
        `${name}: variants axis '${axis}' is neither in api.axes nor bridged by a propMap — it would drop from the public surface`,
      );
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

// ── Channel 8 · themeScope.accent is DECLARED on every descriptor (universal) ──
// accent is Option 1 — universal-but-DECLARED (Overrides §2 · docs/component-api-target.md):
// every component carries the accent scope, and the honest shape is to DECLARE it
// (not hard-code a global ThemeScopeProps). So every descriptor must set it.
test('component-api · themeScope.accent is declared true on every descriptor', () => {
  for (const name of NAMES) {
    assert.equal(
      CATALOG[name].api.themeScope?.accent,
      true,
      `${name}: api.themeScope.accent must be \`true\` — accent is universal-but-DECLARED (Overrides §2)`,
    );
  }
});
