/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT-API GUARD · the api layer's ONLY defence (Path C · Phase 1)
 *
 * Path C makes the descriptor DECLARE its public API (`api` section · pure DATA ·
 * docs/archive/component-api-target.md). Phase 1 adds that data + THIS guard and NOTHING
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
 *   2.  the PRESSABLE COHERENCE rule (el:'pressable' · amendment 65.13 — the
 *       host element is structure data), all FOUR directions: every
 *       `behaviour.pressable.target` is an `el:'pressable'` anatomy part; every
 *       `el:'pressable'` part is THE declared `behaviour.pressable` target;
 *       `interactive` flags live ONLY on `el:'pressable'` parts (effects
 *       opt-ins imply the pressable host — verified to hold descriptor-wide);
 *       and every `el:'pressable'` part DECLARES `interactive` (base or a
 *       variant value) — onPress must not exist independent of interactivity
 *       (review §9 · the old rule's scan, restored as direction 4);
 *   2b. `behaviour.pressable.props` are a non-empty, duplicate-free subset of the
 *       legal public props (`onPress`/`disabled`/`accessibilityLabel`/`accessibilityValue`);
 *   3.  every `api.axes` member is a real `variants` axis key;
 *   3b. every `variants` axis is ACCOUNTED FOR — public in `api.axes` or bridged
 *       by a propMap (so no style axis silently drops from the public surface);
 *   4.  every `propMaps.selected` names a real axis + real true/false values of it;
 *   5.  AT MOST ONE slot carries `default: true`;
 *   6.  `multiple: true` only on a `kind: 'children'` slot OR a generated
 *       component slot;
 *   7.  `prop` (the scalar shorthand) ONLY on a SINGULAR `kind: 'icon-name'` or
 *       `kind: 'image-source'` slot (never text/node/region/children · never a
 *       `multiple` slot);
 *   8.  `themeScope.accent`, when declared, is exactly `true` (§2);
 *   9.  `default: true` is MUTUALLY EXCLUSIVE with `prop` (Option A · §1c — a default
 *       slot is children-delivered, a prop slot is prop-delivered · Phase-2 codegen);
 *   10. `default: true` only on a CHILDREN-deliverable kind — text/node/region/children,
 *       never `icon-name` (Option A · §1c · the untagged-children sink is a subtree).
 *   11. `component: true` is only used for composition slots (no `prop`/`default`)
 *       and all generated prop/slot identifiers are safe TS identifiers.
 *
 * Sibling to docs-drift.test.js / naming.test.js — picked up by the existing
 * `node --test scripts/*.test.js` gate · zero new deps.
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { emitComponentFile, HOST_ELS, validateComponentReferences } from './parsers/components-api.js';
import { DESCRIPTOR_COMPONENTS, exportNameFor } from './parsers/descriptors.js';
import { loadTsDataFromPath } from './ts-data-loader.js';

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

function anatomyDuplicates(anatomy) {
  const seen = new Set(['root']);
  const duplicates = [];
  const walk = (node) => {
    if (!node || !node.parts) return;
    for (const [part, child] of Object.entries(node.parts)) {
      if (part === 'root' || seen.has(part)) duplicates.push(part);
      seen.add(part);
      walk(child);
    }
  };
  walk(anatomy);
  return duplicates;
}

function authoredPartMaps(descriptor) {
  const maps = [];
  if (descriptor.structure.base) maps.push(['structure.base', descriptor.structure.base]);
  const variants = descriptor.variants || {};
  for (const [axis, values] of Object.entries(variants)) {
    for (const [value, partMap] of Object.entries(values)) {
      maps.push([`variants.${axis}.${value}`, partMap]);
    }
  }
  return maps;
}

// The legal slot `kind` vocabulary + the anatomy `el`s each kind may target
// (Phase-2 codegen branches on `kind`, so a kind that contradicts the part's
// element would mis-generate). `text`→a text leaf · `icon-name`→the glyph leaf ·
// `region`/`children`/`node`→a HOST (the schema's host/leaf partition — view OR
// pressable; both renderers serve a host's children through the same body path,
// so a slot kind must not reject the pressable half). A `children` sink must
// also be OPEN.
const KIND_ELS = { text: ['text'], 'icon-name': ['icon'], 'image-source': ['image'], region: HOST_ELS, children: HOST_ELS, node: HOST_ELS };
const KINDS = Object.keys(KIND_ELS);

// The public behaviour props a `pressable` may expose (mirrors the schema union
// `('onPress' | 'disabled' | 'accessibilityLabel' | 'accessibilityValue')[]` ·
// schema.ts). Codegen emits these onto the wrapper, so a bogus/missing entry
// must fail here.
const PRESSABLE_PROPS = ['onPress', 'disabled', 'accessibilityLabel', 'accessibilityValue'];
const INPUT_PROPS = ['value', 'onChangeText', 'placeholder', 'inputMode', 'secureTextEntry', 'autoCapitalize', 'sanitize', 'maxLength', 'disabled', 'onFocus', 'onBlur', 'accessibilityLabel'];
const SAFE_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

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

// ── The host/leaf partition · the script mirror is SoT-BOUND ──────────────────
// scripts run synchronously at emit time, so parsers/components-api.js carries a
// hand HOST_ELS mirror of schema.ts's totality-pinned partition. This test binds
// the mirror to the SoT (transpile-load the .ts · the ts-data-loader boundary):
// a partition change in schema.ts that misses the mirror — or vice versa — fails
// HERE, so the hand list can never drift silently. Also pins host/leaf
// disjointness (a member classified both ways is a partition bug, not a vocab).
const SCHEMA = await loadTsDataFromPath(resolve(REPO_ROOT, 'packages/spec/components/schema.ts'));
test('component-api · the script HOST_ELS mirror ≡ the schema host/leaf partition', () => {
  assert.deepEqual(
    [...HOST_ELS].sort(),
    [...SCHEMA.HOST_ELS].sort(),
    'parsers/components-api.js HOST_ELS drifted from schema.ts HOST_ELS — update the mirror',
  );
  const overlap = SCHEMA.HOST_ELS.filter((el) => SCHEMA.LEAF_ELS.includes(el));
  assert.deepEqual(overlap, [], `schema.ts classifies ${overlap.join(', ')} as BOTH host and leaf`);
  for (const el of SCHEMA.CONTROL_ELS || []) {
    assert.equal(SCHEMA.HOST_ELS.includes(el), false, `schema.ts classifies control '${el}' as a host`);
    assert.equal(SCHEMA.LEAF_ELS.includes(el), false, `schema.ts classifies control '${el}' as a leaf`);
  }
});

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

// ── Local part universe · anatomy is the descriptor-local source of truth ──
test('component-api · every descriptor anatomy has one root host and unique local part ids', () => {
  for (const name of NAMES) {
    const anatomy = CATALOG[name].structure.anatomy;
    assert.ok(anatomy && typeof anatomy === 'object', `${name}: structure.anatomy must be an object`);
    assert.ok(
      HOST_ELS.includes(anatomy.el),
      `${name}: root anatomy must be a HOST element (${HOST_ELS.join(' | ')}), got '${anatomy.el}'`,
    );
    const duplicates = anatomyDuplicates(anatomy);
    assert.deepEqual(duplicates, [], `${name}: anatomy reuses reserved/duplicate part ids (${duplicates.join(', ')})`);
  }
});

test('component-api · every structure/variant part map key is anatomy-local', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const index = anatomyIndex(d.structure.anatomy);
    for (const [surface, partMap] of authoredPartMaps(d)) {
      for (const part of Object.keys(partMap || {})) {
        assert.ok(
          index.has(part),
          `${name}: ${surface} styles part '${part}', which is not in the descriptor anatomy (${[...index.keys()].join(', ')})`,
        );
      }
    }
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
      if (node.component) {
        assert.equal(spec.component, true, `${name}: slot '${slot}' targets component-ref part '${spec.part}' but is not a generated component slot`);
        continue;
      }
      assert.notEqual(node.el, 'input', `${name}: slot '${slot}' targets el:'input' part '${spec.part}' — input controls are contentless and cannot be slot targets`);
      assert.ok(
        KIND_ELS[spec.kind].includes(node.el),
        `${name}: slot '${slot}' is kind '${spec.kind}' but its part '${spec.part}' is el '${node.el}' — expected el ${KIND_ELS[spec.kind].map((e) => `'${e}'`).join(' | ')}`,
      );
      if (spec.kind === 'children') {
        assert.equal(node.open, true, `${name}: slot '${slot}' is kind 'children' but part '${spec.part}' is not an \`open\` view (the positional-children host)`);
      }
    }
  }
});

