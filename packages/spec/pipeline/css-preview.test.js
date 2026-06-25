/* ──────────────────────────────────────────────────────────────
 * NURI · NAMESPACE CSS (BOX/STACK) FRESHNESS + VALUE HARNESS (the LIVE generated CSS · decision 74)
 *
 * The agnostic box + stack namespace CSS (lib/components/{box,stack}/<ns>.css) is now
 * GENERATED in place from the Field table (resolve-map.ts via pipeline/parsers/
 * namespace-css.js · run by `npm run build`) — decision 2 reversed for the namespace
 * layer (the L3c flip · N+38). The hand parity oracle RETIRED; this harness keeps the
 * GENERATED output honest: freshness (re-emit ≡ the committed file · Guards A/B), the
 * value chain (Guard C · the non-tautological independent oracle), and order-soundness
 * (Guards D + E).
 *
 * Five guards (node-only · the no-browser CI gate):
 *   A · STRUCTURAL ≡ — generated and hand carry the SAME @layer rules: the same
 *       selector set, each with the same declaration set (comments excepted ·
 *       order-insensitive · rule order differs [table order vs the hand's
 *       grouping] but is cascade-irrelevant here — every dispatch rule sets a
 *       disjoint property or a mutually-exclusive attribute value, asserted in
 *       Guard D). Identical (selector → declarations) ⇒ identical stylesheet ⇒
 *       identical computed style (CSS computed value is a pure function of the
 *       matched declarations) — so this is the core computed-style proof.
 *   B · RE-EMIT ≡ COMMITTED — the committed lib/components/<ns>/<ns>.css is exactly
 *       what the emitter produces now (the Guard-F freshness posture · re-run
 *       `npm run build`).
 *   C · RESOLVED-VALUE SPOT-CHECK — a curated cell set resolves through the REAL
 *       token CSS (styles/tokens-{primitive,semantic}.css · var() → final px) or
 *       carries the expected literal; asserted against an INDEPENDENT oracle (the
 *       design scale numbers · not read from hand). Confirms the generated CSS's
 *       indirection bottoms out at the right values. The logical→physical
 *       COMPUTED mapping (inline-size→width …) is the browser harness's job
 *       (pipeline/css-preview-computed-check.html · run via the preview tooling).
 *   D · ORDER-IRRELEVANCE — no two generated rules set the SAME property STRING to a
 *       DIFFERENT value via selectors that can co-match one element. Sound for stack +
 *       most of box, but BLIND to the shorthand/logical-longhand family that overlaps
 *       at the computed level (padding) — Guard E covers that.
 *   E · PADDING PRECEDENCE — the box padding family (padding · padding-inline/block ·
 *       the 4 edges) overlaps at the physical-longhand level; precedence (edge > axis >
 *       uniform · box.css) is achieved by SOURCE ORDER at equal specificity. Assert the
 *       generated rules touching each physical side are source-ordered uniform→axis→edge
 *       (so the edge wins). CLOSES the N+30-L3.1 Guard-D soundness gap — latent while the
 *       hand oracle stood (Guard A masked it), now the node gate's own guarantee since
 *       the oracle retired.
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
// The committed LIVE namespace CSS — GENERATED in place by `npm run build` (decision 74 ·
// the L3c flip). Was the hand parity oracle; now the flip's output (re-emit ≡ committed).
const liveCssPath = (ns) => resolve(REPO_ROOT, `lib/components/${ns}/${ns}.css`);

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

// ── source-ordered (selector, prop, value) triples from `@layer rules` ──
// Unlike layerRuleMap (keyed · order-insensitive), this preserves SOURCE ORDER — the
// input to Guard E's padding-family precedence check (the N+30 shorthand/longhand gap).
function orderedDecls(css) {
  const out = [];
  postcss.parse(css).walkAtRules('layer', (at) => {
    if (at.params !== 'rules') return;
    at.walkRules((rule) => {
      const sels = rule.selector.split(',').map((s) => s.trim());
      rule.walkDecls((d) => {
        for (const sel of sels) out.push({ sel, prop: d.prop, value: d.value.trim() });
      });
    });
  });
  return out;
}

// in-memory generation, once (one source, two readers · decision 48).
const generated = await generateAll();
const genByNs = new Map(generated.map((g) => [g.ns, g.css]));

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (generated vs the hand oracle)
// ══════════════════════════════════════════════════════════════════
for (const { ns } of NS_SPECS) {
  test(`Guard A · ${ns}: re-emit ≡ committed ${ns}.css (structural)`, () => {
    const hand = layerRuleMap(readFileSync(liveCssPath(ns), 'utf8'));
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
    assert.equal(layerRuleMap(readFileSync(liveCssPath(ns), 'utf8'), 'tokens').size, 0, 'hand @layer tokens should be empty');
  });
}

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed shadow == the emitter's output)
// ══════════════════════════════════════════════════════════════════
for (const { ns } of NS_SPECS) {
  test(`Guard B · ${ns}: committed lib/components/${ns}/${ns}.css is fresh (re-emit ≡ committed)`, () => {
    const committed = readFileSync(liveCssPath(ns), 'utf8');
    assert.equal(
      committed, genByNs.get(ns),
      `lib/components/${ns}/${ns}.css is stale — re-run \`npm run build\` (the namespace-CSS slice regenerates it)`,
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

// ══════════════════════════════════════════════════════════════════
// Guard E · PADDING PRECEDENCE (the shorthand/logical-longhand family · the N+30 gap closure)
// ══════════════════════════════════════════════════════════════════
// Guard D checks property STRINGS, blind to the box padding family that overlaps at the
// computed physical-longhand level: `padding` (uniform), `padding-inline`/`padding-block`
// (axis), and the 4 edges all cascade onto shared physical sides (padding + padding-inline-
// start both set padding-left). box.css documents precedence edge > axis > uniform, achieved
// by SOURCE ORDER at equal specificity (every dispatch rule is (0,2,0)). While the hand oracle
// stood, Guard A masked any divergence; the oracle RETIRED at L3c, so prove it directly: for
// each physical side, the generated rules touching it are source-ordered uniform→axis→edge
// (so the more-specific edge rule, emitted LATER, wins). A future BOX_FIELDS reorder that broke
// precedence keeps Guards A+D green but fails HERE (the N+30-L3.1 Guard-D gap, closed).
const PADDING_PHYSICAL = {
  'padding':              { tier: 0, sides: ['top', 'right', 'bottom', 'left'] }, // uniform
  'padding-inline':       { tier: 1, sides: ['left', 'right'] },                  // axis
  'padding-block':        { tier: 1, sides: ['top', 'bottom'] },                  // axis
  'padding-inline-start': { tier: 2, sides: ['left'] },                           // edge (LTR)
  'padding-inline-end':   { tier: 2, sides: ['right'] },                          // edge
  'padding-block-start':  { tier: 2, sides: ['top'] },                            // edge
  'padding-block-end':    { tier: 2, sides: ['bottom'] },                         // edge
};
test('Guard E · box: the padding family is source-ordered by precedence (uniform→axis→edge · the N+30 gap)', () => {
  const ordered = orderedDecls(genByNs.get('box')); // source-ordered (sel, prop, value) triples
  const bySide = { top: [], right: [], bottom: [], left: [] };
  ordered.forEach(({ prop }, idx) => {
    const fam = PADDING_PHYSICAL[prop];
    if (!fam) return;
    for (const side of fam.sides) bySide[side].push({ tier: fam.tier, idx, prop });
  });
  let sidesChecked = 0;
  for (const [side, entries] of Object.entries(bySide)) {
    if (entries.length < 2) continue; // a side touched by <2 padding props has no ordering hazard
    sidesChecked++;
    // entries are in source order (idx ascending) — assert precedence tiers non-decreasing.
    for (let i = 1; i < entries.length; i++) {
      assert.ok(
        entries[i].tier >= entries[i - 1].tier,
        `padding-${side}: '${entries[i].prop}' (precedence tier ${entries[i].tier}) is emitted AFTER ` +
        `'${entries[i - 1].prop}' (tier ${entries[i - 1].tier}) but is LESS specific — the more-specific ` +
        `padding rule must come LATER (source order at equal specificity decides the computed value). ` +
        `Reorder BOX_FIELDS so the padding family emits uniform → axis → edge.`,
      );
    }
  }
  assert.equal(sidesChecked, 4, `expected all 4 physical sides exercised by the box padding family, saw ${sidesChecked}`);
});
