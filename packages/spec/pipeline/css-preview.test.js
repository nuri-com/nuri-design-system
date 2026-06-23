/* ──────────────────────────────────────────────────────────────
 * NURI · CSS-PREVIEW PARITY HARNESS (the L3.1 reversible spike · decision 70)
 *
 * Proves the GENERATED shadow namespace CSS (build/css-preview/<ns>.css · from
 * the Field table via pipeline/parsers/namespace-css.js) is EQUIVALENT to the
 * hand SoT lib/components/<ns>/<ns>.css (the parity oracle · decision 2 stands
 * until the L3 flip). This is the L3 analog of B1's Guard D — the generated
 * output has two agreeing sources until the hand CSS retires.
 *
 * Four guards (node-only · the no-browser CI gate):
 *   A · STRUCTURAL ≡ — generated and hand carry the SAME @layer rules: the same
 *       selector set, each with the same declaration set (comments excepted ·
 *       order-insensitive · rule order differs [table order vs the hand's
 *       grouping] but is cascade-irrelevant here — every dispatch rule sets a
 *       disjoint property or a mutually-exclusive attribute value, asserted in
 *       Guard D). Identical (selector → declarations) ⇒ identical stylesheet ⇒
 *       identical computed style (CSS computed value is a pure function of the
 *       matched declarations) — so this is the core computed-style proof.
 *   B · RE-EMIT FRESHNESS — the committed build/css-preview/<ns>.css is exactly
 *       what the emitter produces now (the committed shadow cannot drift · the
 *       Guard-D/E posture · re-run pipeline/css-preview.js).
 *   C · RESOLVED-VALUE SPOT-CHECK — a curated cell set resolves through the REAL
 *       token CSS (styles/tokens-{primitive,semantic}.css · var() → final px) or
 *       carries the expected literal; asserted against an INDEPENDENT oracle (the
 *       design scale numbers · not read from hand). Confirms the generated CSS's
 *       indirection bottoms out at the right values. The logical→physical
 *       COMPUTED mapping (inline-size→width …) is the browser harness's job
 *       (pipeline/css-preview-computed-check.html · run via the preview tooling).
 *   D · ORDER-IRRELEVANCE — no two generated rules set the SAME property to a
 *       DIFFERENT value via selectors that can co-match one element (so the
 *       table-order vs hand-order difference cannot change any computed value).
 *
 * Run:  node --test pipeline/css-preview.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { generateAll } from './css-preview.js';
import { NS_SPECS } from './parsers/namespace-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec
const handCssPath = (ns) => resolve(REPO_ROOT, `lib/components/${ns}/${ns}.css`);
const shadowCssPath = (ns) => resolve(REPO_ROOT, `build/css-preview/${ns}.css`);

// ── parse a stylesheet's `@layer rules` → Map<selector, Map<prop,value>> ──
// postcss skips comment nodes for walkDecls/walkRules, so comments are excepted
// naturally. Multi-selector rules are split (defensive · box/stack have none).
// A duplicate (selector, prop) within one file is a parse-level surprise → throw.
function layerRuleMap(css, layer = 'rules') {
  const root = postcss.parse(css);
  const map = new Map();
  root.walkAtRules('layer', (at) => {
    if (at.params !== layer) return;
    at.walkRules((rule) => {
      for (const selRaw of rule.selector.split(',')) {
        const sel = selRaw.trim();
        if (!map.has(sel)) map.set(sel, new Map());
        const decls = map.get(sel);
        rule.walkDecls((d) => {
          if (decls.has(d.prop)) {
            throw new Error(`duplicate decl '${d.prop}' for '${sel}'`);
          }
          decls.set(d.prop, d.value.trim());
        });
      }
    });
  });
  return map;
}

// a stable, comparable string for a selector's declarations (order-insensitive).
const declSig = (declMap) =>
  [...declMap.entries()].map(([p, v]) => `${p}: ${v}`).sort().join('; ');

// in-memory generation, once (one source, two readers · decision 48).
const generated = await generateAll();
const genByNs = new Map(generated.map((g) => [g.ns, g.css]));

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (generated vs the hand oracle)
// ══════════════════════════════════════════════════════════════════
for (const { ns } of NS_SPECS) {
  test(`Guard A · ${ns}: generated namespace CSS ≡ hand ${ns}.css (structural)`, () => {
    const hand = layerRuleMap(readFileSync(handCssPath(ns), 'utf8'));
    const gen = layerRuleMap(genByNs.get(ns));

    const handSels = [...hand.keys()].sort();
    const genSels = [...gen.keys()].sort();
    assert.deepEqual(
      genSels, handSels,
      `selector set differs.\n  only in hand: ${handSels.filter((s) => !gen.has(s)).join(' · ') || '∅'}` +
      `\n  only in generated: ${genSels.filter((s) => !hand.has(s)).join(' · ') || '∅'}`,
    );

    for (const sel of handSels) {
      assert.equal(
        declSig(gen.get(sel)), declSig(hand.get(sel)),
        `declarations differ for '${sel}'\n  hand:      ${declSig(hand.get(sel))}\n  generated: ${declSig(gen.get(sel))}`,
      );
    }

    // The empty `@layer tokens` is empty in both (mirrored) — zero rules either side.
    assert.equal(layerRuleMap(genByNs.get(ns), 'tokens').size, 0, 'generated @layer tokens should be empty');
    assert.equal(layerRuleMap(readFileSync(handCssPath(ns), 'utf8'), 'tokens').size, 0, 'hand @layer tokens should be empty');
  });
}

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed shadow == the emitter's output)
// ══════════════════════════════════════════════════════════════════
for (const { ns } of NS_SPECS) {
  test(`Guard B · ${ns}: committed build/css-preview/${ns}.css is fresh`, () => {
    const committed = readFileSync(shadowCssPath(ns), 'utf8');
    assert.equal(
      committed, genByNs.get(ns),
      `build/css-preview/${ns}.css is stale — re-run \`node pipeline/css-preview.js\``,
    );
  });
}

// ══════════════════════════════════════════════════════════════════
// Guard C · RESOLVED-VALUE SPOT-CHECK (generated → final value · independent oracle)
// ══════════════════════════════════════════════════════════════════
// Build a var resolution map from the REAL token CSS, then resolve each curated
// cell's generated declaration to its final value and assert == the expected
// (the design scale numbers · NOT read from the hand CSS · so non-circular).
function buildVarMap() {
  const map = new Map();
  for (const f of ['styles/tokens-primitive.css', 'styles/tokens-semantic.css']) {
    const root = postcss.parse(readFileSync(resolve(REPO_ROOT, f), 'utf8'));
    root.walkDecls((d) => {
      if (d.prop.startsWith('--nuri-')) map.set(d.prop, d.value.trim());
    });
  }
  return map;
}
function resolveVarValue(value, varMap, depth = 0) {
  if (depth > 8) throw new Error(`var resolution too deep for '${value}'`);
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (!m) return value; // a literal (12px · auto · center · 1 0 auto)
  const next = varMap.get(m[1]);
  if (next === undefined) throw new Error(`unresolved var ${m[1]}`);
  return resolveVarValue(next.trim(), varMap, depth + 1);
}

// Curated cells: [ns, selector, web-property, expected-final-value]. Spans every
// arm (scale·keyword·literal·flag·expand) + the logical-prop remap + the radius
// 9999 sentinel. Expected px are the design scale (space: xs4 sm6 md12 lg18 xl24
// · size: xs18 …3xl90 · radius: sm6 md12 lg18 full9999).
const CELLS = [
  ['box', '.nuri-box[data-width="md"]', 'inline-size', '36px'],          // scale·size·logical
  ['box', '.nuri-box[data-min-height="3xl"]', 'min-block-size', '90px'], // scale·size·full 7-leaf
  ['box', '.nuri-box[data-padding="lg"]', 'padding', '18px'],            // scale·space
  ['box', '.nuri-box[data-padding-x="xl"]', 'padding-inline', '24px'],   // scale·space·logical pad
  ['box', '.nuri-box[data-padding-start="sm"]', 'padding-inline-start', '6px'], // edge·logical
  ['box', '.nuri-box[data-radius="full"]', 'border-radius', '9999px'],   // scale·radius·sentinel
  ['box', '.nuri-box[data-center="true"]', 'margin-inline', 'auto'],     // shell extra (literal)
  ['stack', '.nuri-stack[data-gap="md"]', 'gap', '12px'],                // scale·space
  ['stack', '.nuri-stack[data-align="center"]', 'align-items', 'center'],          // keyword
  ['stack', '.nuri-stack[data-justify="between"]', 'justify-content', 'space-between'], // keyword (renamed)
  ['stack', '.nuri-stack[data-direction="row"]', 'flex-direction', 'row'],         // literal
  ['stack', '.nuri-stack[data-wrap="true"]', 'flex-wrap', 'wrap'],                 // flag
  ['stack', '.nuri-stack[data-fill="grow"]', 'flex', '1 0 auto'],                  // expand (shorthand)
  ['stack', '.nuri-stack[data-fill="grow-shrink"]', 'min-inline-size', '0'],       // expand (logical min)
];

test('Guard C · resolved-value spot-check (generated → final value)', () => {
  const varMap = buildVarMap();
  const maps = new Map(NS_SPECS.map(({ ns }) => [ns, layerRuleMap(genByNs.get(ns))]));
  for (const [ns, sel, prop, expected] of CELLS) {
    const rule = maps.get(ns).get(sel);
    assert.ok(rule, `no generated rule '${sel}'`);
    const raw = rule.get(prop);
    assert.ok(raw !== undefined, `'${sel}' has no '${prop}' declaration`);
    assert.equal(resolveVarValue(raw, varMap), expected, `${sel} { ${prop} } resolved`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard D · ORDER-IRRELEVANCE (the generated rule order cannot matter)
// ══════════════════════════════════════════════════════════════════
// The generated file emits FIELD rules in TABLE order; the hand file uses its
// own grouping. Guard A compares order-insensitively — sound ONLY if reordering
// the field rules cannot change a computed value. Field rules all key on
// `[data-<attr>="<value>"]`; within ONE attr the values are mutually exclusive
// (an element carries one value · only one rule matches), so the sole way order
// could bite is the SAME property dispatched by TWO DIFFERENT data-attrs that
// co-occur on a node. Assert that never happens: each field-dispatched property
// is owned by exactly one data-attr. (Shell rules carry no data-attr and are
// emitted shell-first in both files — their relative order already matches hand.)
for (const { ns } of NS_SPECS) {
  test(`Guard D · ${ns}: each dispatched property is owned by one data-attr (order cannot matter)`, () => {
    const attrsForProp = new Map(); // property → Set<data-attr>
    for (const [sel, decls] of layerRuleMap(genByNs.get(ns))) {
      const attr = sel.match(/\[data-([\w-]+)=/)?.[1];
      if (!attr) continue; // shell base / element-wrapper rule
      for (const prop of decls.keys()) {
        if (!attrsForProp.has(prop)) attrsForProp.set(prop, new Set());
        attrsForProp.get(prop).add(attr);
      }
    }
    for (const [prop, attrs] of attrsForProp) {
      assert.equal(
        attrs.size, 1,
        `property '${prop}' is dispatched by >1 data-attr (${[...attrs].join(', ')}) — ` +
        `field-rule order could be cascade-significant, so Guard A's order-insensitive compare may be unsound`,
      );
    }
  });
}
