/* ══════════════════════════════════════════════════════════════════
 * NURI · COLOUR SEMANTIC CASCADE PARITY HARNESS (N+32 C2 · decision 70 · the cascade)
 * ──────────────────────────────────────────────────────────────────
 * Proves the TS semantic matrix (pipeline/colours.ts · chrome + accent) generates
 * the committed accent×theme cascade in tokens-semantic.css, and that it resolves
 * (cream + lilac) to the design values — INCLUDING the decision-63 #4b/#6b
 * self-scope. The semantic twin of pipeline/colour-cascade.test.js (C1, the
 * primitives) + dimension-cascade.test.js (N+31). This is the gate that completes
 * the decision-2 reversal for colour: the cascade is the SoT's projection now.
 *
 * The cascade is GENERATED (not a byte-identical passthrough) — so the gate is
 * structural + resolved-value equivalence + a byte-identical RN tokens.ts (the
 * `git diff build/` CI gate · the resolved matrix is unchanged · dec-63 is
 * web-CSS-only). The real-engine computed-style proof of the #4b/#6b self-scope
 * (a self-scoped accent under a dark ANCESTOR) is the companion browser harness
 * pipeline/colour-semantic-computed-check.html (run via the preview tooling · not
 * a CI gate · the node parser models (accent × theme), not DOM ancestry).
 *
 *   A · STRUCTURAL ≡ — the SoT-generated cascade region equals the committed
 *       tokens-semantic.css cascade (the 8 blocks · selector set + per-block decls).
 *       Pins the cascade SHAPE: full light blocks, minimal dark overrides, and the
 *       P4-frozen omission (blocks 6 / 6b carry only the 3 theme-adapting lilac
 *       tokens). A hand edit to the committed cascade fails here.
 *   B · RE-EMIT FRESHNESS — re-splicing the generated region into the committed
 *       file is byte-identical (the committed cascade is the SoT's fresh output ·
 *       `npm run build` was run). Non-tautological: the region comes from the SoT.
 *   C · INDEPENDENT MATRIX ORACLE — a curated set of (token, accent, theme) cells
 *       is RESTATED here as final cream/lilac hex (not read from the SoT or CSS) and
 *       resolved TWO ways: through the SoT (ref → cream/lilac scale) AND through the
 *       LIVE committed CSS (the real cascade walk · resolveSemanticCrossProduct).
 *       Both must equal the oracle. Spans the INVERSE (neutral solid · incl. the
 *       dec-63 dark cell → cream-1-light) and FROZEN-P4 (lilac solid) asymmetries.
 *   D · THE dec-63 SELF-SCOPE + THE LOCK — #4b/#6b are present, mirror their #4/#6
 *       twin (neutral re-asserts the dark values · the IconButton dark-on-dark fix),
 *       #6b omits the P4-frozen brand tokens, and both use the DESCENDANT combinator
 *       (the accepted nearest-vs-any-ancestor limitation · decision 63).
 *
 * Run:  node --test pipeline/colour-semantic.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import {
  loadSemanticColours,
  buildSemanticCascade,
  emitCascadeRegion,
  spliceCascade,
} from './parsers/semantic-css.js';
import { loadColours } from './parsers/colour-css.js';
import {
  readSemanticRules,
  buildPrimitiveMap,
  resolveSemanticCrossProduct,
} from './parsers/semantic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../packages/spec');
const PRIMITIVE_CSS = resolve(REPO_ROOT, 'styles/tokens-primitive.css');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
const COLOURS_SRC = resolve(REPO_ROOT, 'pipeline/colours.ts');

const { chrome, accent } = await loadSemanticColours(COLOURS_SRC);
const colours = await loadColours(COLOURS_SRC);
const primCss = readFileSync(PRIMITIVE_CSS, 'utf8');
const semCss = readFileSync(SEMANTIC_CSS, 'utf8');

const region = emitCascadeRegion(buildSemanticCascade({ chrome, accent }));

// The cascade blocks, in order (the decision-63 cascade · don't reorder). The 5 fixed
// NEUTRAL blocks (the default scope) + 3 blocks per non-neutral accent (lilac → 5/6/6b ·
// orange → 7/8/8b · N+56). Derived from the accent matrix keys so the harness auto-covers
// every accent — the structural twin of the generified emitter (buildSemanticCascade).
const NON_NEUTRAL_ACCENTS = Object.keys(accent).filter((a) => a !== 'neutral');
const CASCADE_SELECTORS = [
  ':root, [data-theme="light"]',                   // 1
  '[data-theme="dark"]',                           // 2
  '[data-accent="neutral"]',                       // 3
  '[data-accent="neutral"][data-theme="dark"]',    // 4
  '[data-theme="dark"] [data-accent="neutral"]',   // 4b · self-scope
  ...NON_NEUTRAL_ACCENTS.flatMap((a) => [
    `[data-accent="${a}"]`,                         // light (anywhere)
    `[data-accent="${a}"][data-theme="dark"]`,     // combined dark
    `[data-theme="dark"] [data-accent="${a}"]`,    // self-scope dark (dec-63)
  ]),
];
const normSel = (s) => s.replace(/\s+/g, ' ').trim();

// Parse a CSS string → Map<normSelector, Map<prop, value>>, restricted to the
// cascade blocks (the dimension :root blocks below the region don't match).
function cascadeRuleMap(css) {
  const map = new Map();
  postcss.parse(css).walkRules((rule) => {
    const sel = normSel(rule.selector);
    if (!CASCADE_SELECTORS.includes(sel)) return;
    const decls = new Map();
    rule.walkDecls((d) => decls.set(d.prop, d.value.trim()));
    map.set(sel, decls);
  });
  return map;
}
const sortedEntries = (map) => [...map.entries()].sort(([a], [b]) => a.localeCompare(b));

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (the generated cascade ≡ the committed cascade)
// ══════════════════════════════════════════════════════════════════
test('Guard A · the generated cascade ≡ the committed tokens-semantic.css cascade (structural)', () => {
  const gen = cascadeRuleMap(region);
  const committed = cascadeRuleMap(semCss);
  assert.deepEqual([...gen.keys()].sort(), [...CASCADE_SELECTORS].sort(), 'generated block set');
  assert.deepEqual([...committed.keys()].sort(), [...CASCADE_SELECTORS].sort(), 'committed block set');
  for (const sel of CASCADE_SELECTORS) {
    assert.deepEqual(
      sortedEntries(committed.get(sel)),
      sortedEntries(gen.get(sel)),
      `declarations differ for '${sel}' — the committed cascade drifted from the SoT`,
    );
  }
});

test('Guard A · the cascade shape: full light blocks · minimal dark overrides · P4 omission', () => {
  const gen = cascadeRuleMap(region);
  const props = (sel) => [...gen.get(sel).keys()].sort();
  // 1 / 2 · chrome(13) + neutral accent(6) = 19 (full theme pair)
  assert.equal(gen.get(':root, [data-theme="light"]').size, 19, 'block 1');
  assert.equal(gen.get('[data-theme="dark"]').size, 19, 'block 2');
  // 3 / 4 / 4b · neutral accent · all 6 (every neutral token swaps light↔dark)
  for (const sel of ['[data-accent="neutral"]', '[data-accent="neutral"][data-theme="dark"]', '[data-theme="dark"] [data-accent="neutral"]']) {
    assert.equal(gen.get(sel).size, 6, sel);
  }
  // each non-neutral accent (lilac · orange · …):
  //   · light block · all 6 (light base)
  //   · combined-dark + self-scope-dark · ONLY the 3 theme-adapting (fg, bg-subtle,
  //     bg-subtle-pressed) — the P4-frozen brand tokens (solid, solid-pressed,
  //     on-solid) are omitted (light===dark → no dark redeclaration).
  const adapting = ['--nuri-accent-bg-subtle', '--nuri-accent-bg-subtle-pressed', '--nuri-accent-fg'];
  for (const a of NON_NEUTRAL_ACCENTS) {
    assert.equal(gen.get(`[data-accent="${a}"]`).size, 6, `${a} light block`);
    assert.deepEqual(props(`[data-accent="${a}"][data-theme="dark"]`), adapting, `${a} combined-dark · P4 partial`);
    assert.deepEqual(props(`[data-theme="dark"] [data-accent="${a}"]`), adapting, `${a} self-scope-dark · P4 partial`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed cascade == the emit's output · byte-level)
// ══════════════════════════════════════════════════════════════════
test('Guard B · tokens-semantic.css cascade is fresh (re-splice byte-identical)', () => {
  assert.equal(
    spliceCascade(semCss, region),
    semCss,
    'tokens-semantic.css cascade is stale — run `npm run build -w @nuri/spec`',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard C · INDEPENDENT MATRIX ORACLE (restated · resolved both ways)
// ══════════════════════════════════════════════════════════════════
// [cssVar, accent, theme, expected final hex] — RESTATED by hand (cream + lilac
// resolved · not read from the SoT or CSS). Spans chrome (same-scale + INVERSE +
// the brand focus ring), accent neutral (INVERSE · incl. the dec-63 dark cell),
// and accent lilac (FROZEN-P4 + theme-adapting). Chrome is accent-invariant, so
// its accent column is arbitrary (one cell asserts the invariance via 'lilac').
const CELLS = [
  // chrome · same-scale
  ['--nuri-bg-canvas',             'neutral', 'light', '#fffdf2'], // cream-1-light
  ['--nuri-bg-canvas',             'neutral', 'dark',  '#12110b'], // cream-1-dark
  ['--nuri-text-primary',          'neutral', 'light', '#222013'], // cream-12-light
  // chrome · INVERSE (a slice of the other theme)
  ['--nuri-bg-inverse',            'neutral', 'light', '#12110b'], // → neutral.1.dark
  ['--nuri-bg-inverse',            'neutral', 'dark',  '#fffdf2'], // → neutral.1.light
  // chrome · focus ring is brand (lilac) regardless of accent — assert at both accents
  ['--nuri-focus-ring',            'neutral', 'light', '#ae91ff'], // lilac-8-light
  ['--nuri-focus-ring',            'lilac',   'dark',  '#6c58a3'], // lilac-8-dark (accent-invariant)
  // accent · neutral · INVERSE solid family (saturated)
  ['--nuri-accent-solid',          'neutral', 'light', '#12110b'], // → neutral.1.dark  (cream-1-dark)
  ['--nuri-accent-solid',          'neutral', 'dark',  '#fffdf2'], // → neutral.1.light (cream-1-light) · THE dec-63 dark cell
  ['--nuri-accent-on-solid',       'neutral', 'light', '#f0eee3'], // → neutral.12.dark
  ['--nuri-accent-fg',             'neutral', 'dark',  '#f0eee3'], // same-scale → neutral.12.dark
  // accent · lilac · FROZEN-P4 solid (bright brand · light===dark)
  ['--nuri-accent-solid',          'lilac',   'light', '#beaaff'], // lilac-9-light
  ['--nuri-accent-solid',          'lilac',   'dark',  '#beaaff'], // FROZEN · stays lilac-9-light
  ['--nuri-accent-solid-pressed',  'lilac',   'dark',  '#b39ff3'], // FROZEN · stays lilac-10-light
  // accent · lilac · theme-adapting
  ['--nuri-accent-fg',             'lilac',   'light', '#381b6a'], // lilac-12-light
  ['--nuri-accent-fg',             'lilac',   'dark',  '#e3ddfa'], // lilac-12-dark
  ['--nuri-accent-bg-subtle',      'lilac',   'dark',  '#282040'], // lilac-3-dark
  // accent · orange · the second accent (N+56) · FROZEN-P4 solid (light===dark)
  ['--nuri-accent-solid',          'orange',  'light', '#ff8c5a'], // orange-9-light
  ['--nuri-accent-solid',          'orange',  'dark',  '#ff8c5a'], // FROZEN · stays orange-9-light
  // accent · orange · theme-adapting fg (light≠dark · proves the dark block applies)
  ['--nuri-accent-fg',             'orange',  'light', '#5e280f'], // orange-12-light
  ['--nuri-accent-fg',             'orange',  'dark',  '#f9d6c8'], // orange-12-dark
];

// SoT path · a ref resolves through the active neutral (cream) + the accent ramps
// (lilac · orange · …). loadColours returns the accent ramps keyed by accent name
// (N+56 · data-driven) — spread them so any accent's refs resolve.
const sotScales = { neutral: colours.neutralScales.cream, ...colours.accentScales };
function sotRefHex(ref) {
  const [scale, step, theme] = ref.split('.');
  const table = sotScales[scale];
  assert.ok(table, `unknown scale '${scale}' in ref '${ref}'`);
  const leaf = table[step]?.[theme];
  assert.ok(leaf, `no primitive for ref '${ref}'`);
  return leaf.value;
}
function sotRefFor(cssVar, accentName, theme) {
  if (cssVar.startsWith('--nuri-accent-')) {
    // accent-major (N+55 · decision 80): accent[accentName] is the role table; a role
    // is a flat `string` ref (theme-invariant) or a `{light,dark}` pair (theme-adapting).
    const role = accent[accentName][cssVar.slice('--nuri-accent-'.length)];
    return typeof role === 'string' ? role : role[theme];
  }
  return chrome[cssVar.slice('--nuri-'.length)][theme]; // chrome · accent-invariant · bare ref (N+55)
}

test('Guard C · the matrix resolves to the restated oracle — through the SoT', () => {
  for (const [cssVar, accentName, theme, hex] of CELLS) {
    assert.equal(sotRefHex(sotRefFor(cssVar, accentName, theme)), hex, `${cssVar} @ ${accentName}/${theme} (SoT)`);
  }
});

test('Guard C · the matrix resolves to the restated oracle — through the live committed CSS cascade', () => {
  // The REAL build path: walk the committed cascade + chase var() through the
  // committed primitives (cream). If the SoT and CSS both held a wrong ref, the SoT
  // path could pass while this fails against the independent oracle.
  const resolved = resolveSemanticCrossProduct(readSemanticRules(semCss), buildPrimitiveMap(primCss));
  for (const [cssVar, accentName, theme, hex] of CELLS) {
    const got = resolved[cssVar]?.[accentName]?.[theme];
    assert.equal(got, hex, `${cssVar} @ ${accentName}/${theme} (live CSS)`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard D · THE dec-63 SELF-SCOPE + THE LOCK
// ══════════════════════════════════════════════════════════════════
test('Guard D · the dec-63 #4b/#6b self-scope emit is faithful', () => {
  const gen = cascadeRuleMap(region);

  // #4b · a self-scoped neutral accent under a dark ANCESTOR re-asserts the dark
  // values that block 3 clobbered — the IconButton dark-on-dark fix. The swap CTA
  // resolves --nuri-accent-solid → neutral-1-light (the cream that shows on dark).
  const b4b = gen.get('[data-theme="dark"] [data-accent="neutral"]');
  assert.ok(b4b, 'the #4b self-scope block is missing');
  assert.equal(b4b.get('--nuri-accent-solid'), 'var(--nuri-color-neutral-1-light)', '#4b accent-solid (dec-63 fix)');
  assert.deepEqual(
    sortedEntries(b4b),
    sortedEntries(gen.get('[data-accent="neutral"][data-theme="dark"]')),
    '#4b must mirror #4 exactly (the dark neutral values)',
  );

  // each non-neutral accent's self-scope dark block (#6b · #8b · …) · PARTIAL per P4 —
  // the 3 theme-adapting only; the frozen brand tokens are intentionally absent (no
  // clobber to repair · the light block IS the brand). Mirrors its combined-dark twin.
  for (const a of NON_NEUTRAL_ACCENTS) {
    const selfScope = gen.get(`[data-theme="dark"] [data-accent="${a}"]`);
    assert.ok(selfScope, `the ${a} self-scope block is missing`);
    for (const frozen of ['--nuri-accent-solid', '--nuri-accent-solid-pressed', '--nuri-accent-on-solid']) {
      assert.equal(selfScope.has(frozen), false, `${frozen} is P4-frozen — the ${a} self-scope must NOT redeclare it`);
    }
    assert.deepEqual(
      sortedEntries(selfScope),
      sortedEntries(gen.get(`[data-accent="${a}"][data-theme="dark"]`)),
      `the ${a} self-scope must mirror its combined-dark twin (the 3 theme-adapting tokens)`,
    );
  }
});

test('Guard D · the #4b/#6b selectors are DESCENDANT combinators (the dec-63 known-limitation form)', () => {
  // The descendant combinator (a space between the two attribute selectors · spec
  // 0,2,0) matches ANY dark ancestor, not the NEAREST theme — the accepted
  // nearest-vs-any limitation (decision 63). Pin that exact selector form so a
  // refactor to a combined/child form (which would change the matching semantics)
  // fails loudly.
  assert.match(semCss, /\[data-theme="dark"\] \[data-accent="neutral"\]\s*\{/, '#4b descendant combinator');
  for (const a of NON_NEUTRAL_ACCENTS) {
    assert.match(
      semCss,
      new RegExp(`\\[data-theme="dark"\\] \\[data-accent="${a}"\\]\\s*\\{`),
      `the ${a} self-scope descendant combinator is missing`,
    );
  }
});