test('component-api · behaviour.input and el:input anatomy cohere', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const index = anatomyIndex(d.structure.anatomy);
    const interactive = interactiveParts(d);
    const inputParts = [...index.entries()].filter(([, node]) => node.el === 'input').map(([part]) => part);
    const input = d.api.behaviour?.input;

    if (input !== undefined) {
      const node = index.get(input.target);
      assert.ok(node, `${name}: input.target '${input.target}' is not an anatomy part`);
      assert.equal(node?.el, 'input', `${name}: input.target '${input.target}' is el '${node?.el}' — the target must be el:'input'`);
    }

    for (const part of inputParts) {
      assert.equal(input?.target, part, `${name}: anatomy part '${part}' is el:'input' but is not the declared behaviour.input.target`);
      assert.equal(interactive.has(part), false, `${name}: el:'input' part '${part}' must not use interactive flags for focus styling`);
      const node = index.get(part);
      assert.deepEqual(Object.keys(node?.parts || {}), [], `${name}: el:'input' part '${part}' must not own child anatomy`);
    }
  }
});

test('component-api · behaviour.input focus/label targets and props are legal', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    const index = anatomyIndex(d.structure.anatomy);
    const input = d.api.behaviour?.input;
    if (!input) continue;

    const props = input.props;
    assert.ok(Array.isArray(props) && props.length > 0, `${name}: input.props must be a non-empty array (got ${JSON.stringify(props)})`);
    for (const p of props) {
      assert.ok(INPUT_PROPS.includes(p), `${name}: input.props has illegal member '${p}' (${INPUT_PROPS.join(', ')})`);
      assert.match(p, SAFE_IDENTIFIER, `${name}: input prop '${p}' is not a safe generated TS prop identifier`);
    }
    assert.equal(new Set(props).size, props.length, `${name}: input.props has duplicates (${props.join(', ')})`);

    if (input.focusTarget !== undefined) {
      const node = index.get(input.focusTarget);
      assert.ok(node, `${name}: input.focusTarget '${input.focusTarget}' is not an anatomy part`);
      assert.ok(HOST_ELS.includes(node?.el), `${name}: input.focusTarget '${input.focusTarget}' is el '${node?.el}' — expected a non-input host`);
    }
    if (input.labelPart !== undefined) {
      const node = index.get(input.labelPart);
      assert.ok(node, `${name}: input.labelPart '${input.labelPart}' is not an anatomy part`);
      assert.equal(node?.el, 'text', `${name}: input.labelPart '${input.labelPart}' is el '${node?.el}' — expected text`);
      const labelSlot = Object.values(d.api.slots || {}).find((slot) => slot.part === input.labelPart);
      assert.equal(labelSlot?.component, true, `${name}: input.labelPart '${input.labelPart}' must be exposed through a generated component slot`);
      if (labelSlot?.required !== true) {
        assert.ok(
          props.includes('accessibilityLabel'),
          `${name}: optional input labelPart '${input.labelPart}' requires accessibilityLabel as the alternate naming channel`,
        );
      }
    }
  }
});

