/* ──────────────────────────────────────────────────────────────
 * NURI · TOKENS PARSER · ROUND-TRIP + SEMANTIC CROSS-PRODUCT TEST
 *
 * Two surfaces:
 *   1. Primitive round-trip (N+3.5 · 6 assertions). Regex-scans
 *      tokens-primitive.css independently of the parser, walks
 *      build/tokens.json, asserts every --nuri-color-* declaration
 *      appears unchanged in the emitted DTCG tree.
 *   2. Semantic cross-product (N+5 · new). A hand-derived oracle
 *      table maps every semantic token to its expected literal per
 *      (accent × theme) by reading the cascade in tokens-semantic.css
 *      and the var() chain to tokens-primitive.css (cream default ·
 *      decision 31). The parser's resolveSemanticCrossProduct must
 *      agree.
 *
 * R2 mitigation per docs/RISKS.md. Run with:
 *   node --test pipeline/tokens-parser.test.js
 * ────────────────────────────────────────────────────────────── */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import {
  readPrimitives,
  buildDtcg,
  inferType,
  pathFor,
  buildPrimitiveMap,
  readSemanticRules,
  resolveSemanticCrossProduct,
  collectSemanticVars,
  selectorMatches,
  resolveValue,
  classifySemantic,
  classifyAll,
  GROUP_NAMES,
  ACCENTS,
  THEMES,
  SET_POLICY,
  resolveSetPolicy,
  primitiveSetFor,
  resolveComponentValue,
  emitComponentTs,
  emitTokenPathsTs,
  readIcons,
  emitIconsJs,
  emitIconsTs,
  buildTypeScale,
  emitTypeTs,
  TYPE_SIZES,
  buildInteraction,
  emitInteractionTs,
  INTERACTION_PRIMITIVES,
} from './tokens-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CSS_PATH = resolve(REPO_ROOT, 'styles/tokens-primitive.css');
const SEMANTIC_CSS_PATH = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
const JSON_PATH = resolve(REPO_ROOT, 'build/tokens.json');
const TS_PATH = resolve(REPO_ROOT, 'build/tokens.ts');
const INTERACTION_TS_PATH = resolve(REPO_ROOT, 'build/interaction.ts');
const TOKEN_PATHS_PATH = resolve(REPO_ROOT, 'build/token-paths.ts');
const ICONS_TS_PATH = resolve(REPO_ROOT, 'build/icons.ts');
const ICONS_DIR = resolve(REPO_ROOT, 'icons');
const ICONS_JS_PATH = resolve(REPO_ROOT, 'lib/components/icon/icons.js');

// Regex-extracted "what the CSS actually says" — used as the
// reference set. NOT the parser. If parser + regex agree, we trust
// neither alone; if they disagree, the test fires.
//
// Matches lines like:
//   --nuri-color-gray-1-light:   #fcfcfc;
//   --nuri-color-black-alpha-1:  rgba(0, 0, 0, 0.05);
// Inline /* comments */ are stripped before the regex pass so they
// can't bleed into a value match.
//
// Scope assumptions matching the thin slice:
//   · single-line declarations only (every --nuri-color-* in
//     tokens-primitive.css today fits this — composite values like
//     multi-line shadow tokens would need a multi-line variant)
//   · rule context is ignored (the regex matches the same value
//     regardless of whether it appears inside :root or
//     :root[data-neutral="…"]; aliases starting with var(...) are
//     filtered the same way the parser filters them, so the test's
//     denominator stays aligned with the parser's numerator)
function extractColorPairsFromCss(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /(--nuri-color-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  const out = new Map();
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const cssVar = m[1];
    const value = m[2].trim();
    if (value.startsWith('var(')) continue;
    // Later declarations win — primitive file only declares each
    // raw value once anyway, but be explicit.
    out.set(cssVar, value);
  }
  return out;
}

function leafAt(tree, path) {
  let node = tree;
  for (const key of path) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[key];
  }
  return node;
}

test('build/tokens.json exists (run `node pipeline/tokens-parser.js` first)', async () => {
  await access(JSON_PATH);
});

test('every --nuri-color-* in CSS round-trips into tokens.json with the same value', async () => {
  const css = await readFile(CSS_PATH, 'utf8');
  const json = JSON.parse(await readFile(JSON_PATH, 'utf8'));

  const cssPairs = extractColorPairsFromCss(css);
  assert.ok(cssPairs.size > 0, 'regex found zero --nuri-color-* declarations — wrong source file?');

  const missing = [];
  const drifted = [];

  for (const [cssVar, expected] of cssPairs) {
    const leaf = leafAt(json, pathFor(cssVar));
    if (!leaf || typeof leaf !== 'object' || !('$value' in leaf)) {
      missing.push(cssVar);
      continue;
    }
    if (leaf.$value !== expected) {
      drifted.push({ cssVar, expected, got: leaf.$value });
    }
    if (leaf.$type !== 'color') {
      drifted.push({ cssVar, expected: '$type=color', got: `$type=${leaf.$type}` });
    }
  }

  assert.deepEqual(missing, [], `missing colour tokens in JSON: ${missing.join(', ')}`);
  assert.deepEqual(drifted, [], `value drift on round-trip: ${JSON.stringify(drifted, null, 2)}`);
});

test('readPrimitives + buildDtcg agree with the regex extraction', async () => {
  const css = await readFile(CSS_PATH, 'utf8');
  const primitives = await readPrimitives(css);
  const tree = buildDtcg(primitives, (v) => v.startsWith('--nuri-color-'));
  const cssPairs = extractColorPairsFromCss(css);

  for (const [cssVar, expected] of cssPairs) {
    const leaf = leafAt(tree, pathFor(cssVar));
    assert.ok(leaf, `parser dropped ${cssVar}`);
    assert.equal(leaf.$value, expected, `${cssVar} value mismatch`);
    assert.equal(leaf.$type, 'color', `${cssVar} $type mismatch`);
  }
});

test('inferType maps --nuri-color-* to "color"', () => {
  assert.equal(inferType('--nuri-color-gray-1-light'), 'color');
  assert.equal(inferType('--nuri-color-black-alpha-1'), 'color');
  assert.equal(inferType('--nuri-color-lilac-9-light'), 'color');
});

