/* ──────────────────────────────────────────────────────────────
 * NURI · PALETTE NAMESPACE CSS PARITY HARNESS (the L3b·1 reversible shadow · decision 70 / 67)
 *
 * Proves the GENERATED shadow palette CSS (build/css-preview/palette.css · from the
 * SURFACE table pipeline/palette-surface.ts via pipeline/parsers/palette-css.js) is
 * EQUIVALENT to the hand SoT lib/components/palette/palette.css (the parity oracle ·
 * decision 2 stands for the namespace layer until L3c). The bespoke-axis analogue
 * of pipeline/css-preview.test.js (the agnostic box/stack axes · L3.1).
 *
 * The guard pattern transfers from css-preview.test.js, but TWO guards needed
 * adaptation for palette's bespoke dispatch (the brief §5):
 *   A · STRUCTURAL ≡ — generated and hand carry the SAME @layer rules (same
 *       selector set · same declaration set per selector · comments excepted ·
 *       order-insensitive). For palette this IS the COMPLETE computed-style proof:
 *       background/color are DIRECT properties — no logical→physical resolution, no
 *       shorthand/longhand family overlap (the box-padding gap that dogs L3.1's
 *       Guard D does not exist here) — so identical (selector → decls) ⇒ identical
 *       computed style, full stop. Also pins the MERGED-NODE model: every selector
 *       is the `.nuri-palette` class dispatch (no <nuri-palette> element, no
 *       :not(:defined) skeleton, no shell).
 *   B · RE-EMIT FRESHNESS — the committed shadow == the emitter's current output
 *       (transfers verbatim · the committed file cannot drift).
 *   C · RESOLVED-VALUE — ADAPTED. L3.1's buildVarMap keeps the LAST --nuri-* decl,
 *       which is WRONG for the accent×theme colour vars palette references (multiple
 *       cascade blocks → it would grab the dark/lilac value). Instead this reuses
 *       the colour-semantic.test.js live-cascade walk (resolveSemanticCrossProduct)
 *       and indexes the DEFAULT scope [neutral][light] explicitly: (1) every
 *       generated paint bottoms out at a real hex (no dangling role var) or is the
 *       transparent literal; (2) a curated subset matches a RESTATED design oracle
 *       (the colour-validated values · not read from the CSS under test). The
 *       SCOPE-dependent resolution (dark · lilac · the dec-63 self-scope) is the
 *       browser harness's job (pipeline/palette-css-computed-check.html).
 *   D · ORDER-SOUNDNESS — ADAPTED. L3.1's "one data-attr per property" check does
 *       NOT transfer: `background` is dispatched by data-variant AND data-chrome
 *       (mutually-exclusive INPUTS · variant XOR chrome) AND by rest vs the pressed
 *       [data-press-color]:active rule (same element · resolved by SPECIFICITY, not
 *       order). So the real soundness argument is asserted directly: (a) every rest
 *       rule keys on exactly one [data-variant|chrome] attribute (so at most one
 *       paints a node · the XOR contract excludes the cross-axis co-match); (b) each
 *       pressed rule is a STRICT specificity superset of its rest rule (so it wins
 *       by specificity regardless of source order). Both ⇒ rule ORDER cannot change
 *       a computed value ⇒ Guard A's order-insensitive compare is sound.
 *
 * Run:  node --test pipeline/palette-css.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { generatePalette } from './css-preview.js';
import {
  readSemanticRules,
  buildPrimitiveMap,
  resolveSemanticCrossProduct,
} from './parsers/semantic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec
const HAND_CSS = resolve(REPO_ROOT, 'lib/components/palette/palette.css');
const SHADOW_CSS = resolve(REPO_ROOT, 'build/css-preview/palette.css');
const PRIMITIVE_CSS = resolve(REPO_ROOT, 'styles/tokens-primitive.css');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');

// ── parse a stylesheet's `@layer <layer>` → Map<selector, Map<prop,value>> ──
// Borrowed from css-preview.test.js (the brief: reuse the helpers/pattern). postcss
// skips comment nodes for walkDecls/walkRules, so comments are excepted naturally.
// Multi-selector rules are split (defensive · palette has none). A duplicate
// (selector, prop) within one file is a parse-level surprise → throw.
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
          if (decls.has(d.prop)) throw new Error(`duplicate decl '${d.prop}' for '${sel}'`);
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
const { css: generated } = await generatePalette();

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (generated vs the hand oracle · the merged-node model)
// ══════════════════════════════════════════════════════════════════
test('Guard A · generated palette CSS ≡ hand palette.css (structural · merged-node)', () => {
  const hand = layerRuleMap(readFileSync(HAND_CSS, 'utf8'));
  const gen = layerRuleMap(generated);

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

  // MERGED-NODE: every selector is the `.nuri-palette` CLASS dispatch — there is
  // NO <nuri-palette> custom element, no :not(:defined) skeleton, no shell base
  // (unlike box/stack · 65.3 §6 / B1.5 §4.2). The class lands on the painting node.
  for (const sel of genSels) {
    assert.ok(
      sel.startsWith('.nuri-palette['),
      `'${sel}' is not a .nuri-palette[...] class dispatch — palette is merged-node (no element/shell rules)`,
    );
  }

  // The empty `@layer tokens` is empty in both (mirrored · component-token aliasing
  // would be useless indirection · decision 37) — zero rules either side.
  assert.equal(layerRuleMap(generated, 'tokens').size, 0, 'generated @layer tokens should be empty');
  assert.equal(layerRuleMap(readFileSync(HAND_CSS, 'utf8'), 'tokens').size, 0, 'hand @layer tokens should be empty');
});

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed shadow == the emitter's output)
// ══════════════════════════════════════════════════════════════════
test('Guard B · committed build/css-preview/palette.css is fresh', () => {
  assert.equal(
    readFileSync(SHADOW_CSS, 'utf8'), generated,
    'build/css-preview/palette.css is stale — re-run `node pipeline/css-preview.js`',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard C · RESOLVED-VALUE (the default-scope projection · the live cascade walk)
// ══════════════════════════════════════════════════════════════════
// Resolve through the REAL build path: the committed accent×theme cascade
// (tokens-semantic.css) + the primitives (tokens-primitive.css), the SAME walker
// colour-semantic.test.js uses as its "live CSS" oracle. Index the DEFAULT scope
// [neutral][light] explicitly (NOT keep-the-last-decl · the L3.1 buildVarMap bug
// the brief flags) — the scope-dependent cells are the browser harness's job.
const resolved = resolveSemanticCrossProduct(
  readSemanticRules(readFileSync(SEMANTIC_CSS, 'utf8')),
  buildPrimitiveMap(readFileSync(PRIMITIVE_CSS, 'utf8')),
);
const HEX = /^#[0-9a-f]{6}$/;
const varName = (value) => value.match(/^var\((--[\w-]+)\)$/)?.[1];

test('Guard C · every generated paint bottoms out in the default (neutral/light) scope', () => {
  const gen = layerRuleMap(generated);
  let checked = 0;
  for (const [sel, decls] of gen) {
    for (const [prop, value] of decls) {
      const name = varName(value);
      if (name) {
        const hex = resolved[name]?.neutral?.light;
        assert.ok(
          hex && HEX.test(hex),
          `${sel} { ${prop}: ${value} } does not resolve to a hex via the colour cascade (dangling role var?) — got ${hex}`,
        );
      } else {
        assert.equal(
          value, 'transparent',
          `${sel} { ${prop}: ${value} } is neither a var(--nuri-*) role ref nor the transparent literal`,
        );
      }
      checked++;
    }
  }
  assert.ok(checked >= 13, `expected ≥13 paint declarations checked, saw ${checked}`);
});

// The design oracle (RESTATED · the colour-semantic.test.js validated values · not
// read from the CSS under test) — pins the generated paint → role var → colour
// chain to concrete design colours in the default scope. Spans accent (the INVERSE
// solid bg), accent-on-solid, the shared text fg, a chrome bg, and the literal.
const ORACLE = [
  ['.nuri-palette[data-variant="solid"]',  'background', '#12110b'],     // accent-solid @ neutral/light · the INVERSE (cream-1-dark)
  ['.nuri-palette[data-variant="solid"]',  'color',      '#f0eee3'],     // accent-on-solid @ neutral/light
  ['.nuri-palette[data-variant="soft"]',   'color',      '#222013'],     // text-primary @ neutral/light
  ['.nuri-palette[data-chrome="canvas"]',  'background', '#fffdf2'],     // bg-canvas @ neutral/light
  ['.nuri-palette[data-variant="ghost"]',  'background', 'transparent'], // the literal · no var, no resolution
];

test('Guard C · the curated cells resolve to the restated design oracle (default scope)', () => {
  const gen = layerRuleMap(generated);
  for (const [sel, prop, expected] of ORACLE) {
    const value = gen.get(sel)?.get(prop);
    assert.ok(value !== undefined, `no generated '${prop}' for '${sel}'`);
    const name = varName(value);
    const got = name ? resolved[name]?.neutral?.light : value;
    assert.equal(got, expected, `${sel} { ${prop} } resolves @ neutral/light`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard D · ORDER-SOUNDNESS (the generated rule order cannot change a computed value)
// ══════════════════════════════════════════════════════════════════
// `background` is dispatched by MANY selectors (every variant + every chrome + the
// pressed swaps), so L3.1's "one data-attr per property" check is inapplicable.
// The real argument has two legs; both are asserted structurally.
test('Guard D · order-soundness (rest mutual-exclusivity + pressed strictly-more-specific)', () => {
  const sels = [...layerRuleMap(generated).keys()];
  const rest = sels.filter((s) => !s.includes(':active'));
  const pressed = sels.filter((s) => s.includes(':active'));

  // (a) Every REST rule keys on EXACTLY ONE [data-variant|chrome="v"] attribute.
  // Within an axis the values are mutually exclusive (a node carries one value ·
  // distinct selectors); across axes, a variant rule and a chrome rule co-match
  // only if a node carries BOTH attrs — excluded by the variant-XOR-chrome contract
  // (PaletteNS · resolve.ts resolvePalette: "variant wins over chrome"). So at most
  // ONE rest rule paints any node ⇒ rest-rule order is irrelevant.
  const REST_ONE_ATTR = /^\.nuri-palette\[data-(?:variant|chrome)="[a-z]+"\]$/;
  for (const s of rest) {
    assert.match(s, REST_ONE_ATTR, `rest rule '${s}' is not a single [data-variant|chrome] dispatch — the order-soundness argument assumes it`);
  }

  // (b) Every PRESSED rule is its REST variant rule + [data-press-color]:active — a
  // STRICT specificity superset ((0,4,0) > the rest's (0,2,0)), so when both match
  // (an :active press on a [data-press-color] node) the pressed bg wins by
  // SPECIFICITY, not source order. (And a pressed rule of variant V never co-matches
  // a DIFFERENT variant's/ chrome's rest rule — distinct attr values.)
  assert.ok(pressed.length > 0, 'expected pressed (:active) rules');
  for (const s of pressed) {
    const base = s.replace('[data-press-color]:active', '');
    assert.ok(rest.includes(base), `pressed rule '${s}' has no rest rule '${base}' to override`);
    assert.equal(s, `${base}[data-press-color]:active`, `pressed rule '${s}' is not exactly '${base}' + [data-press-color]:active (must be a strict specificity superset)`);
  }

  // Together (a)+(b) ⇒ for every node, at most one rest paint + (when pressed) a
  // strictly-more-specific pressed override apply, both order-independent. So the
  // table-order vs hand-order difference cannot change a computed value, and Guard
  // A's order-insensitive compare is sound. (Even a contract-violating variant+
  // chrome double-attr node: generated AND hand both emit the variant group before
  // the chrome group, so the equal-specificity tie resolves identically either way.)
});