// ── Channel 2 · the PRESSABLE COHERENCE rule (el:'pressable' · amendment 65.13) ──
// The host element is STRUCTURE data: `el:'pressable'` in the anatomy, the declared
// `behaviour.pressable.target`, and the `interactive` effect opt-ins must name the
// SAME parts, all FOUR directions (a true equivalence of the three legs). A
// descriptor that flips one leg without the others (a pressable root with no
// declared behaviour · a target that is a static view · interactive flags on a
// non-pressable part · a pressable with no effects opt-in at all) fails on a
// NAMED direction.
function assertPressableRoleCoherence(name, descriptor) {
  const pressable = descriptor.api.behaviour?.pressable;
  if (pressable?.role === 'tab') {
    assert.ok(
      descriptor.api.propMaps?.selected,
      `${name}: behaviour.pressable.role 'tab' requires a declared propMaps.selected bridge`,
    );
  }
}

test('component-api · behaviour.pressable, el:pressable anatomy, and interactive flags cohere', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    assertPressableRoleCoherence(name, d);
    const index = anatomyIndex(d.structure.anatomy);
    const interactive = interactiveParts(d);
    const pressableParts = [...index.entries()].filter(([, node]) => node.el === 'pressable').map(([part]) => part);
    const target = d.api.behaviour?.pressable?.target;

    // direction 1 · a declared target must be an el:'pressable' anatomy part.
    if (target !== undefined) {
      const node = index.get(target);
      assert.ok(node, `${name}: pressable.target '${target}' is not an anatomy part`);
      assert.equal(
        node?.el,
        'pressable',
        `${name}: pressable.target '${target}' is el '${node?.el}' — the target must be an el:'pressable' host (the host element is structure data)`,
      );
    }

    // direction 2 · every el:'pressable' part must be THE declared behaviour target
    // (the schema carries at most one `behaviour.pressable`, so a pressable part
    // that is not the target is an undeclared — hence unreachable — press host).
    for (const part of pressableParts) {
      assert.equal(
        target,
        part,
        `${name}: anatomy part '${part}' is el:'pressable' but is not the declared behaviour.pressable.target (got '${target}')`,
      );
    }

    // direction 3 · `interactive` effect opt-ins live ONLY on el:'pressable' parts —
    // a static part must never react (press effects imply the pressable host).
    for (const part of interactive) {
      assert.equal(
        index.get(part)?.el,
        'pressable',
        `${name}: part '${part}' declares \`interactive\` flags but is el '${index.get(part)?.el}' — effects opt-ins live only on el:'pressable' parts`,
      );
    }

    // direction 4 · every el:'pressable' part DECLARES `interactive` in
    // `structure.base` or a variant value (the pre-65.13 rule's exact scan ·
    // interactiveParts) — onPress must not exist independent of interactivity
    // (review §9). Directions 3+4 together make interactive ↔ pressable a true
    // equivalence, not a one-way implication.
    for (const part of pressableParts) {
      assert.ok(
        interactive.has(part),
        `${name}: part '${part}' is el:'pressable' but declares no \`interactive\` opt-in in base or any variant — ` +
          `onPress must not exist independent of interactivity (review §9)`,
      );
    }
  }
});