test('alpha tokens land at color.<base>.alpha.<step> with no theme suffix', async () => {
  const json = JSON.parse(await readFile(JSON_PATH, 'utf8'));
  const blackAlpha1 = leafAt(json, ['color', 'black', 'alpha', '1']);
  assert.ok(blackAlpha1, 'color.black.alpha.1 missing');
  assert.equal(blackAlpha1.$type, 'color');
  assert.match(blackAlpha1.$value, /^rgba\(/, 'expected rgba() value on alpha token');

  // Theme suffix must NOT be present (rule 3 — alpha tokens are theme-invariant).
  const accidentalLight = leafAt(json, ['color', 'black', 'alpha', '1', 'light']);
  assert.equal(accidentalLight, undefined, 'alpha tokens should not have theme suffix');
});

test('themed scale tokens land at color.<scale>.<step>.<theme>', async () => {
  const json = JSON.parse(await readFile(JSON_PATH, 'utf8'));
  const gray1Light = leafAt(json, ['color', 'gray', '1', 'light']);
  const gray1Dark = leafAt(json, ['color', 'gray', '1', 'dark']);
  assert.ok(gray1Light, 'color.gray.1.light missing');
  assert.ok(gray1Dark, 'color.gray.1.dark missing');
  assert.equal(gray1Light.$type, 'color');
  assert.equal(gray1Dark.$type, 'color');
});


// ──────────────────────────────────────────────────────────────
// N+5 · Semantic-cascade cross-product tests
// ──────────────────────────────────────────────────────────────

// Hand-derived oracle table. Each entry maps a semantic CSS var to
// its expected literal per (accent × theme). Derived by:
//   1. Reading the 6 cascade blocks of tokens-semantic.css and
//      picking the winning declaration per (accent, theme) using
//      the rules in AGENTS.md "Cascade ordering".
//   2. Walking each winning var() reference through the cream-default
//      primitives in tokens-primitive.css to a literal (decision 31 ·
//      build's selected --neutral scope is cream).
// If a test below fires: re-derive against the CSS files. NEVER
// edit a value to make the test pass — the test catches the kind
// of drift the hand-rolled tokens.ts (F-TOKEN-1) had to absorb.
// The lilac side + focus-ring stay frozen vs the gray-default oracle
// (they don't pass through the neutral alias chain).
const SEMANTIC_EXPECTED = {
  // ── Backgrounds · chrome · accent-invariant · cream-resolved ──
  '--nuri-bg-canvas':  { neutral: { light: '#fffdf2', dark: '#12110b' },
                         lilac:   { light: '#fffdf2', dark: '#12110b' } },
  '--nuri-bg-subtle':  { neutral: { light: '#fbf9ee', dark: '#1a1913' },
                         lilac:   { light: '#fbf9ee', dark: '#1a1913' } },
  '--nuri-bg-strong':  { neutral: { light: '#f3f1e2', dark: '#242319' },
                         lilac:   { light: '#f3f1e2', dark: '#242319' } },
  '--nuri-bg-pressed': { neutral: { light: '#ece9da', dark: '#2c2a1e' },
                         lilac:   { light: '#ece9da', dark: '#2c2a1e' } },
  // bg-inverse · pulls from the OPPOSITE theme's neutral-1.
  '--nuri-bg-inverse': { neutral: { light: '#12110b', dark: '#fffdf2' },
                         lilac:   { light: '#12110b', dark: '#fffdf2' } },
  // bg-inverse-muted · SAME-theme neutral-11 (shares the step with
  // text-muted) · muted OFF-track fill for Switch · N+6.5.
  '--nuri-bg-inverse-muted': { neutral: { light: '#666455', dark: '#b7b4a4' },
                               lilac:   { light: '#666455', dark: '#b7b4a4' } },

  // ── Text · chrome · accent-invariant · cream-resolved ──
  '--nuri-text-primary':    { neutral: { light: '#222013', dark: '#f0eee3' },
                              lilac:   { light: '#222013', dark: '#f0eee3' } },
  '--nuri-text-muted':      { neutral: { light: '#666455', dark: '#b7b4a4' },
                              lilac:   { light: '#666455', dark: '#b7b4a4' } },
  '--nuri-text-on-inverse': { neutral: { light: '#f0eee3', dark: '#222013' },
                              lilac:   { light: '#f0eee3', dark: '#222013' } },

  // ── Borders · chrome · accent-invariant · cream-resolved ──
  '--nuri-border-subtle':  { neutral: { light: '#dddac9', dark: '#3d3b2e' },
                             lilac:   { light: '#dddac9', dark: '#3d3b2e' } },
  '--nuri-border-default': { neutral: { light: '#d2cfbf', dark: '#4b483b' },
                             lilac:   { light: '#d2cfbf', dark: '#4b483b' } },
  '--nuri-border-strong':  { neutral: { light: '#bfbcac', dark: '#636153' },
                             lilac:   { light: '#bfbcac', dark: '#636153' } },

  // ── Focus · brand-coloured ring · chrome · accent-invariant ──
  // NOTE · lilac-8 is NOT in the bright-frozen set (only lilac-9 and
  // lilac-10 are). Light = #ae91ff, dark = #6c58a3. The N+4 hand-rolled
  // tokens.ts incorrectly marked lilac-8 as frozen — the slice fixes
  // this. Don't restore the old value. Lilac-side primitives don't
  // route through the neutral alias chain, so cream default leaves
  // focus-ring unchanged.
  '--nuri-focus-ring': { neutral: { light: '#ae91ff', dark: '#6c58a3' },
                         lilac:   { light: '#ae91ff', dark: '#6c58a3' } },

  // ── Accent foreground · text on ambient bg (NOT on inverse solid) ──
  // neutral uses neutral-12 same-scale (light mode → light scale step 12;
  // dark mode → dark scale step 12). Text contrast against ambient bg.
  // lilac uses lilac-12 (saturated against canvas · unchanged).
  '--nuri-accent-fg': { neutral: { light: '#222013', dark: '#f0eee3' },
                        lilac:   { light: '#381b6a', dark: '#e3ddfa' } },

  // ── Accent solid · INVERSE pattern for neutral · P4 lilac frozen ──
  // neutral · saturated family · uses OPPOSITE scale at step 1 (cream-1):
  //   light mode → cream-1-dark (#12110b)   — inverse surface
  //   dark mode  → cream-1-light (#fffdf2)  — inverse surface
  // lilac · bright family · FROZEN across themes (block 6 omits this).
  '--nuri-accent-solid': { neutral: { light: '#12110b', dark: '#fffdf2' },
                           lilac:   { light: '#beaaff', dark: '#beaaff' } },

  // ── Accent solid pressed · same INVERSE step 3 for neutral · P4 frozen for lilac ──
  '--nuri-accent-solid-pressed': { neutral: { light: '#242319', dark: '#f3f1e2' },
                                   lilac:   { light: '#b39ff3', dark: '#b39ff3' } },

  // ── Accent on-solid · text on inverse solid · INVERSE step 12 for neutral ──
  // light mode → cream-12-dark (#f0eee3, light-coloured text on dark inverse bg)
  // dark mode  → cream-12-light (#222013, dark-coloured text on light inverse bg)
  // lilac · P4 frozen across themes.
  '--nuri-accent-on-solid': { neutral: { light: '#f0eee3', dark: '#222013' },
                              lilac:   { light: '#381b6a', dark: '#381b6a' } },

  // ── Accent bg-subtle · tag/pill bg · mode-swap on BOTH accents ──
  // bg-subtle is NOT in the frozen set even on bright accents.
  '--nuri-accent-bg-subtle': { neutral: { light: '#f3f1e2', dark: '#242319' },
                               lilac:   { light: '#f3f0ff', dark: '#282040' } },

  '--nuri-accent-bg-subtle-pressed': { neutral: { light: '#ece9da', dark: '#2c2a1e' },
                                       lilac:   { light: '#ebe3ff', dark: '#342756' } },

  // ── Semantic spacing · cascade-invariant · same value across (accent × theme) ──
  // Maps to the --nuri-px-N primitive layer (decision 32). T-shirt scale
  // semantic vocabulary landed at N+6.1 (decision 36). The oracle holds
  // raw RHS strings (`'12px'` etc.) — the runtime emitter strips `px`
  // to a JS numeric expression downstream, but the cross-product
  // resolver returns the CSS literal as-is.
  '--nuri-space-none': { neutral: { light: '0', dark: '0' },
                         lilac:   { light: '0', dark: '0' } },
  '--nuri-space-2xs': { neutral: { light: '2px',  dark: '2px'  },
                        lilac:   { light: '2px',  dark: '2px'  } },
  '--nuri-space-xs':  { neutral: { light: '4px',  dark: '4px'  },
                        lilac:   { light: '4px',  dark: '4px'  } },
  '--nuri-space-sm':  { neutral: { light: '6px',  dark: '6px'  },
                        lilac:   { light: '6px',  dark: '6px'  } },
  '--nuri-space-md':  { neutral: { light: '12px', dark: '12px' },
                        lilac:   { light: '12px', dark: '12px' } },
  '--nuri-space-lg':  { neutral: { light: '18px', dark: '18px' },
                        lilac:   { light: '18px', dark: '18px' } },
  '--nuri-space-xl':  { neutral: { light: '24px', dark: '24px' },
                        lilac:   { light: '24px', dark: '24px' } },
  '--nuri-space-2xl': { neutral: { light: '36px', dark: '36px' },
                        lilac:   { light: '36px', dark: '36px' } },

  // ── Semantic sizing · cascade-invariant · same value across (accent × theme) ──
  // Asymmetric vs spacing by design: anchors larger (touch targets,
  // control heights). Decision 36 · N+6.1.
  '--nuri-size-xs':   { neutral: { light: '18px', dark: '18px' },
                        lilac:   { light: '18px', dark: '18px' } },
  '--nuri-size-sm':   { neutral: { light: '24px', dark: '24px' },
                        lilac:   { light: '24px', dark: '24px' } },
  '--nuri-size-md':   { neutral: { light: '36px', dark: '36px' },
                        lilac:   { light: '36px', dark: '36px' } },
  '--nuri-size-lg':   { neutral: { light: '48px', dark: '48px' },
                        lilac:   { light: '48px', dark: '48px' } },
  '--nuri-size-xl':   { neutral: { light: '60px', dark: '60px' },
                        lilac:   { light: '60px', dark: '60px' } },
  '--nuri-size-2xl':  { neutral: { light: '72px', dark: '72px' },
                        lilac:   { light: '72px', dark: '72px' } },
  '--nuri-size-3xl':  { neutral: { light: '90px', dark: '90px' },
                        lilac:   { light: '90px', dark: '90px' } },

  // ── Semantic radius · cascade-invariant · sm/md/lg chain to --nuri-px-N ──
  // 3 leaves chain (sm=px-6, md=px-12, lg=px-18); full is the only
  // semantic dimension leaf without primitive backing — literal 100%
  // for pills + circular shapes. Amendment 36.1 · N+6.1.1.
  '--nuri-radius-sm':   { neutral: { light: '6px',  dark: '6px'  },
                          lilac:   { light: '6px',  dark: '6px'  } },
  '--nuri-radius-md':   { neutral: { light: '12px', dark: '12px' },
                          lilac:   { light: '12px', dark: '12px' } },
  '--nuri-radius-lg':   { neutral: { light: '18px', dark: '18px' },
                          lilac:   { light: '18px', dark: '18px' } },
  '--nuri-radius-full': { neutral: { light: '9999px', dark: '9999px' },
                          lilac:   { light: '9999px', dark: '9999px' } },
};

test('resolveSemanticCrossProduct · every semantic token matches the hand-derived oracle', async () => {
  const primitiveCSS = await readFile(CSS_PATH, 'utf8');
  const semanticCSS  = await readFile(SEMANTIC_CSS_PATH, 'utf8');
  const primitives   = buildPrimitiveMap(primitiveCSS);
  const rules        = readSemanticRules(semanticCSS);
  const resolved     = resolveSemanticCrossProduct(rules, primitives);

  // 1. Oracle ⊆ Parser: every expected token resolves to the oracle value.
  const drift = [];
  for (const [cssVar, expByAccent] of Object.entries(SEMANTIC_EXPECTED)) {
    const got = resolved[cssVar];
    if (!got) {
      drift.push({ cssVar, problem: 'parser produced no entry' });
      continue;
    }
    for (const accent of ACCENTS) {
      for (const theme of THEMES) {
        const exp = expByAccent[accent][theme];
        const val = got[accent][theme];
        if (val !== exp) {
          drift.push({ cssVar, accent, theme, expected: exp, got: val });
        }
      }
    }
  }
  assert.deepEqual(drift, [], `semantic cross-product drift:\n${JSON.stringify(drift, null, 2)}`);

  // 2. Parser ⊆ Oracle: any semantic token the parser emits must be
  // in the oracle — fires when a new semantic token is added and the
  // oracle stops being exhaustive. Forces the test to be re-derived.
  const extras = Object.keys(resolved).filter((v) => !(v in SEMANTIC_EXPECTED));
  assert.deepEqual(extras, [],
    `parser emits semantic tokens not in oracle (add to SEMANTIC_EXPECTED): ${extras.join(', ')}`);
});

test('P4 bright-vs-saturated asymmetry · lilac accent-solid stays frozen across themes', async () => {
  const primitiveCSS = await readFile(CSS_PATH, 'utf8');
  const semanticCSS  = await readFile(SEMANTIC_CSS_PATH, 'utf8');
  const resolved     = resolveSemanticCrossProduct(
    readSemanticRules(semanticCSS),
    buildPrimitiveMap(primitiveCSS),
  );

  // The frozen-across-theme contract for the bright family (P4 ·
  // see pages/principles.html and decisionlog.md decision 9 background).
  // Block 6 of tokens-semantic.css intentionally omits these — the
  // brand stays the brand under theme switch.
  for (const cssVar of ['--nuri-accent-solid', '--nuri-accent-solid-pressed', '--nuri-accent-on-solid']) {
    assert.equal(
      resolved[cssVar].lilac.light,
      resolved[cssVar].lilac.dark,
      `${cssVar} should be FROZEN on lilac (bright family) across light/dark`,
    );
  }

  // And the contrast: neutral (saturated family) swaps per theme.
  // If both light and dark match, somebody accidentally introduced a
  // frozen value in the neutral cascade.
  for (const cssVar of ['--nuri-accent-solid', '--nuri-accent-solid-pressed', '--nuri-accent-on-solid']) {
    assert.notEqual(
      resolved[cssVar].neutral.light,
      resolved[cssVar].neutral.dark,
      `${cssVar} should SWAP on neutral (saturated family) across light/dark`,
    );
  }

  // accent-bg-subtle is NOT in the frozen set even on lilac — confirms
  // the partial-redeclare pattern in block 6 is read correctly.
  assert.notEqual(
    resolved['--nuri-accent-bg-subtle'].lilac.light,
    resolved['--nuri-accent-bg-subtle'].lilac.dark,
    'accent-bg-subtle on lilac should swap (block 6 redeclares it)',
  );
});

test('selectorMatches · cascade specificity port from lib/docs/tokens.js', () => {
  // :root always matches with spec=1.
  assert.deepEqual(selectorMatches(':root', 'neutral', 'light'), { matches: true, spec: 1 });
  assert.deepEqual(selectorMatches(':root', 'lilac', 'dark'),    { matches: true, spec: 1 });

  // Single-attr blocks · spec=1, only when the attr matches.
  assert.equal(selectorMatches('[data-theme="dark"]', 'neutral', 'dark').matches, true);
  assert.equal(selectorMatches('[data-theme="dark"]', 'neutral', 'light').matches, false);
  assert.equal(selectorMatches('[data-accent="lilac"]', 'lilac', 'light').matches, true);
  assert.equal(selectorMatches('[data-accent="lilac"]', 'neutral', 'light').matches, false);

  // Combined-attr blocks · spec=2.
  const combo = selectorMatches('[data-accent="lilac"][data-theme="dark"]', 'lilac', 'dark');
  assert.deepEqual(combo, { matches: true, spec: 2 });
  assert.equal(selectorMatches('[data-accent="lilac"][data-theme="dark"]', 'lilac', 'light').matches, false);
});

test('resolveValue · walks var() chains through the primitive map', () => {
  const primitives = new Map([
    ['--nuri-color-gray-1-light',    '#fcfcfc'],
    ['--nuri-color-neutral-1-light', 'var(--nuri-color-gray-1-light)'],
  ]);
  assert.equal(resolveValue('var(--nuri-color-neutral-1-light)', primitives), '#fcfcfc');
  assert.equal(resolveValue('var(--nuri-color-gray-1-light)',    primitives), '#fcfcfc');
  assert.equal(resolveValue('#abcdef',                            primitives), '#abcdef');
  assert.equal(resolveValue('var(--unknown-token)',               primitives), null);
});

test('generated build/tokens.ts emits one nested export per runtime-classified group', async () => {
  // Drop-in contract narrowed to grep-only (N+5.5; tightened at
  // N+6.0.3 · decision 34): the emitter is responsible for one
  // nested-object export per non-empty cascade-classified runtime
  // group. `buttonBase` left tokens.ts at N+6.0.3 — its per-component
  // numerics were emitted to build/components/<name>.ts, now RETIRED
  // (Smell-1 · decision 66 arc #0). Either way tokens.ts must stay
  // runtime-only; if the orchestrator regresses to flat per-var exports
  // OR brings the BUTTON_BASE constants block back, this fires.
  const ts = await readFile(TS_PATH, 'utf8');
  for (const name of [
    'export type Accent',
    'export type Theme',
    'export const chrome:',
    'export const accent:',
  ]) {
    assert.ok(ts.includes(name), `tokens.ts missing required export: ${name}`);
  }
  // Negative: the pre-N+5.5 flat exports must NOT come back. Catches
  // an accidental re-introduction of hardcoded per-var lists.
  for (const flat of [
    'export const accentFg',
    'export const accentSolid',
    'export const accentSolidPressed',
    'export const accentOnSolid',
    'export const accentBgSubtle',
    'export const accentBgSubtlePressed',
  ]) {
    assert.ok(!ts.includes(flat),
      `tokens.ts re-introduced flat export ${flat} — the N+5.5 refactor collapsed ` +
      `accent-keyed tokens into a single nested 'accent' export. Re-derive against ` +
      `pipeline/parsers/semantic.js#emitTokensTs.`);
  }
  // Negative: buttonBase migrated out of tokens.ts at N+6.0.3 (its
  // per-component numerics were emitted to build/components/, retired at
  // Smell-1 · decision 66 arc #0). tokens.ts must stay runtime-only.
  assert.ok(!ts.includes('export const buttonBase'),
    `tokens.ts re-introduced 'export const buttonBase' — tokens.ts carries ` +
    `ONLY runtime sets (decision 34). The BUTTON_BASE constants block must not ` +
    `come back inside semantic.js#emitTokensTs.`);
});

test('every semantic var classifies to a GROUP_NAMES signature and lands in tokens.ts', async () => {
  // Replaces the pre-N+5.5 "disjoint union of two hardcoded lists"
  // invariant. New invariant: classify-by-cascade catches the same
  // silent-drop class without a hand-maintained export list — every
  // declared var classifies to a known signature, and the emitter
  // honours that classification by rendering the var's leaf under
  // its group's export.
  const semanticCSS = await readFile(SEMANTIC_CSS_PATH, 'utf8');
  const rules = readSemanticRules(semanticCSS);
  const declared = collectSemanticVars(rules);

  // 1. Every declared var classifies to a known signature (otherwise
  // classifyAll would throw — capture that here as a clean assertion).
  let groups;
  try {
    groups = classifyAll(rules);
  } catch (err) {
    assert.fail(`classifyAll threw: ${err.message}`);
  }

  // 2. Every declared var appears in exactly one group's entries.
  const seen = new Map(); // cssVar → groupName
  for (const [groupName, group] of groups) {
    for (const { cssVar } of group.entries) {
      assert.ok(!seen.has(cssVar),
        `${cssVar} appears in two groups: ${seen.get(cssVar)} and ${groupName}`);
      seen.set(cssVar, groupName);
    }
  }
  const missing = declared.filter((v) => !seen.has(v));
  assert.deepEqual(missing, [],
    `semantic vars declared in CSS but not in any group:\n  ${missing.join('\n  ')}`);

  // 3. Every var's expected leaf renders into tokens.ts under its
  // group's export. Closes the gap between "the classifier sees it"
  // and "the emitter writes it".
  const ts = await readFile(TS_PATH, 'utf8');
  const missingEmit = [];
  for (const [groupName, group] of groups) {
    if (!new RegExp(`export const ${groupName}:`).test(ts)) {
      missingEmit.push(`group '${groupName}' missing top-level export`);
      continue;
    }
    for (const { cssVar, leafName } of group.entries) {
      // T-shirt scale leaves like '2xs' / '2xl' / '3xl' start with a
      // digit and emit as quoted keys (`'2xs': 2,`); alphabetic leaves
      // emit bare (`md: 12,`). Values can be quoted strings (colour
      // groups) or unquoted numbers (space / size dimensions ·
      // decision 36 · N+6.1). Accept either key + either value shape.
      const escaped = leafName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const keyPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(leafName)
        ? `\\b${escaped}`
        : `'${escaped}'`;
      if (!new RegExp(`${keyPattern}:\\s+('|-?\\d)`).test(ts)) {
        missingEmit.push(`group '${groupName}' leaf '${leafName}' (from ${cssVar}) not rendered`);
      }
    }
  }
  assert.deepEqual(missingEmit, [],
    `classifier-known leaves not rendered into tokens.ts:\n  ${missingEmit.join('\n  ')}`);
});

test('naming-vs-cascade agreement · accent-* vars classify [accent, theme] and vice versa', async () => {
  // The drift class hardcoded lists previously allowed: a var named
  // --nuri-accent-something gets added to tokens-semantic.css under
  // a chrome-only block (or vice versa) and the export list stays
  // out of sync with the cascade silently. Classify-by-cascade
  // surfaces it; this test pins it down explicitly.
  const semanticCSS = await readFile(SEMANTIC_CSS_PATH, 'utf8');
  const rules = readSemanticRules(semanticCSS);

  for (const cssVar of collectSemanticVars(rules)) {
    const dims = classifySemantic(cssVar, rules);
    const sig = dims.join(',');
    const namedAccent = cssVar.startsWith('--nuri-accent-');
    const classifiedAccent = sig === 'accent,theme';
    assert.equal(namedAccent, classifiedAccent,
      `${cssVar} naming/cascade disagree: name says ${namedAccent ? 'accent' : 'NOT accent'}, ` +
      `cascade classifies [${sig}] (${classifiedAccent ? 'accent group' : 'other group'})`);
  }
});

test('GROUP_NAMES is exhaustive · every signature classifySemantic produces is mapped', async () => {
  // Adds a fail-loud guardrail for "future contributor extends the
  // cascade with a new dimension block but forgets to declare what
  // its group is called". classifyAll throws on unmapped signature,
  // but this test calls the lower-level classifySemantic directly so
  // the failure is named more specifically.
  const semanticCSS = await readFile(SEMANTIC_CSS_PATH, 'utf8');
  const rules = readSemanticRules(semanticCSS);
  const unmapped = new Set();
  for (const cssVar of collectSemanticVars(rules)) {
    const sig = classifySemantic(cssVar, rules).join(',');
    if (!(sig in GROUP_NAMES)) unmapped.add(`${sig} (e.g. ${cssVar})`);
  }
  assert.deepEqual([...unmapped], [],
    `signatures produced by the classifier without a GROUP_NAMES entry:\n  ${[...unmapped].join('\n  ')}\n` +
    `Add each to GROUP_NAMES in pipeline/parsers/semantic.js with a group name + cssPrefix.`);
});


// ──────────────────────────────────────────────────────────────
// N+6.0.3 · set-policy mechanism (decision 34)
// SET_POLICY is the central registry of which sets are runtime
// (appear in tokens.ts + TokenPath union) vs pipeline-inlined
// (resolved to literals at build time inside per-component files).
// The auto-rule forces cascade-varying sets to runtime; explicit
// flags must be set on context-invariant sets; orphan / missing
// entries throw to force a conscious policy pick. This test
// exercises the three throw modes directly so any future change
// to the policy enforcement keeps the failure modes named.
// ──────────────────────────────────────────────────────────────
test('SET_POLICY mechanism · auto-rule + orphan + missing-entry checks throw', () => {
  // 1. Orphan: an entry with neither runtime nor pipelineInline true.
  assert.throws(
    () => resolveSetPolicy('test.orphan', false, {
      'test.orphan': { runtime: false, pipelineInline: false },
    }),
    /orphan/,
    'resolveSetPolicy should throw on a non-cascade-varying set with neither flag true',
  );
  assert.throws(
    () => resolveSetPolicy('test.empty', false, { 'test.empty': {} }),
    /orphan/,
    'resolveSetPolicy should throw on an empty entry for a non-cascade-varying set ' +
    '(empty {} is reserved for cascade-varying sets which auto-force runtime)',
  );

  // 2. Auto-rule violation: cascade-varying with runtime:false.
  assert.throws(
    () => resolveSetPolicy('test.bad', true, {
      'test.bad': { runtime: false, pipelineInline: true },
    }),
    /auto-rule violation/,
    'resolveSetPolicy should throw when a cascade-varying set declares runtime: false',
  );
  // Auto-rule violation: cascade-varying with pipelineInline:true.
  assert.throws(
    () => resolveSetPolicy('test.bad2', true, {
      'test.bad2': { runtime: true, pipelineInline: true },
    }),
    /auto-rule violation/,
    'resolveSetPolicy should throw when a cascade-varying set declares pipelineInline: true',
  );

  // 3. Missing entry: no SET_POLICY key for an existing namespace.
  assert.throws(
    () => resolveSetPolicy('test.unknown', false, {}),
    /no SET_POLICY entry/,
    'resolveSetPolicy should throw when the registry has no entry for the set',
  );

  // 4. Happy paths (no throw, returns merged policy).
  assert.deepEqual(
    resolveSetPolicy('test.ok', false, { 'test.ok': { runtime: true, pipelineInline: false } }),
    { cascadeVarying: false, runtime: true, pipelineInline: false },
  );
  assert.deepEqual(
    resolveSetPolicy('test.inline', false, { 'test.inline': { runtime: false, pipelineInline: true } }),
    { cascadeVarying: false, runtime: false, pipelineInline: true },
  );
  assert.deepEqual(
    resolveSetPolicy('test.auto', true, { 'test.auto': {} }),
    { cascadeVarying: true, runtime: true, pipelineInline: false },
  );

  // 5. Live SET_POLICY covers every set currently in use.
  for (const setKey of ['semantic.chrome', 'semantic.accent']) {
    assert.ok(SET_POLICY[setKey] != null, `live SET_POLICY missing entry for ${setKey}`);
  }
  // primitiveSetFor returns the canonical primitive set for known prefixes;
  // the policy must cover each of those sets so the component walker can
  // dispatch without throwing on legitimate references.
  for (const cssVar of [
    // --nuri-radius-{sm,md,lg} moved to the semantic layer at N+6.1.1
    // (amendment 36.1); cite --nuri-radius-xl which stays primitive.
    '--nuri-px-60', '--nuri-radius-xl', '--nuri-type-md-size',
    '--nuri-font-weight-semibold', '--nuri-duration-fast', '--nuri-color-cream-1-light',
  ]) {
    const setKey = primitiveSetFor(cssVar);
    assert.ok(setKey, `primitiveSetFor returned null for ${cssVar}`);
    assert.ok(SET_POLICY[setKey] != null, `live SET_POLICY missing entry for ${setKey} (from ${cssVar})`);
  }
});


// ──────────────────────────────────────────────────────────────
// N+6.0.3 · per-component @layer tokens resolve (decision 34)
// Every component CSS file's `@layer tokens` block resolves per the
// SET_POLICY: literal values for references through pipeline-inlined
// primitive sets, TokenPath strings for runtime-set references. The
// per-component FILE emission (build/components/<name>.ts) was RETIRED
// at Smell-1 (decision 66 arc #0); the resolver (resolveComponentValue)
// is unchanged, so the CSS-resolution contract is still pinned here on a
// fresh parse. The TokenPath union at build/token-paths.ts derives from
// every runtime-set leaf (the semantic cascade · independent of this walk).
// ──────────────────────────────────────────────────────────────
test('per-component resolve · resolveComponentValue dispatch (button) + token-paths.ts covers runtime leaves', async () => {
  // 1. token-paths.ts union covers every runtime-set leaf.
  const tokenPaths = await readFile(TOKEN_PATHS_PATH, 'utf8');
  const semanticCSS = await readFile(SEMANTIC_CSS_PATH, 'utf8');
  const groups = classifyAll(readSemanticRules(semanticCSS));
  const expectedPathStrings = [];
  for (const [groupName, group] of groups) {
    if (!group.policy.runtime) continue;
    for (const { leafName } of group.entries) {
      expectedPathStrings.push(`'${groupName}.${leafName}'`);
    }
  }
  for (const s of expectedPathStrings) {
    assert.ok(tokenPaths.includes(s),
      `token-paths.ts missing union member ${s}`);
  }
  // The union must start with `export type TokenPath =`; any other
  // shape (e.g., `export type TokenPath = never`) means no runtime
  // groups were emitted, which is a regression today.
  assert.match(tokenPaths, /export type TokenPath =\s*\n\s*\|\s+'/,
    `token-paths.ts should declare a non-empty discriminated union ` +
    `(found header but no union members)`);

  // 2. resolveComponentValue dispatches correctly across its KINDS. Button's recipe
  // @layer tokens (the rich exerciser) RETIRED with the recipe CSS at the L3c flip
  // (decision 74), and no active component carries @layer tokens decls anymore (all
  // empty · resolveComponentValue + emitComponentTs are now an unexercised tail · the
  // dead-code cleanup deferred · the Smell-1.1 family). So pin the resolver's
  // CSS-resolution contract on a SYNTHETIC decl set mirroring the retired button.css
  // aliases — the values resolve against the LIVE token CSS (ctx · primitives + the
  // classified semantic groups), not a recipe file. Covers every dispatch KIND:
  // tokenPath via size / radius / accent / chrome, and literal via transparent / the
  // interaction-baseline numeric (the SAME resolution build/interaction.ts reads
  // transversally). Per-size metrics dereference the runtime dimension layer (size ·
  // decision 36) + radius vocab (amendment 36.1); the asymmetric radius coupling
  // (decision 41) — lg uses radius.md, md/sm use radius.sm.
  const primitiveCss = await readFile(CSS_PATH, 'utf8');
  const ctx = { primitives: buildPrimitiveMap(primitiveCss), classifiedGroups: groups };
  const rcv = (cssVar, value) => resolveComponentValue(cssVar, value, ctx);
  assert.deepEqual(rcv('--nuri-button-lg-min-height', 'var(--nuri-size-xl)'), { kind: 'tokenPath', path: 'size.xl' });
  assert.deepEqual(rcv('--nuri-button-md-min-height', 'var(--nuri-size-lg)'), { kind: 'tokenPath', path: 'size.lg' });
  assert.deepEqual(rcv('--nuri-button-sm-min-height', 'var(--nuri-size-md)'), { kind: 'tokenPath', path: 'size.md' });
  assert.deepEqual(rcv('--nuri-button-lg-radius', 'var(--nuri-radius-md)'), { kind: 'tokenPath', path: 'radius.md' });
  assert.deepEqual(rcv('--nuri-button-md-radius', 'var(--nuri-radius-sm)'), { kind: 'tokenPath', path: 'radius.sm' });
  assert.deepEqual(rcv('--nuri-button-solid-bg', 'var(--nuri-accent-solid)'), { kind: 'tokenPath', path: 'accent.solid' });
  assert.deepEqual(rcv('--nuri-button-soft-bg', 'var(--nuri-bg-strong)'), { kind: 'tokenPath', path: 'chrome.bgStrong' });
  // Ghost (decision 39): transparent at rest is a pure literal; the pressed wash → chrome.bgSubtle.
  assert.deepEqual(rcv('--nuri-button-ghost-bg', 'transparent'), { kind: 'literal', expression: "'transparent'" });
  assert.deepEqual(rcv('--nuri-button-ghost-bg-pressed', 'var(--nuri-bg-subtle)'), { kind: 'tokenPath', path: 'chrome.bgSubtle' });
  assert.deepEqual(rcv('--nuri-button-press-scale', 'var(--nuri-interaction-press-scale)'), { kind: 'literal', expression: '0.97' });

  // (IconButton · TabBar fresh-parse dispatch sub-tests removed at N+36 —
  // both components were quarantined to legacy. Button above already
  // exercises every resolveComponentValue dispatch KIND: tokenPath via
  // size / radius / accent / chrome, and literal via transparent / the
  // interaction-baseline numeric. The archived recipes carry no active
  // test coverage by design — see roadmap/N+36-legacy-archive.md.)
});


// ──────────────────────────────────────────────────────────────
// Smell-1 · transversal interaction baseline (decision 66 arc #0 · decision 45)
// The decision-45 cross-component constants (pressScale · disabledOpacity)
// now ship as their OWN transversal emit at build/interaction.ts — read from
// the --nuri-interaction-* primitive family — instead of being pipeline-
// inlined into per-component files (build/components/*, retired). The factory's
// INTERACTION_BASELINE reads this directly. Single-source guard: re-derive from
// the primitives, and the on-disk emit must re-emit identically (a hand-edit or
// a stale build both fail here · decision 35).
// ──────────────────────────────────────────────────────────────
test('build/interaction.ts carries the relocated interaction baseline (0.97 / 0.4) and re-emits from the --nuri-interaction-* primitives', async () => {
  const primitiveCss = await readFile(CSS_PATH, 'utf8');
  const map = buildPrimitiveMap(primitiveCss);

  // 1. The two constants re-derive from the primitive map (NOT hardcoded).
  const interaction = buildInteraction(map);
  assert.deepEqual(
    Object.keys(interaction).sort(),
    Object.keys(INTERACTION_PRIMITIVES).sort(),
    'buildInteraction must cover exactly the --nuri-interaction-* family',
  );
  assert.equal(interaction.pressScale, '0.97',
    'pressScale must re-derive from --nuri-interaction-press-scale');
  assert.equal(interaction.disabledOpacity, '0.4',
    'disabledOpacity must re-derive from --nuri-interaction-disabled-opacity');

  // 2. The on-disk emit carries the relocated literals AND re-emits
  //    identically (decision 35 · stale-build / hand-edit guard).
  const onDisk = await readFile(INTERACTION_TS_PATH, 'utf8');
  assert.match(onDisk, /export const interaction = \{/,
    'interaction.ts must export an `interaction` const');
  assert.match(onDisk, /\bpressScale:\s+0\.97\b/,
    'interaction.ts must carry the relocated pressScale: 0.97 (decision 45)');
  assert.match(onDisk, /\bdisabledOpacity:\s+0\.4\b/,
    'interaction.ts must carry the relocated disabledOpacity: 0.4 (decision 45)');
  assert.match(onDisk, /\} as const;/,
    'interaction.ts must close `as const` (the directly-accessed shape)');
  assert.equal(
    onDisk, emitInteractionTs(interaction),
    'build/interaction.ts is out of sync with the --nuri-interaction-* primitives — run `npm run build`',
  );

  // 3. The retired per-component file is gone (Smell-1 · decision 66 arc #0):
  //    build/components/button.ts no longer exists — its lone live value
  //    (the interaction baseline) lives here now.
  await assert.rejects(
    access(resolve(REPO_ROOT, 'build/components/button.ts')),
    'build/components/button.ts must be deleted — the interaction baseline relocated to build/interaction.ts',
  );
});


// ──────────────────────────────────────────────────────────────
// N+51 · icon registry · the SVG folder is the SoT (decision 38/48)
// The icon SoT is the folder icons/*.svg (one drawing per glyph · NO
// weights · N+51). readIcons(folder) builds the ICONS registry; the
// orchestrator emits BOTH readers from it — lib/components/icon/icons.js
// (web · zero-build inline) + build/icons.ts (RN · SvgXml). This is the
// folder → registry ROUND-TRIP guard: both committed readers must re-emit
// identically from the folder, so a hand-edit to either reader (forbidden ·
// decision 35), a stale build, or a malformed source SVG all fail here.
// ──────────────────────────────────────────────────────────────
test('both icon readers re-emit identically from the icons/*.svg folder (folder → registry round-trip · single-source guard)', async () => {
  // 1. Read the SoT folder → the ICONS registry. Each value is one glyph's
  //    inner markup (no weight inner-map) with every fill normalized to
  //    currentColor (decision 38 · the sole colour story).
  const icons = await readIcons(ICONS_DIR);
  const names = Object.keys(icons);
  assert.ok(names.length > 0, 'the icons/ folder must hold at least one .svg');
  for (const name of names) {
    const markup = icons[name];
    assert.equal(typeof markup, 'string', `icon '${name}' must be a single markup string (no weight map)`);
    assert.match(markup, /^<path\b/, `icon '${name}' markup must start with a <path> element`);
    // Every fill is currentColor — no hardcoded source colour leaks through.
    assert.ok(!/fill="(?!currentColor)[^"]*"/.test(markup),
      `icon '${name}' has a non-currentColor fill — the normalizer must rewrite every fill`);
    assert.ok(markup.includes('fill="currentColor"'),
      `icon '${name}' must carry fill="currentColor"`);
  }

  // 2. The on-disk RN reader re-emits identically from the folder — the drift
  //    guard. A manual edit to build/icons.ts or a stale build both fail.
  const tsOnDisk = await readFile(ICONS_TS_PATH, 'utf8');
  assert.equal(
    tsOnDisk, emitIconsTs(icons),
    'build/icons.ts is out of sync with icons/*.svg — run `npm run build`',
  );

  // 3. The on-disk WEB reader (the GENERATED lib/components/icon/icons.js) also
  //    re-emits identically — it is a build output too, never hand-edited.
  const jsOnDisk = await readFile(ICONS_JS_PATH, 'utf8');
  assert.equal(
    jsOnDisk, emitIconsJs(icons),
    'lib/components/icon/icons.js is out of sync with icons/*.svg — run `npm run build`',
  );

  // 4. Belt-and-suspenders: every glyph's markup appears in both emitted
  //    readers (catches an emitter that dropped a glyph without changing
  //    the byte count enough to trip the equality above).
  for (const name of names) {
    assert.ok(tsOnDisk.includes(JSON.stringify(icons[name])), `build/icons.ts missing markup for ${name}`);
    assert.ok(jsOnDisk.includes(JSON.stringify(icons[name])), `icons.js missing markup for ${name}`);
  }

  // 5. The typed surface is present: the IconName union + the reshaped
  //    Record<IconName, string> (one markup per glyph · no weight inner-map).
  assert.match(tsOnDisk, /export type IconName =/, 'icons.ts missing IconName union');
  assert.match(tsOnDisk, /export const icons: Record<IconName, string> = \{/,
    'icons.ts missing the reshaped Record<IconName, string> registry');
  // The retired weight vocabulary must NOT come back (decision 38 · N+51).
  assert.ok(!tsOnDisk.includes('IconWeight'),
    'icons.ts re-introduced IconWeight — the regular/bold/fill weight triple was retired at N+51');
});

// ──────────────────────────────────────────────────────────────
// N+8.3 · emitted type scale (decision 54 · DE-FUSED N+45 · decision 77)
// The `type` namespace in build/tokens.ts is a typed, directly-accessed
// composite emitted from the --nuri-type-* primitives — the SAME source the
// web reads through styles/typography.css. One source, two readers (the icon
// model · decision 48). DE-FUSED at N+45: `type` is the 6 SIZE composites
// (regular weight); `emphasis` is an ORTHOGONAL single weight override
// (emphasisWeight · uniform 400→600 · P11), NOT a per-size `${step}Em` twin.
// This is the single-source guard: every emitted value re-derives from the
// source primitives, and the on-disk emit re-emits identically. A hand-edit to
// tokens.ts or a stale build fails here.
// ──────────────────────────────────────────────────────────────
test('type scale covers every size + the orthogonal emphasisWeight, each re-deriving from the --nuri-type-* source (single-source guard · decision 77)', async () => {
  const css = await readFile(CSS_PATH, 'utf8');
  const map = buildPrimitiveMap(css);
  const scale = buildTypeScale(map);

  // 1. Coverage: the 6 size composites + the single emphasis override (decision 77).
  assert.deepEqual(
    Object.keys(scale.sizes).sort(), [...TYPE_SIZES].sort(),
    `type scale must cover every size composite: ${TYPE_SIZES.join(', ')}`,
  );
  assert.ok(scale.emphasisWeight != null, 'type scale must carry the orthogonal emphasisWeight override');

  // 2. Single-source guard · INDEPENDENT re-derivation. The test owns its own
  //    conversion (NOT the emitter's helpers) so a bug in buildTypeScale can't
  //    hide. fontSize = rem×16; lineHeight and letterSpacing stay RELATIVE (the
  //    unitless ratio · the em number, verbatim — the × fontSize relative→absolute
  //    conversion lives in typeStyle · decision 54); fontWeight = the resolved
  //    REGULAR weight literal. EMPHASIS is orthogonal — re-derived once below.
  const round3 = (n) => Math.round(n * 1000) / 1000;
  const toPx = (raw) =>
    raw.endsWith('rem') ? round3(Number(raw.slice(0, -3)) * 16)
    : raw.endsWith('px') ? round3(Number(raw.slice(0, -2)))
    : round3(Number(raw));
  const toEm = (raw) =>
    round3(raw.endsWith('em') ? Number(raw.slice(0, -2)) : Number(raw));

  for (const step of TYPE_SIZES) {
    const fontSize = toPx(resolveValue(map.get(`--nuri-type-${step}-size`), map));
    const lineHeight = round3(Number(resolveValue(map.get(`--nuri-type-${step}-line-height`), map)));
    const letterSpacing = toEm(resolveValue(map.get(`--nuri-type-${step}-tracking`), map));
    const weight = resolveValue(map.get(`--nuri-type-${step}-weight`), map);

    assert.deepEqual(scale.sizes[step],
      { fontSize, lineHeight, fontWeight: weight, letterSpacing },
      `type.${step} drifted from the --nuri-type-${step}-* primitives`);
  }
  // The emphasis override is the semibold weight, uniform across every size
  // (decision 77 · operator-locked) — re-derived from --nuri-font-weight-semibold.
  assert.equal(
    scale.emphasisWeight, resolveValue(map.get('--nuri-font-weight-semibold'), map),
    'emphasisWeight drifted from --nuri-font-weight-semibold',
  );

  // 3. The on-disk emit re-emits identically from the source — the drift guard.
  //    A manual edit to build/tokens.ts (forbidden · decision 35) or a stale build
  //    both fail here.
  const onDisk = await readFile(TS_PATH, 'utf8');
  assert.ok(
    onDisk.includes(emitTypeTs(scale)),
    'build/tokens.ts type block is out of sync with the --nuri-type-* primitives — run `npm run build`',
  );

  // 4. The typed surface is present: the TypeSize / TypeWeight / TypeStep aliases,
  //    the 6-size `type` namespace, and the orthogonal `emphasisWeight` override.
  assert.match(onDisk, /export type TypeSize =/, 'tokens.ts missing TypeSize union');
  assert.match(onDisk, /export type TypeWeight =/, 'tokens.ts missing TypeWeight alias');
  assert.match(onDisk, /export type TypeStep = \{/, 'tokens.ts missing TypeStep shape');
  assert.match(onDisk,
    /export const type: Record<TypeSize, TypeStep> = \{/,
    'tokens.ts missing the de-fused 6-size type namespace (decision 77)');
  assert.match(onDisk,
    /export const emphasisWeight: TypeWeight = '\d+';/,
    'tokens.ts missing the orthogonal emphasisWeight override (decision 77)');
});

// ──────────────────────────────────────────────────────────────
// N+5.7 · Primitive-layer guardrail
// Every --nuri-* declared in tokens-primitive.css must be either
// (a) referenced via var() outside that file, possibly through an
//     alias chain declared inside the primitive layer, or
// (b) explicitly speculative-reserved by name / scale below.
// Catches "primitive drift" — orphan declarations that accumulate
// across sessions and then get codified by docs they never earn.
// ──────────────────────────────────────────────────────────────
test('every primitive token is consumed or explicitly reserved', async () => {
  // Color scales held on the primitive layer with only partial direct
  // var() consumption today. Each entry needs a one-line justification.
  const RESERVED_COLOR_SCALES = new Set([
    // The --nuri-color-neutral-* alias family · the build-time neutral
    // resolution (N+32 C1 · decision 31). One :root block resolves
    // neutral-N → the ACTIVE scale (DEFAULT_NEUTRAL = cream). Marking
    // 'neutral' as reserved unlocks the alias closure for the active
    // scale (cream-N reached through the neutral alias edges) — see
    // step 3 below.
    'neutral',
    // The 7 candidate neutral Radix scales. cream is the active default;
    // the other six are build-time --neutral=<scale> options. The runtime
    // [data-neutral] switcher was RETIRED at N+32 C1 (the 8 per-scale alias
    // blocks collapsed to one :root resolution), so only the ACTIVE scale
    // is reachable via the neutral alias closure — the rest are
    // unconsumed-but-reserved (a full Radix scale ships even when a step
    // has no var() consumer · P11). 'gray' joined here when the switcher
    // retired (it was reachable only through the old gray alias block).
    'gray', 'mauve', 'slate', 'sage', 'olive', 'sand', 'cream',
    // Brand scale · ships in full per Radix; semantic layer consumes
    // a subset directly (3, 4, 8, 9, 10, 12), the remaining steps
    // cover future accent expansion.
    'lilac',
    // Alpha overlays · ship in full per Radix. shell.css consumes
    // alpha-2 (both) and alpha-5 (black); other steps are reserved
    // for future overlay / divider / glass surfaces.
    'black-alpha', 'white-alpha',
  ]);

  // Individual non-color primitives kept whole as part of a complete
  // scale family even when a given step has no var() consumer today.
  // Each entry needs a one-line justification.
  const RESERVED_TOKENS = new Set([
    // N+6.0 retired the --nuri-size-{0..12} indexed scale; the
    // direct-pixel scale (--nuri-px-N) ships exactly the values
    // currently consumed, so no spacing/dimension primitives are
    // reserved today. Decision 32.
    // radius family kept as the canonical vocabulary
    // (none / xs / sm / md / lg / xl / 2xl / full).
    '--nuri-radius-none', '--nuri-radius-xl', '--nuri-radius-2xl',
    // border-N family kept whole (0 / 1 / 2 / 4).
    '--nuri-border-0', '--nuri-border-2', '--nuri-border-4',
    // display family points at the system stack today; held distinct
    // from -sans so a future display face can land without renaming.
    '--nuri-font-family-display',
    // Duration triplet (fast / med / slow). shell.css uses only fast;
    // med + slow are reserved for component transitions.
    '--nuri-duration-med', '--nuri-duration-slow',
  ]);

  // 1. Parse every primitive declaration AND alias edge in tokens-primitive.css.
  const css = await readFile(CSS_PATH, 'utf8');
  const root = postcss.parse(css);
  const primitives = [];
  const aliasEdges = [];
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--nuri-')) return;
    primitives.push({ name: decl.prop, line: decl.source?.start?.line ?? 0 });
    const m = decl.value.trim().match(/^var\((--nuri-[a-z0-9-]+)\)$/);
    if (m) aliasEdges.push({ from: decl.prop, to: m[1] });
  });

  // 2. Walk the repo and collect every var(--nuri-*) reference outside
  //    the primitive file. Tokens consumed via fallback syntax
  //    `var(--name, default)` count too — the regex captures up to the
  //    name only, not the closing `)`, so the comma form matches.
  const IGNORE_DIRS = new Set([
    'node_modules', '.git', 'uploads', 'playground',
  ]);
  const KEEP_EXT = /\.(css|html|js|ts|tsx|jsx|md|json|svg)$/;
  async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const p = join(dir, entry.name);
      if (entry.isDirectory()) yield* walk(p);
      else if (KEEP_EXT.test(entry.name)) yield p;
    }
  }
  const directlyConsumed = new Set();
  for await (const file of walk(REPO_ROOT)) {
    if (file === CSS_PATH) continue;
    const text = await readFile(file, 'utf8');
    for (const m of text.matchAll(/var\((--nuri-[a-z0-9-]+)/g)) {
      directlyConsumed.add(m[1]);
    }
  }

  // 3. Seed the reachability set with directly-consumed AND reserved
  //    primitives, then take the transitive closure through alias
  //    edges. Reservations participate in the closure so an unused
  //    --nuri-color-neutral-5-* alias (reserved as part of the
  //    'neutral' family) propagates reachability to gray-5-* /
  //    mauve-5-* / … through the data-neutral alias blocks.
  const isReserved = (name) => {
    if (RESERVED_TOKENS.has(name)) return true;
    const m = name.match(/^--nuri-color-(.+?)-\d+(?:-(?:light|dark))?$/);
    return !!(m && RESERVED_COLOR_SCALES.has(m[1]));
  };
  const reachable = new Set(directlyConsumed);
  for (const { name } of primitives) {
    if (isReserved(name)) reachable.add(name);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const { from, to } of aliasEdges) {
      if (reachable.has(from) && !reachable.has(to)) {
        reachable.add(to);
        changed = true;
      }
    }
  }

  // 4. Bucket each primitive declaration.
  const violations = primitives
    .filter(({ name }) => !reachable.has(name))
    .map(({ name, line }) => `${name} (line ${line})`);

  assert.deepEqual(violations, [],
    `primitive tokens neither consumed nor reserved — either add a ` +
    `var() consumer, extend RESERVED_COLOR_SCALES / RESERVED_TOKENS ` +
    `with a one-line justification, or delete the declaration:\n  ` +
    violations.join('\n  '));
});
