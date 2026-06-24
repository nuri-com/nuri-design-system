/* ══════════════════════════════════════════════════════════════════
 * NURI · COLOUR CASCADE PARITY HARNESS (N+32 · decision 70 · the second flip)
 * ──────────────────────────────────────────────────────────────────
 * Proves the TS colour-primitive SoT (pipeline/colours.ts) and the committed
 * tokens-primitive.css agree, and that the neutral resolution bottoms out at the
 * cream scale (the C1 lock · neutral = cream · decision 31). The colour twin of
 * pipeline/dimension-cascade.test.js (N+31). This is the gate that lets decision 2
 * reverse for the colour-PRIMITIVE layer: until it is green the flip is reversible
 * (the CSS is the oracle); once green the SoT is the source and the CSS its
 * projection.
 *
 * C1 SCOPE — the flat catalog + the neutral resolution. The SEMANTIC accent×theme
 * matrix (the chrome + accent cascade · the decision-63 #4b/#6b self-scope) stays
 * the CSS SoT; its TS authoring + the genuinely-templated cascade emit are C2 (the
 * harder slice). Guard D LOCKS that boundary (the colour SoT owns nothing in
 * tokens-semantic.css · the cascade is present + untouched).
 *
 *   A · STRUCTURAL ≡ — the SoT's { cssVar → RHS } map (the raw catalog ∪ the
 *       cream-resolved neutral aliases) equals the committed tokens-primitive.css
 *       --nuri-color-* map. A drift between the two on-disk sources (a hand edit)
 *       fails here. Also asserts the SoT's neutral-scale set ≡ semantic.js
 *       NEUTRAL_SCALES (the two vocabularies can't diverge).
 *   B · RE-EMIT FRESHNESS — re-running the in-place colour emit on the committed
 *       CSS is byte-identical (the CSS is the SoT's fresh output · `npm run build`
 *       was run). Non-tautological: the emit takes its values from the SoT.
 *   C · CREAM ORACLE (independent) — the 24 cream hex are RESTATED here (not read
 *       from the CSS or the SoT) and the neutral resolution is chased two ways:
 *       through the SoT (neutralScales.cream) AND through the live CSS var() chain
 *       (--nuri-color-neutral-N-θ → var(--nuri-color-cream-N-θ) → #hex). Both must
 *       equal the restated oracle. The substantive guard — if the SoT and CSS both
 *       held a wrong neutral, A/B pass but C fails (it is the brief's cream lock).
 *   D · THE LOCK — (i) the frozen brand + alpha values are unmoved (lilac-9 ·
 *       black/white-alpha-1 · restated · these are NOT the neutral, so they must be
 *       value-stable); (ii) the colour SoT owns NO declaration in
 *       tokens-semantic.css and the decision-63 cascade selectors are present
 *       there — the C1/C2 boundary (the accent×theme cascade is untouched).
 *
 * Run:  node --test pipeline/colour-cascade.test.js   (or via `npm test`)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import {
  loadColours,
  primitiveColourMap,
  colourPrimitiveMap,
  rewriteColourDecls,
} from './parsers/colour-css.js';
import { NEUTRAL_SCALES, DEFAULT_NEUTRAL } from './parsers/semantic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const PRIMITIVE_CSS = resolve(REPO_ROOT, 'styles/tokens-primitive.css');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
const COLOURS_SRC = resolve(REPO_ROOT, 'pipeline/colours.ts');

const colours = await loadColours(COLOURS_SRC);
const primCss = readFileSync(PRIMITIVE_CSS, 'utf8');
const semCss = readFileSync(SEMANTIC_CSS, 'utf8');

// the committed CSS is the DEFAULT-neutral build (cream · the CI builds with no
// --neutral). The harness asserts the SoT-at-DEFAULT ≡ the committed artifact.
const COLOUR_RE = /^--nuri-color-/;
const declMap = colourPrimitiveMap({ colours, neutral: DEFAULT_NEUTRAL });

// parse a css file → Map<prop, value> for the props matching `re`.
function declMapFromCss(css, re) {
  const map = new Map();
  postcss.parse(css).walkDecls((d) => {
    if (re.test(d.prop)) map.set(d.prop, d.value.trim());
  });
  return map;
}

const sortedEntries = (map) => [...map.entries()].sort(([a], [b]) => a.localeCompare(b));

// ══════════════════════════════════════════════════════════════════
// Guard A · STRUCTURAL ≡ (the SoT map ≡ the committed CSS map)
// ══════════════════════════════════════════════════════════════════
test('Guard A · colour primitives + neutral resolution: SoT ≡ committed tokens-primitive.css', () => {
  assert.deepEqual(
    sortedEntries(declMap),
    sortedEntries(declMapFromCss(primCss, COLOUR_RE)),
  );
});

test('Guard A · the SoT neutral-scale set ≡ semantic.js NEUTRAL_SCALES', () => {
  // The two neutral vocabularies (the colour SoT's scale keys · the build's
  // --neutral= options) must not diverge — a scale in one but not the other is a
  // build-time footgun.
  assert.deepEqual(
    Object.keys(colours.neutralScales).sort(),
    [...NEUTRAL_SCALES].sort(),
  );
  assert.ok(NEUTRAL_SCALES.includes(DEFAULT_NEUTRAL), 'DEFAULT_NEUTRAL must be a known scale');
});

// ══════════════════════════════════════════════════════════════════
// Guard B · RE-EMIT FRESHNESS (committed CSS == the emit's output · byte-level)
// ══════════════════════════════════════════════════════════════════
test('Guard B · tokens-primitive.css colour decls are fresh (re-emit byte-identical)', () => {
  assert.equal(
    rewriteColourDecls(primCss, declMap, COLOUR_RE),
    primCss,
    'tokens-primitive.css colour decls are stale — run `npm run build -w @nuri/spec`',
  );
});

// ══════════════════════════════════════════════════════════════════
// Guard C · CREAM ORACLE (restated · resolved two ways)
// ══════════════════════════════════════════════════════════════════
// The cream scale, RESTATED by hand — the independent oracle. NOT read from the
// CSS or the SoT; if a value here disagrees with either, one is wrong. This is the
// brief's cream lock: the resolved --nuri-color-neutral-* MUST be cream.
const CREAM_ORACLE = {
  light: ['#fffdf2', '#fbf9ee', '#f3f1e2', '#ece9da', '#e5e2d1', '#dddac9', '#d2cfbf', '#bfbcac', '#8f8c7d', '#858273', '#666455', '#222013'],
  dark:  ['#12110b', '#1a1913', '#242319', '#2c2a1e', '#343124', '#3d3b2e', '#4b483b', '#636153', '#706d5f', '#7e7b6c', '#b7b4a4', '#f0eee3'],
};

test('Guard C · the SoT cream scale equals the restated cream oracle', () => {
  for (const theme of ['light', 'dark']) {
    for (let step = 1; step <= 12; step++) {
      assert.equal(
        colours.neutralScales.cream[step][theme].value,
        CREAM_ORACLE[theme][step - 1],
        `colours.ts cream.${step}.${theme}`,
      );
    }
  }
});

test('Guard C · the live neutral resolution chases to cream through the CSS var() chain', () => {
  // Build a var map from the COMMITTED CSS and chase the generated chain end to end
  // (--nuri-color-neutral-N-θ → var(--nuri-color-cream-N-θ) → #hex the browser sees).
  const varMap = declMapFromCss(primCss, /^--nuri-/);
  const resolveRhs = (rhs, depth = 0) => {
    if (depth > 8) throw new Error(`var() chain too deep at '${rhs}'`);
    const m = rhs.match(/^var\((--[\w-]+)\)$/);
    if (!m) return rhs;
    const next = varMap.get(m[1]);
    assert.ok(next !== undefined, `unresolved ${m[1]}`);
    return resolveRhs(next, depth + 1);
  };
  for (const theme of ['light', 'dark']) {
    for (let step = 1; step <= 12; step++) {
      const prop = `--nuri-color-neutral-${step}-${theme}`;
      const rhs = varMap.get(prop);
      assert.ok(rhs !== undefined, `${prop} missing from the CSS`);
      // the resolution must hop through cream specifically (not just any value)
      assert.equal(rhs, `var(--nuri-color-cream-${step}-${theme})`, `${prop} must resolve via cream`);
      assert.equal(resolveRhs(rhs), CREAM_ORACLE[theme][step - 1], `${prop} resolved through the live CSS`);
    }
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard D · THE LOCK (frozen brand/alpha unmoved · the cascade untouched)
// ══════════════════════════════════════════════════════════════════
test('Guard D · the frozen brand + alpha values are unmoved (restated · not the neutral)', () => {
  const raw = primitiveColourMap(colours);
  // lilac-9 is the brand fill · frozen identical across themes (the bright scale).
  assert.equal(raw.get('--nuri-color-lilac-9-light'), '#beaaff', 'lilac-9-light (brand)');
  assert.equal(raw.get('--nuri-color-lilac-9-dark'), '#beaaff', 'lilac-9-dark (brand · frozen == light)');
  // the alpha scales · theme-invariant rgba · the exact CSS spelling (byte-identity).
  assert.equal(raw.get('--nuri-color-black-alpha-1'), 'rgba(0, 0, 0, 0.05)', 'black-alpha-1');
  assert.equal(raw.get('--nuri-color-white-alpha-1'), 'rgba(255, 255, 255, 0.05)', 'white-alpha-1');
  assert.equal(raw.get('--nuri-color-black-alpha-12'), 'rgba(0, 0, 0, 0.95)', 'black-alpha-12');
});

test('Guard D · the C1/C2 boundary: the colour SoT owns nothing in tokens-semantic.css; the dec-63 cascade is present', () => {
  // The colour emit touches tokens-primitive.css ONLY. The semantic file declares
  // no --nuri-color-* prop (it REFERENCES the primitives via var() on the RHS), so
  // the SoT owns nothing there — the accent×theme cascade stays hand-authored (C2).
  const semColourDecls = declMapFromCss(semCss, COLOUR_RE);
  assert.equal(
    semColourDecls.size, 0,
    `tokens-semantic.css declares --nuri-color-* props (${[...semColourDecls.keys()].join(', ')}) — ` +
    `the colour SoT must own only tokens-primitive.css; the cascade is C2`,
  );
  // The decision-63 self-scope cascade is present + untouched (the #4b/#6b blocks).
  assert.match(semCss, /\[data-theme="dark"\] \[data-accent="neutral"\]/, 'the #4b self-scope block is missing — the dec-63 cascade must be intact');
  assert.match(semCss, /\[data-theme="dark"\] \[data-accent="lilac"\]/, 'the #6b self-scope block is missing — the dec-63 cascade must be intact');
});