test("component-api · pressable role 'tab' requires propMaps.selected", () => {
  const malformed = structuredClone(CATALOG['tab-bar-item']);
  delete malformed.api.propMaps.selected;
  assert.throws(
    () => assertPressableRoleCoherence('malformed-tab', malformed),
    /malformed-tab: behaviour\.pressable\.role 'tab' requires a declared propMaps\.selected bridge/,
  );
});

test('component-api · component references are known, acyclic, and map legal compatible props', () => {
  assert.doesNotThrow(() => validateComponentReferences(CATALOG));
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

test("component-api · behaviour.pressable.popup is the closed static 'dialog' semantic", () => {
  for (const name of NAMES) {
    const popup = CATALOG[name].api.behaviour?.pressable?.popup;
    if (popup !== undefined) {
      assert.equal(popup, 'dialog', `${name}: behaviour.pressable.popup must be 'dialog' when declared`);
    }
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

// ── Channel 6 · multiple: true only on a children slot or generated component slot ──
test('component-api · multiple: true only on a kind:children slot or generated component slot', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const [slot, spec] of slotEntries(d)) {
      if (spec.multiple === true) {
        assert.ok(
          spec.kind === 'children' || spec.component === true,
          `${name}: slot '${slot}' is multiple but kind '${spec.kind}' and component is not true — multiple is only legal on kind:'children' or generated component slots`,
        );
      }
    }
  }
});

// ── Channel 7 · prop only on a singular scalar slot ──
test('component-api · prop only on a singular icon-name/image-source slot', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const [slot, spec] of slotEntries(d)) {
      if (spec.prop === undefined) continue;
      assert.ok(['icon-name', 'image-source'].includes(spec.kind), `${name}: slot '${slot}' declares prop '${spec.prop}' but kind '${spec.kind}' — the scalar shorthand is only legal on kind:'icon-name' or kind:'image-source'`);
      assert.notEqual(spec.multiple, true, `${name}: slot '${slot}' declares prop '${spec.prop}' but is multiple — the scalar shorthand requires a SINGULAR slot`);
    }
  }
});

