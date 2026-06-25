/* ──────────────────────────────────────────────────────────────
 * NURI · TYPOGRAPHY NAMESPACE CSS FRESHNESS + VALUE HARNESS (the LIVE generated CSS · decision 74)
 *
 * The typography namespace (WRAPPER) CSS (lib/components/typography/typography.css) is
 * now GENERATED in place from the AXIS (pipeline/typography-axis.ts via pipeline/parsers/
 * typography-css.js · run by `npm run build`) — decision 2 reversed for the namespace
 * layer (the L3c flip · N+38). The hand parity oracle RETIRED; this harness keeps the
 * GENERATED output honest (freshness · value · order-soundness).
 *
 * typography is bespoke like palette/interactive, but diverges in TWO ways the guards
 * adapt for (the brief §6):
 *   · the ELEMENT — palette/interactive are MERGED-NODE (the `.nuri-<ns>` class lands on
 *     the painting node · no element, no shell). typography is a real <nuri-typography>
 *     ELEMENT with a SHELL (the base + :not(:defined) skeleton · like box/stack). So
 *     Guard A asserts every selector is the ELEMENT `nuri-typography…` (NO leading dot).
 *   · the ORDER on `display` — the interactive Guard-D order-sensitivity RECURS. `display`
 *     is set by the base (inline · (0,0,1)), :not(:defined) (inline · (0,1,1)), and the 3
 *     align rules (block · (0,1,1)). The base loses to align by SPECIFICITY (fine). But
 *     :not(:defined) and [align] are EQUAL specificity (0,1,1) — a pre-upgrade aligned
 *     node (<nuri-typography align="start"> before the element upgrades) matches BOTH, so
 *     `display` resolves by SOURCE ORDER. The hand emits :not(:defined) BEFORE align (so
 *     align's `block` wins → text-align takes effect even pre-upgrade). The emitter must
 *     preserve that order; Guard D proves it.
 *
 * Four guards (node-only · the no-browser CI gate):
 *   A · STRUCTURAL ≡ — generated and hand carry the SAME @layer rules (same selector set ·
 *       same declaration set per selector · comments excepted · order-insensitive) AND
 *       every selector is the `nuri-typography` ELEMENT dispatch (the shell base +
 *       :not(:defined) + the [data-muted]/[align] gates · NOT a .nuri- class). NECESSARY
 *       here, NOT sufficient (display is set at equal specificity → Guard D covers order).
 *   B · RE-EMIT ≡ COMMITTED (byte) — the committed file is the emitter's current output.
 *   C · RESOLVED-VALUE — the muted token `var(--nuri-text-muted)` is a THEME-cascaded
 *       chrome token (light/dark · re-resolves under [data-theme] · accent-INVARIANT), so
 *       it is scope-dependent like palette's colours. Reuse the colour-cascade walk
 *       (resolveSemanticCrossProduct · the colour-semantic.test.js / palette oracle) and
 *       index the DEFAULT [neutral][light] scope: (1) the muted paint bottoms out at a
 *       real hex (no dangling token) and the display/text-align values are literals;
 *       (2) a RESTATED design oracle (#666455 = cream-11-light · not read from the CSS
 *       under test). The dark value (#b7b4a4) is the browser harness's job (the scope-
 *       dependent palette posture · pipeline/typography-css-computed-check.html).
 *   D · ORDER-SOUNDNESS — the centerpiece (the interactive pattern, here on `display`).
 *       Two legs, both structural: (a) for EVERY property set by >1 selector, the
 *       generated source-order of those selectors == the hand oracle's (so the array-
 *       order emit reproduces the hand's load-bearing precedence · shell before align);
 *       (b) the display pair specifically — :not(:defined) (inline) emitted BEFORE all 3
 *       [align] (block), both EQUAL specificity (so order, not specificity, decides → the
 *       order IS load-bearing), and both co-match a pre-upgrade aligned node (the conflict
 *       is real). The real engine confirms it: pipeline/typography-css-computed-check.html.
 *
 * Run:  node --test pipeline/typography-css.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { generateTypography } from './css-preview.js';
import {
  readSemanticRules,
  buildPrimitiveMap,
  resolveSemanticCrossProduct,
} from './parsers/semantic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec
// The committed LIVE namespace CSS — GENERATED in place by `npm run build` (decision 74 ·
// the L3c flip). Was the hand parity oracle; now the flip's output (re-emit ≡ committed).
const LIVE_CSS = resolve(REPO_ROOT, 'lib/components/typography/typography.css');
const PRIMITIVE_CSS = resolve(REPO_ROOT, 'styles/tokens-primitive.css');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');

// ── parse a stylesheet's `@layer <layer>` → Map<selector, Map<prop,value>> ──
// COPIED from palette-css.test.js / interactive-css.test.js (the brief's "copy not
// extract" sub-decision · the shared file stays untouched · extraction is an L3c
// cleanup). postcss skips comment nodes, so comments are excepted naturally. A
// duplicate (selector, prop) within one file is a parse-level surprise → throw.
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

// a stable, comparable string for a selector's declarations (order-insensitive). All
// typography values are single-token (inline · block · start · var(--nuri-text-muted)),
// so no whitespace normalization is needed (unlike interactive's wrapped `transition`).
const declSig = (declMap) =>
  [...declMap.entries()].map(([p, v]) => `${p}: ${v}`).sort().join('; ');

// ── source-ordered (selector, prop, value) triples from `@layer rules` ──
// COPIED from interactive-css.test.js. Unlike layerRuleMap (keyed · order-insensitive),
// this preserves SOURCE ORDER — the input to Guard D's order comparison.
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

// prop → the source-ordered list of selectors that set it (COPIED from interactive).
function propSelectorOrder(ordered) {
  const map = new Map();
  for (const { sel, prop } of ordered) {
    if (!map.has(prop)) map.set(prop, []);
    map.get(prop).push(sel);
  }
  return map;
}

// the specificity `b` component (classes + attributes + pseudo-classes). ADAPTED from
// interactive's helper: CSS Selectors L4 — the functional pseudo `:not(...)` contributes
// its ARGUMENT's specificity, NOT itself, so the `:not(` token is NOT counted but the
// `:defined` inside it IS. (The element `nuri-typography` is the `c` component, not `b`.)
// Enough to PROVE the display pair equal-specificity: :not(:defined) (b=1) == [align] (b=1).
const specificityB = (sel) =>
  (sel.match(/\./g)?.length ?? 0) +
  (sel.match(/\[/g)?.length ?? 0) +
  (sel.match(/:(?!not\(|is\(|where\(|has\()/g)?.length ?? 0);

// in-memory generation, once (one source, two readers · decision 48).
const { css: generated } = await generateTypography();

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (generated vs the hand oracle · the element-wrapper model)
// ══════════════════════════════════════════════════════════════════
test('Guard A · re-emit ≡ committed typography.css (structural · element wrapper + shell)', () => {
  const hand = layerRuleMap(readFileSync(LIVE_CSS, 'utf8'));
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

  // ELEMENT (the one place typography diverges from palette/interactive's merged-node
  // class check · the brief §6): every selector is the `nuri-typography` ELEMENT,
  // optionally with a pseudo (:not(:defined)) or an attr gate ([data-muted]/[align]) —
  // NOT a `.nuri-typography` class. The shell base `nuri-typography` (bare element) and
  // the skeleton/dispatch all match. A class selector would start with `.` and fail.
  const ELEMENT = /^nuri-typography(?:[:[]|$)/;
  for (const sel of genSels) {
    assert.match(
      sel, ELEMENT,
      `'${sel}' is not a nuri-typography ELEMENT selector — typography dispatches off the element (decision 53/59), not a .nuri- class (it has a shell, unlike palette/interactive)`,
    );
  }
  // The shell IS present (the element wrapper · unlike merged-node palette/interactive):
  // the bare element base + the :not(:defined) skeleton both appear.
  assert.ok(gen.has('nuri-typography'), 'missing the shell base rule nuri-typography { display: inline }');
  assert.ok(gen.has('nuri-typography:not(:defined)'), 'missing the pre-upgrade skeleton nuri-typography:not(:defined)');

  // The empty `@layer tokens` is empty in both (mirrored · the wrapper reuses the
  // foundation --nuri-type-* via the utility classes · decision 37) — zero rules either side.
  assert.equal(layerRuleMap(generated, 'tokens').size, 0, 'generated @layer tokens should be empty');
  assert.equal(layerRuleMap(readFileSync(LIVE_CSS, 'utf8'), 'tokens').size, 0, 'hand @layer tokens should be empty');
});

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed shadow == the emitter's output)
// ══════════════════════════════════════════════════════════════════
test('Guard B · committed lib/components/typography/typography.css is fresh (re-emit ≡ committed)', () => {
  assert.equal(
    readFileSync(LIVE_CSS, 'utf8'), generated,
    'lib/components/typography/typography.css is stale — re-run `npm run build` (the namespace-CSS slice regenerates it)',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard C · RESOLVED-VALUE (the muted token via the colour cascade · default scope)
// ══════════════════════════════════════════════════════════════════
// Resolve through the REAL build path (the committed accent×theme cascade + the
// primitives), the SAME walker colour-semantic.test.js / palette-css.test.js use as the
// "live CSS" oracle. Index the DEFAULT [neutral][light] scope explicitly (NOT keep-the-
// last-decl · which would grab the dark value · the L3.1 buildVarMap bug palette flagged).
const resolved = resolveSemanticCrossProduct(
  readSemanticRules(readFileSync(SEMANTIC_CSS, 'utf8')),
  buildPrimitiveMap(readFileSync(PRIMITIVE_CSS, 'utf8')),
);
const HEX = /^#[0-9a-f]{6}$/;
const varName = (value) => value.match(/^var\((--[\w-]+)\)$/)?.[1];
// the non-var typography values: display + text-align literals (no token, no resolution).
const LITERALS = new Set(['inline', 'block', 'start', 'center', 'end']);

test('Guard C · the muted token bottoms out at a hex (default scope); display/text-align are literals', () => {
  const gen = layerRuleMap(generated);
  let varChecks = 0;
  let literalChecks = 0;
  for (const [sel, decls] of gen) {
    for (const [prop, value] of decls) {
      const name = varName(value);
      if (name) {
        const hex = resolved[name]?.neutral?.light;
        assert.ok(
          hex && HEX.test(hex),
          `${sel} { ${prop}: ${value} } does not resolve to a hex via the colour cascade (dangling token?) — got ${hex}`,
        );
        varChecks++;
      } else {
        assert.ok(
          LITERALS.has(value),
          `${sel} { ${prop}: ${value} } is neither a var(--nuri-*) token nor a known display/text-align literal`,
        );
        literalChecks++;
      }
    }
  }
  // exactly one var paint (muted colour) + the 8 literal decls (2 shell display + 3×
  // align display + 3× align text-align).
  assert.equal(varChecks, 1, 'expected exactly one var paint (the muted colour)');
  assert.equal(literalChecks, 8, `expected exactly 8 literal display/text-align decls, saw ${literalChecks}`);
});

// The design oracle (RESTATED · the colour-semantic.test.js validated value · NOT read
// from the CSS under test, which only carries var(--nuri-text-muted)) — pins the
// generated muted paint → token → colour chain in the default scope. text-muted is
// chrome (theme-only · accent-INVARIANT): neutral-11-light = cream-11-light = #666455.
const ORACLE = [
  ['nuri-typography[data-muted]', 'color', '--nuri-text-muted', '#666455'],
];

test('Guard C · the muted token resolves to the restated design oracle (default neutral/light scope)', () => {
  const gen = layerRuleMap(generated);
  for (const [sel, prop, ref, expected] of ORACLE) {
    const value = gen.get(sel)?.get(prop);
    assert.ok(value !== undefined, `no generated '${prop}' for '${sel}'`);
    assert.equal(varName(value), ref, `${sel} { ${prop} } should reference var(${ref}) (got ${value})`);
    assert.equal(resolved[ref]?.neutral?.light, expected, `${ref} resolves @ neutral/light`);
  }
  // text-muted is chrome (theme-only · accent-invariant) — identical under lilac. The
  // dark value (#b7b4a4) is the browser check's job (the scope-dependent palette posture).
  assert.equal(resolved['--nuri-text-muted']?.lilac?.light, '#666455', 'text-muted is accent-invariant (chrome · theme-only)');
});

// ══════════════════════════════════════════════════════════════════
// Guard D · ORDER-SOUNDNESS (the equal-specificity display pair · the centerpiece)
// ══════════════════════════════════════════════════════════════════
test('Guard D · order-soundness (per-property order ≡ committed + the display pair :not(:defined)-before-[align])', () => {
  const genOrder = propSelectorOrder(orderedDecls(generated));
  const handOrder = propSelectorOrder(orderedDecls(readFileSync(LIVE_CSS, 'utf8')));

  // (a) For EVERY property set by >1 selector, the generated SOURCE ORDER of those
  // selectors == the hand oracle's. `display` (5 setters: base · :not(:defined) · 3
  // aligns) and `text-align` (3 aligns) are multi-set; the emit must reproduce the hand's
  // load-bearing precedence (shell before align). Single-setter props (color) are order-
  // irrelevant.
  let multiSetProps = 0;
  for (const [prop, genSels] of genOrder) {
    if (genSels.length < 2) continue;
    multiSetProps++;
    assert.deepEqual(
      genSels, handOrder.get(prop),
      `the source order of selectors setting '${prop}' differs from the hand oracle\n` +
      `  hand:      ${handOrder.get(prop)?.join('  →  ')}\n  generated: ${genSels.join('  →  ')}`,
    );
  }
  assert.ok(multiSetProps >= 1, 'expected ≥1 property set by >1 selector (display) — the order argument assumes it');

  // (b) The display pair specifically — the load-bearing equal-specificity conflict.
  const displays = orderedDecls(generated).filter((d) => d.prop === 'display');
  const notDefined = displays.find((d) => /:not\(:defined\)/.test(d.sel));
  const aligns = displays.filter((d) => /\[align="[a-z]+"\]/.test(d.sel));
  const base = displays.find((d) => d.sel === 'nuri-typography');

  assert.ok(notDefined, 'expected a :not(:defined) display rule (the pre-upgrade skeleton)');
  assert.equal(notDefined.value, 'inline', 'the :not(:defined) skeleton must set display:inline');
  assert.equal(aligns.length, 3, 'expected exactly three [align] display rules (start/center/end)');
  for (const a of aligns) assert.equal(a.value, 'block', `the [align] rule '${a.sel}' must set display:block`);

  // :not(:defined) (inline) emitted BEFORE every [align] (block) → for a pre-upgrade
  // aligned node matching BOTH, `block` (later) wins by SOURCE ORDER (so text-align takes
  // effect even before typography.js upgrades the element). The disabled-control analogue.
  const notDefinedIdx = displays.indexOf(notDefined);
  const firstAlignIdx = Math.min(...aligns.map((a) => displays.indexOf(a)));
  assert.ok(
    notDefinedIdx < firstAlignIdx,
    `the :not(:defined) skeleton (idx ${notDefinedIdx}) must precede the [align] rules (first at ${firstAlignIdx}) so a pre-upgrade aligned node resolves display:block by source order`,
  );

  // EQUAL specificity ⇒ source order (not specificity) decides ⇒ order is LOAD-BEARING.
  assert.equal(
    specificityB(notDefined.sel), specificityB(aligns[0].sel),
    `:not(:defined) and [align] must be equal-specificity (else order would not be load-bearing)\n  ${notDefined.sel} (b=${specificityB(notDefined.sel)}) vs ${aligns[0].sel} (b=${specificityB(aligns[0].sel)})`,
  );

  // Both co-match a pre-upgrade <nuri-typography align="start"> node: the skeleton matches
  // an un-upgraded element (:not(:defined)), [align="start"] matches the attr — distinct,
  // orthogonal gates on the SAME element, so the conflict the order resolves is REAL.
  assert.match(notDefined.sel, /^nuri-typography:not\(:defined\)$/, `the skeleton '${notDefined.sel}' is not exactly nuri-typography:not(:defined)`);
  for (const a of aligns) {
    assert.match(a.sel, /^nuri-typography\[align="[a-z]+"\]$/, `the align rule '${a.sel}' is not a bare nuri-typography[align] dispatch`);
  }

  // The base display:inline ((0,0,1)) is dominated by [align] ((0,1,1)) by SPECIFICITY (no
  // order needed there) — so a DEFINED aligned node is block regardless of source order.
  assert.ok(base && base.value === 'inline', 'expected the base nuri-typography { display: inline }');
  assert.ok(
    specificityB(base.sel) < specificityB(aligns[0].sel),
    'the base must be lower-specificity than [align] (a defined aligned node gets block by specificity, not order)',
  );
});
