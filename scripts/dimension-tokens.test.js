/* ══════════════════════════════════════════════════════════════════
 * NURI · DIMENSION-TOKENS + TOKEN-PATHS TS-SOURCING HARNESS (N+60 · Slice 3b·2a · decision 80)
 * ──────────────────────────────────────────────────────────────────
 * Proves the RN contract's last two CSS round-trips are DEAD: build/tokens.ts's
 * dimension arm (space · size · radius) and build/token-paths.ts's union are now
 * flattened STRAIGHT from the TS SoTs (pipeline/dimensions.ts · pipeline/colours.ts),
 * not walked from styles/tokens-semantic.css. The dimension twin of the N+59 colour
 * harness (colour-semantic.test.js Guard E). The byte-identical `git diff build/` CI
 * gate ties the COMMITTED artifact to the emitter; these guards tie the emitter to an
 * INDEPENDENT hand oracle (non-tautological) and prove the CSS is no longer the source.
 *
 *   A · DIMENSION ARM ≡ RESTATED ORACLE — resolveDimensionTokens(dims) resolves every
 *       space/size/radius leaf to the design value RESTATED here by hand (not read from
 *       the CSS or the SoT module). A wrong ref / px-value misread surfaces here.
 *   B · COMMITTED tokens.ts ≡ THE SoT — the dimension values parsed out of the committed
 *       build/tokens.ts equal resolveDimensionTokens(dims). Ties the on-disk artifact to
 *       the SoT resolver (the freshness gate proves emitter==committed; this proves
 *       resolver==committed without trusting the CSS).
 *   C · TOKEN-PATHS UNION ≡ RESTATED ORACLE + COMMITTED — the union emitTokenPathsTsFromSoT
 *       produces equals the full leaf list RESTATED here by hand, AND equals the union in
 *       the committed build/token-paths.ts (same order).
 *   D · THE ROUND-TRIP IS DEAD (structural) — the dimension arm is a pure function of
 *       pipeline/dimensions.ts: CORRUPTING the committed cascade CSS moves the old walk
 *       (resolveSemanticCrossProduct) but NOT resolveDimensionTokens. The dimension/path
 *       emitters take only the TS SoTs — they cannot read semanticRules.
 *
 * Run:  node --test scripts/dimension-tokens.test.js   (or via the drift gate)
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDimensions } from './parsers/dimension-css.js';
import { resolveDimLeaf, resolveDimensionTokens } from './parsers/dimension-tokens.js';
import { emitTokenPathsTsFromSoT } from './parsers/token-paths.js';
import { loadSemanticColours } from './parsers/semantic-css.js';
import {
  readSemanticRules,
  buildPrimitiveMap,
  resolveSemanticCrossProduct,
  ACCENTS,
  THEMES,
} from './parsers/semantic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../packages/spec');
// N+62 (decision 80): spec is DATA (the SoTs under tokens/); the token CSS is the web
// projection's output (@nuri/prototype/generated/) + tokens.ts/token-paths.ts the RN
// projection's contract (@nuri/rn/generated/).
const RN_GENERATED = resolve(__dirname, '../packages/rn/generated');
const PROTO_GENERATED = resolve(__dirname, '../packages/prototype/generated');
const DIMENSIONS_SRC = resolve(REPO_ROOT, 'tokens/dimensions.ts');
const COLOURS_SRC = resolve(REPO_ROOT, 'tokens/colours.ts');
const PRIMITIVE_CSS = resolve(PROTO_GENERATED, 'styles/tokens-primitive.css');
const SEMANTIC_CSS = resolve(PROTO_GENERATED, 'styles/tokens-semantic.css');
const TOKENS_TS = resolve(RN_GENERATED, 'data/tokens.ts');
const TOKEN_PATHS_TS = resolve(RN_GENERATED, 'data/token-paths.ts');

const dims = await loadDimensions(DIMENSIONS_SRC);
const { chrome, accent } = await loadSemanticColours(COLOURS_SRC);
const primCss = readFileSync(PRIMITIVE_CSS, 'utf8');
const semCss = readFileSync(SEMANTIC_CSS, 'utf8');
const tokensTs = readFileSync(TOKENS_TS, 'utf8');
const tokenPathsTs = readFileSync(TOKEN_PATHS_TS, 'utf8');

// '12px' → 12 · '0' → 0 · '9999px' → 9999 (the JS numeric tokens.ts emits).
const litToNum = (lit) => Number(lit.replace('px', ''));

// ══════════════════════════════════════════════════════════════════
// Guard A · DIMENSION ARM ≡ RESTATED ORACLE (non-tautological)
// ══════════════════════════════════════════════════════════════════
// The design scale, RESTATED by hand — the independent oracle. NOT read from the CSS
// or the SoT module. These are the FINAL resolved numbers (space.none + radius.full
// are the direct-authored sentinels · decision 32 / 36.1).
const SPACE_FINAL = { none: 0, '2xs': 2, xs: 4, sm: 6, md: 12, lg: 18, xl: 24, '2xl': 36 };
const SIZE_FINAL = { xs: 18, sm: 24, md: 36, lg: 48, xl: 54, '2xl': 72, '3xl': 90 };
const RADIUS_FINAL = { sm: 6, md: 9, lg: 18, full: 9999 };
// The ratio scale is UNITLESS — the RN values are BARE numbers (no `px` · the named
// risk surfaces here: a px leak makes litToNum mis-read or the value carry a unit).
const RATIO_FINAL = { square: 1, card: 1.586 };
const BORDER_FINAL = { 1: 1 };
const DIM_ORACLE = { space: SPACE_FINAL, size: SIZE_FINAL, radius: RADIUS_FINAL, ratio: RATIO_FINAL, border: BORDER_FINAL };

test('Guard A · resolveDimensionTokens(dims) ≡ the restated design oracle', () => {
  const tokens = resolveDimensionTokens(dims);
  for (const [scale, final] of Object.entries(DIM_ORACLE)) {
    for (const [leaf, expected] of Object.entries(final)) {
      const node = tokens[`--nuri-${scale}-${leaf}`];
      assert.ok(node, `--nuri-${scale}-${leaf} missing from the dimension arm`);
      assert.equal(litToNum(node[ACCENTS[0]][THEMES[0]]), expected, `${scale}.${leaf} (SoT)`);
    }
    // leaf set parity — no extra / missing leaf vs the oracle.
    const emitted = Object.keys(tokens).filter((k) => k.startsWith(`--nuri-${scale}-`));
    assert.deepEqual(
      emitted.map((k) => k.slice(`--nuri-${scale}-`.length)).sort(),
      Object.keys(final).sort(),
      `${scale} leaf set`,
    );
  }
});

test('Guard A · the dimensions are context-invariant (identical in every accent × theme cell)', () => {
  const tokens = resolveDimensionTokens(dims);
  for (const node of Object.values(tokens)) {
    const first = node[ACCENTS[0]][THEMES[0]];
    for (const a of ACCENTS) for (const t of THEMES) {
      assert.equal(node[a][t], first, 'a dimension leaf must hold one value across all (accent, theme)');
    }
  }
});

test('Guard A · resolveDimLeaf is exhaustive over the Leaf union (0-sentinel · px-literal · unitless ratio)', () => {
  assert.equal(resolveDimLeaf({ value: 12, unit: 'px' }), '12px');
  assert.equal(resolveDimLeaf({ value: 0, unit: 'px' }), '0');       // unitless collapse
  assert.equal(resolveDimLeaf({ value: 9999, unit: 'px' }), '9999px'); // pill sentinel
  assert.equal(resolveDimLeaf({ value: 1.586, unit: 'none' }), '1.586'); // BARE ratio · NO px (named risk)
  assert.equal(resolveDimLeaf({ value: 1, unit: 'none' }), '1');          // square · still no px
  assert.throws(() => resolveDimLeaf({ ref: 7 }), /not \{ value, unit \}/);
  assert.throws(() => resolveDimLeaf({ junk: 1 }), /not \{ value, unit \}/);
});

// ══════════════════════════════════════════════════════════════════
// Guard B · COMMITTED build/tokens.ts ≡ THE SoT RESOLVER
// ══════════════════════════════════════════════════════════════════
// Parse the dimension value objects out of the committed build/tokens.ts (the `= { … }`
// block after each `export const <scale>: { … }` type). Independent of the emitter.
function committedDimBlock(scale) {
  const re = new RegExp(`export const ${scale}: \\{[\\s\\S]*?\\} = \\{([\\s\\S]*?)\\};`);
  const m = tokensTs.match(re);
  assert.ok(m, `no committed '${scale}' block in build/tokens.ts`);
  const obj = {};
  for (const line of m[1].split('\n')) {
    // decimal-aware: the ratio scale emits bare fractionals (card: 1.586) alongside
    // the integer dimension scales — match either (NO trailing `px`, the unitless invariant).
    const lm = line.match(/^\s*'?([\w-]+)'?:\s*(\d+(?:\.\d+)?),/);
    if (lm) obj[lm[1]] = Number(lm[2]);
  }
  return obj;
}

test('Guard B · the committed build/tokens.ts dimension values ≡ resolveDimensionTokens(dims)', () => {
  const tokens = resolveDimensionTokens(dims);
  for (const scale of ['space', 'size', 'radius', 'ratio', 'border']) {
    const committed = committedDimBlock(scale);
    const fromSoT = Object.fromEntries(
      Object.entries(tokens)
        .filter(([k]) => k.startsWith(`--nuri-${scale}-`))
        .map(([k, node]) => [k.slice(`--nuri-${scale}-`.length), litToNum(node[ACCENTS[0]][THEMES[0]])]),
    );
    assert.deepEqual(committed, fromSoT, `build/tokens.ts ${scale} drifted from pipeline/dimensions.ts`);
  }
});

// ══════════════════════════════════════════════════════════════════
// Guard C · TOKEN-PATHS UNION ≡ RESTATED ORACLE + COMMITTED
// ══════════════════════════════════════════════════════════════════
// The full runtime-set leaf union, RESTATED by hand (the same order tokens.ts emits:
// chrome · accent · space · size · radius). NOT read from the SoT or the CSS.
const UNION_ORACLE = [
  'chrome.bgCanvas', 'chrome.bgSubtle', 'chrome.bgStrong', 'chrome.bgPressed',
  'chrome.bgInverse', 'chrome.bgInverseMuted', 'chrome.textPrimary', 'chrome.textMuted',
  'chrome.textOnInverse', 'chrome.borderSubtle', 'chrome.borderDefault', 'chrome.borderStrong',
  'chrome.focusRing',
  'accent.fg', 'accent.solid', 'accent.solidPressed', 'accent.onSolid', 'accent.bgSubtle',
  'accent.bgSubtlePressed',
  'space.none', 'space.2xs', 'space.xs', 'space.sm', 'space.md', 'space.lg', 'space.xl', 'space.2xl',
  'size.xs', 'size.sm', 'size.md', 'size.lg', 'size.xl', 'size.2xl', 'size.3xl',
  'radius.sm', 'radius.md', 'radius.lg', 'radius.full',
  'ratio.square', 'ratio.card',
  'border.1',
];

// Extract the `| 'x.y'` members from a token-paths.ts source string, in order.
const unionMembers = (src) => [...src.matchAll(/\|\s*'([^']+)'/g)].map((m) => m[1]);

test('Guard C · emitTokenPathsTsFromSoT enumerates exactly the restated union (order-exact)', () => {
  const emitted = unionMembers(emitTokenPathsTsFromSoT({ chrome, accent }, dims));
  assert.deepEqual(emitted, UNION_ORACLE);
});

test('Guard C · the committed build/token-paths.ts union ≡ the SoT enumeration', () => {
  assert.deepEqual(unionMembers(tokenPathsTs), UNION_ORACLE, 'committed token-paths.ts drifted from the SoTs');
});

// ══════════════════════════════════════════════════════════════════
// Guard D · THE ROUND-TRIP IS DEAD (structural · CSS is no longer the source)
// ══════════════════════════════════════════════════════════════════
test('Guard D · the dimension arm ignores the cascade CSS (corrupt it · the SoT arm is unmoved)', () => {
  // The OLD path (resolveSemanticCrossProduct over the cascade) would track a CSS edit;
  // the SoT path does not. Corrupt --nuri-space-md in the committed semantic CSS and walk
  // it the old way — then assert resolveDimensionTokens(dims) is unaffected.
  const corrupted = semCss.replace(/--nuri-space-md:[^;]+;/, '--nuri-space-md: 90px;');
  assert.notEqual(corrupted, semCss, 'sanity: the corruption pattern must match a real decl');
  const cssWalk = resolveSemanticCrossProduct(readSemanticRules(corrupted), buildPrimitiveMap(primCss));
  assert.equal(cssWalk['--nuri-space-md'][ACCENTS[0]][THEMES[0]], '90px', 'sanity: the CSS walk took the corruption');

  const sotArm = resolveDimensionTokens(dims);
  assert.equal(litToNum(sotArm['--nuri-space-md'][ACCENTS[0]][THEMES[0]]), 12,
    'the dimension arm read the corrupted CSS — the round-trip is NOT dead');
});

test('Guard D · the dimension/path emitters take only the TS SoTs (no semanticRules param)', () => {
  // resolveDimensionTokens(dims) · emitTokenPathsTsFromSoT({chrome,accent}, dims) — both
  // are arity-≤2 functions over the TS SoTs. A future refactor that re-introduces a CSS
  // arg trips this guard.
  assert.equal(resolveDimensionTokens.length, 1, 'resolveDimensionTokens must take only dims');
  assert.equal(emitTokenPathsTsFromSoT.length, 2, 'emitTokenPathsTsFromSoT must take only the SoTs');
});