// ── Channel 9 · `default: true` is MUTUALLY EXCLUSIVE with `prop` (Option A · §1c) ──
// A `default` slot is CHILDREN-delivered (a bare positional child fills it); a `prop`
// slot is PROP-delivered (the scalar `icon` shorthand · §1a). The two delivery modes
// are exclusive — a slot cannot be both the children-sink AND a prop. Phase-2 codegen
// branches on this (a `default` slot → `children?: ReactNode`; a `prop` slot → the
// scalar prop; a component with NEITHER → `children?: never`), so the contradiction
// must fail here.
test('component-api · default:true is mutually exclusive with prop', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const [slot, spec] of slotEntries(d)) {
      if (spec.default === true) {
        assert.equal(
          spec.prop,
          undefined,
          `${name}: slot '${slot}' is default:true AND declares prop '${spec.prop}' — a default slot is CHILDREN-delivered, ⊥ the prop-delivered scalar shorthand (Option A · §1c)`,
        );
      }
    }
  }
});

// ── Channel 10 · `default: true` only on a CHILDREN-deliverable kind (never icon-name) ──
// The untagged-children sink accepts a React subtree (`text`/`node`/`region`/
// `children`); a scalar `icon-name` glyph is NOT children (it is the `prop` shorthand ·
// §1a). Codegen would mis-generate a `children?: ReactNode` for a glyph slot, so a
// `default:true` on `kind:'icon-name'` must fail (Option A · §1c).
const DEFAULT_KINDS = ['text', 'node', 'region', 'children'];
test('component-api · default:true only on a text/node/region/children slot', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const [slot, spec] of slotEntries(d)) {
      if (spec.default === true) {
        assert.ok(
          DEFAULT_KINDS.includes(spec.kind),
          `${name}: slot '${slot}' is default:true but kind '${spec.kind}' — the untagged-children sink is only legal on ${DEFAULT_KINDS.join('/')} (never icon-name · Option A · §1c)`,
        );
      }
    }
  }
});

// ── Channel 8 · themeScope.accent declarations are explicit ──
// Accent is a component-local public scope. Components that expose it declare it
// as `true`; components that only delegate accent through a typed slot omit it.
test('component-api · themeScope.accent declarations are true when present', () => {
  for (const name of NAMES) {
    const scope = CATALOG[name].api.themeScope;
    if (scope !== undefined) {
      assert.equal(scope.accent, true, `${name}: api.themeScope.accent must be \`true\` when declared`);
    }
  }
});

// ── Channel 11 · generated identifiers stay safe and component slots are composition-only ──
test('component-api · generated prop and component-slot identifiers are safe', () => {
  for (const name of NAMES) {
    const d = CATALOG[name];
    for (const axis of d.api.axes) {
      assert.match(axis, SAFE_IDENTIFIER, `${name}: api axis '${axis}' is not a safe generated TS prop identifier`);
    }
    for (const propMap of Object.keys(d.api.propMaps || {})) {
      assert.match(propMap, SAFE_IDENTIFIER, `${name}: propMap '${propMap}' is not a safe generated TS prop identifier`);
    }
    for (const prop of d.api.behaviour?.pressable?.props || []) {
      assert.match(prop, SAFE_IDENTIFIER, `${name}: pressable prop '${prop}' is not a safe generated TS prop identifier`);
    }
    for (const prop of d.api.behaviour?.input?.props || []) {
      assert.match(prop, SAFE_IDENTIFIER, `${name}: input prop '${prop}' is not a safe generated TS prop identifier`);
    }
    for (const [slot, spec] of slotEntries(d)) {
      assert.match(slot, SAFE_IDENTIFIER, `${name}: slot '${slot}' is not a safe generated TS identifier suffix`);
      if (spec.prop !== undefined) {
        assert.match(spec.prop, SAFE_IDENTIFIER, `${name}: slot '${slot}' prop '${spec.prop}' is not a safe generated TS prop identifier`);
      }
      if (spec.component === true) {
        assert.equal(spec.prop, undefined, `${name}: component slot '${slot}' declares prop '${spec.prop}' — rich composition is not a named prop`);
        assert.notEqual(spec.default, true, `${name}: component slot '${slot}' is default:true — default remains only the bare untagged-children sink`);
        assert.notEqual(spec.kind, 'region', `${name}: component slot '${slot}' is a region — regions use their existing marker harvest path`);
      }
    }
  }
});

test('component-api · codegen accepts descriptor-local part ids outside the old roster', () => {
  const descriptor = {
    structure: {
      anatomy: { el: 'view', parts: { badge: { el: 'text' } } },
      base: { root: { stack: { direction: 'row' } }, badge: { typography: { size: 'sm' } } },
    },
    variants: {
      tone: {
        quiet: { badge: { palette: { muted: true } } },
        loud: { badge: { typography: { emphasis: true } } },
      },
    },
    defaults: { tone: 'quiet' },
    api: {
      axes: ['tone'],
      themeScope: { accent: true },
      slots: {
        default: { part: 'badge', kind: 'text', default: true },
      },
    },
  };

  const source = emitComponentFile({ name: 'local-probe' }, descriptor);
  assert.match(source, /type LocalProbePart = 'root' \| 'badge';/);
  assert.match(source, /const content: Partial<Record<LocalProbePart, React\.ReactNode>> = \{\};/);
  assert.doesNotMatch(source, /import type \{ Part \}/);
});

test('component-api · codegen forwards generic pressable value and static popup channels', () => {
  const descriptor = {
    structure: {
      anatomy: { el: 'pressable', parts: { label: { el: 'text' } } },
      base: { root: { interactive: { pressScale: true } }, label: { typography: { size: 'sm' } } },
    },
    api: {
      axes: [],
      behaviour: {
        pressable: {
          target: 'root',
          popup: 'dialog',
          props: ['onPress', 'accessibilityLabel', 'accessibilityValue'],
        },
      },
      slots: { default: { part: 'label', kind: 'text', default: true } },
    },
  };

  const source = emitComponentFile({ name: 'disclosure-probe' }, descriptor);
  assert.match(source, /accessibilityValue\?: string;/);
  assert.match(source, /popup: "dialog",/);
  assert.match(source, /accessibilityValue: props\.accessibilityValue,/);
  assert.doesNotMatch(source, /select-field/i);
});

test('component-api · codegen warns generically for an unnamed optional-label input', () => {
  const descriptor = {
    structure: {
      anatomy: {
        el: 'view',
        parts: { label: { el: 'text' }, box: { el: 'view', parts: { input: { el: 'input' } } } },
      },
    },
    api: {
      axes: [],
      behaviour: {
        input: {
          target: 'input',
          labelPart: 'label',
          props: ['accessibilityLabel'],
        },
      },
      slots: { label: { part: 'label', kind: 'text', component: true } },
    },
  };

  const source = emitComponentFile({ name: 'input-probe' }, descriptor);
  assert.match(source, /let warnedInputProbeAccessibleName = false;/);
  assert.match(source, /harvestedComposition\.items\.some\(\(entry\) => entry\.part === "label"\)/);
  assert.match(source, /props\.accessibilityLabel === undefined/);
  assert.doesNotMatch(source, /text-field/i);
});

test('component-api · mixed composition preserves a default region for bare children', () => {
  const descriptor = {
    structure: {
      anatomy: {
        el: 'view',
        open: true,
        parts: {
          content: { el: 'view', parts: { title: { el: 'text' } } },
          actions: { el: 'view' },
        },
      },
    },
    api: {
      axes: [],
      slots: {
        content: { part: 'content', kind: 'region' },
        title: { part: 'title', kind: 'text', component: true },
        actions: { part: 'actions', kind: 'region', default: true },
      },
    },
  };

  const source = emitComponentFile({ name: 'mixed-probe' }, descriptor);
  assert.match(source, /if \(!harvestedComposition\.hasSlots && props\.children !== undefined\) content\["actions"\] = props\.children;/);
  assert.doesNotMatch(source, /topbar/i);
});
