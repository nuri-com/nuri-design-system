/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · SEMANTIC CASCADE CSS EMIT (N+32 C2 · decision 70 · the cascade)
 * ──────────────────────────────────────────────────────────────────
 * The TS semantic matrix (packages/spec/tokens/colours.ts · chrome + accent) → the accent×theme
 * cascade in styles/tokens-semantic.css. decision 2 is REVERSED for the colour
 * SEMANTIC layer (after the primitives at C1): the cascade is WRITTEN INTO the CSS,
 * not read out of it. After this the inversion is COMPLETE for colour.
 *
 * This is NOT the C1 passthrough — it is the genuinely-TEMPLATED emit. No stock
 * token tool emits the decision-63 #4b/#6b self-scope (the descendant-combinator
 * dark blocks that beat block 3/5 on specificity so a self-scoped accent inside a
 * dark ANCESTOR resolves dark). We reproduce the whole cascade — 5 fixed neutral
 * blocks (1 · 2 · 3 · 4 · 4b) + 3 blocks per non-neutral accent (lilac → 5/6/6b ·
 * orange → 7/8/8b · N+56 · loop the accent data) — from the matrix. The emit is NOT
 * byte-identical to the prior hand cascade (it is regenerated · terser comments);
 * the gate is structural + computed-style equivalence + a byte-identical RN
 * tokens.ts (the resolved matrix is unchanged · scripts/colour-semantic.test.js).
 *
 * ── The cascade, as the inverse of the parser ───────────────────────
 * parsers/semantic.js#findWinningDecl RESOLVES the cascade (cross-product →
 * winning value). This SPELLS it: given the matrix, emit the minimal set of blocks
 * whose winning declaration per (token, accent, theme) is the matrix value.
 *   · chrome (theme-only)  · block 1 (light) + block 2 (dark).
 *   · accent neutral       · 1/2 (the default scope) + 3 (explicit light) +
 *                            4 (combined dark) + 4b (self-scoped dark · dec-63).
 *   · each non-neutral     · light (anywhere) + combined-dark + self-scoped-dark
 *     accent (lilac · …)     (the i-th occupies 5+2i / 6+2i / (6+2i)b).
 * A DARK block redeclares a token ONLY when its dark ref ≠ its light ref. For
 * neutral every token swaps (→ all 6); for a bright brand the P4-FROZEN tokens have
 * light===dark (→ omitted) so the dark blocks are PARTIAL (the 3 theme-adapting
 * tokens). P4 is not special-cased — it falls out of "redeclare only what changes".
 *
 * ── In-place · the provenance-marked region (the dimension S1 trade) ─
 * The generated cascade replaces a MARKED region of styles/tokens-semantic.css
 * (CASCADE_MARKER_BEGIN … CASCADE_MARKER_END); the file header + the dimension
 * blocks (space/size/radius · owned by the dimension Slice-0 · decision 71) pass
 * through verbatim. Wiring order (tokens-parser.js Slice 0): dimension flip →
 * colour-primitive flip → THIS, before any downstream slice reads the CSS.
 *
 * loadSemanticColours imports the .ts SoT through scripts/ts-data-loader.js, the
 * shared build-time TS→ESM data boundary.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile, writeFile } from 'node:fs/promises';

import { loadTsDataFromPath } from '../ts-data-loader.js';

const THEMES = ['light', 'dark'];

// ── load the TS SoT (the semantic matrix) ───────────────────────────
export async function loadSemanticColours(coloursTsPath) {
  const mod = await loadTsDataFromPath(coloursTsPath);
  // A loader regression must fail LOUD here, not silently emit garbage.
  for (const name of ['chrome', 'accent']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[semantic-css] loadSemanticColours: ${name} missing/empty (loader regression?)`);
    }
  }
  return { chrome: mod.chrome, accent: mod.accent };
}

// ── a bare semantic ref → its CSS var() ─────────────────────────────
// 'neutral.1.dark' → var(--nuri-color-neutral-1-dark). A ref is a BARE
// `'scale.step.theme'` string (N+55 · decision 80 · no `{ ref }` wrapper). `neutral` is
// the abstract pointer (→ cream · resolved in tokens-primitive.css); the dotted ref is
// the cascade reference (the semantic names a primitive, it does not restate a value).
export function refToVar(ref) {
  if (typeof ref !== 'string') {
    throw new Error(`[semantic-css] semantic ref is not a string: ${JSON.stringify(ref)}`);
  }
  const parts = ref.split('.');
  // Theme-invariant L1 alpha overlays take a 2-segment 'scale.step' ref (no
  // theme leg — the mode flip lives in the semantic pair, across scales).
  const isAlphaRef = parts.length === 2 && ALPHA_SCALES.includes(parts[0]);
  if (!isAlphaRef && (parts.length !== 3 || !THEMES.includes(parts[2]))) {
    throw new Error(`[semantic-css] bad colour ref '${ref}' — want 'scale.step.theme' (theme ∈ {${THEMES.join(',')}}) or an alpha 'scale.step' (scale ∈ {${ALPHA_SCALES.join(',')}})`);
  }
  return `var(--nuri-color-${parts.join('-')})`;
}

// The theme-invariant L1 overlay scales (colours.ts blackAlpha/whiteAlpha ·
// emitted --nuri-color-{black,white}-alpha-N).
export const ALPHA_SCALES = ['black-alpha', 'white-alpha'];

// ── the cascade model · the 8 blocks from the matrix ────────────────
// chrome decls for a theme (full · chrome is theme-paired): [[--nuri-<key>, rhs], …].
// chrome[k][theme] is a BARE ref string (the unwrap · N+55) → straight to refToVar.
function chromeDecls(chrome, theme) {
  return Object.keys(chrome).map((k) => [`--nuri-${k}`, refToVar(chrome[k][theme])]);
}

// accent decls for (accentName, theme). The SoT is accent-MAJOR (accent[accentName] is
// the role table · N+55 · decision 80): a role is a FLAT `string` ref (theme-invariant ·
// the P4-frozen brand · emitted in both default blocks, NEVER a dark redeclaration) or a
// `{ light, dark }` PAIR (theme-adapting · the minimal dark override). `onlyChanged` keeps
// only the pair roles — `typeof role !== 'string'` replaces the old dark≠light ref filter.
function accentDecls(accent, accentName, theme, onlyChanged = false) {
  const roles = accent[accentName];
  return Object.keys(roles)
    .filter((k) => !onlyChanged || typeof roles[k] !== 'string')
    .map((k) => {
      const role = roles[k];
      const ref = typeof role === 'string' ? role : role[theme];
      return [`--nuri-accent-${k}`, refToVar(ref)];
    });
}

// Build the ordered cascade from the matrix. Each block:
//   { id, role, selector, decls: [[prop, rhs], …] }. Selectors + ordering are
// the decision-63 cascade exactly; don't reorder (#4b/#6b sit after their #4/#6
// twin so an equal-specificity tie resolves to the same value either way).
//
// `neutral` is the DEFAULT scope — blocks 1·2·3·4·4b (light re-asserts at any wrapper ·
// the explicit-light override · the combined-dark + the dec-63 self-scoped-dark). Every
// OTHER accent gets the SAME 3-block treatment — light (anywhere) + combined-dark +
// self-scoped-dark — so adding an accent is DATA, not an emitter edit (N+56 · slice 2 ·
// the last accent-hardcoded spot, generified). Block ids continue from 5: the i-th
// non-neutral accent occupies (5+2i) / (6+2i) / (6+2i)b — lilac → 5/6/6b · orange →
// 7/8/8b. Lilac's three blocks are byte-identical to the prior hand-written ones (the
// gate); orange's follow. A DARK block redeclares a token ONLY when its dark ref ≠ light
// ref (accentDecls `onlyChanged`), so the P4-frozen brand tokens fall out → 6/6b (and
// 8/8b) are PARTIAL with no special-casing.
export function buildSemanticCascade({ chrome, accent }) {
  const blocks = [
    {
      id: '1', role: 'defaults · chrome light + neutral accent light (light re-asserts at any wrapper)',
      selector: ':root,\n[data-theme="light"]',
      decls: [...chromeDecls(chrome, 'light'), ...accentDecls(accent, 'neutral', 'light')],
    },
    {
      id: '2', role: 'chrome dark + neutral accent dark (anywhere)',
      selector: '[data-theme="dark"]',
      decls: [...chromeDecls(chrome, 'dark'), ...accentDecls(accent, 'neutral', 'dark', true)],
    },
    {
      id: '3', role: 'explicit neutral accent · light (anywhere · nested override)',
      selector: '[data-accent="neutral"]',
      decls: accentDecls(accent, 'neutral', 'light'),
    },
    {
      id: '4', role: 'neutral accent dark · SAME element carries both attrs (specificity 0,2,0)',
      selector: '[data-accent="neutral"][data-theme="dark"]',
      decls: accentDecls(accent, 'neutral', 'dark', true),
    },
    {
      id: '4b', role: 'neutral accent dark · SELF-SCOPED under a dark ancestor (decision 63 · 0,2,0)',
      selector: '[data-theme="dark"] [data-accent="neutral"]',
      decls: accentDecls(accent, 'neutral', 'dark', true),
    },
  ];

  // The non-neutral accents (lilac · orange · …) in matrix order — each emits its 3
  // blocks. The role comments mirror the prior hand-written lilac wording verbatim
  // (with the accent name interpolated) so lilac stays byte-identical.
  Object.keys(accent)
    .filter((name) => name !== 'neutral')
    .forEach((name, i) => {
      const light = 5 + 2 * i;
      const dark = light + 1;
      blocks.push(
        {
          id: String(light), role: `${name} accent · light (anywhere)`,
          selector: `[data-accent="${name}"]`,
          decls: accentDecls(accent, name, 'light'),
        },
        {
          id: String(dark), role: `${name} accent dark · PARTIAL per P4 (frozen brand omitted · SAME element · 0,2,0)`,
          selector: `[data-accent="${name}"][data-theme="dark"]`,
          decls: accentDecls(accent, name, 'dark', true),
        },
        {
          id: `${dark}b`, role: `${name} accent dark · SELF-SCOPED under a dark ancestor (decision 63 · partial per P4)`,
          selector: `[data-theme="dark"] [data-accent="${name}"]`,
          decls: accentDecls(accent, name, 'dark', true),
        },
      );
    });

  return blocks;
}

// ── render the cascade region (markers + blocks) ────────────────────
export const CASCADE_MARKER_BEGIN = [
  '/* ════════════════════════════════════════════════════════════════════',
  ' * GENERATED · the accent×theme cascade · from packages/spec/tokens/colours.ts (chrome +',
  ' * accent) via scripts/parsers/semantic-css.js · decision 70 / 72.',
  ' * DO NOT EDIT — `npm run build` regenerates this region IN PLACE (Slice 0,',
  ' * the colour-semantic flip). The resolution matrix IS the SoT (colours.ts);',
  ' * the cascade ORDERING + the #4b/#6b self-scope rationale (decision 63) are',
  ' * documented in the file header above.',
  ' * ════════════════════════════════════════════════════════════════════ */',
].join('\n');

export const CASCADE_MARKER_END =
  '/* ════════════════ END GENERATED · the accent×theme cascade ════════════════ */';

// One block → CSS text. Declarations are column-aligned for legibility (the gate
// compares trimmed values · alignment is cosmetic). A terse role comment replaces
// the hand file's per-declaration Format-B matrix (which now lives in the SoT).
function emitBlock({ id, role, selector, decls }) {
  const width = Math.max(...decls.map(([p]) => p.length));
  const body = decls.map(([p, v]) => `  ${`${p}:`.padEnd(width + 1)} ${v};`).join('\n');
  return `/* ${id} · ${role} */\n${selector} {\n${body}\n}`;
}

export function emitCascadeRegion(blocks) {
  const body = blocks.map(emitBlock).join('\n\n\n');
  return `${CASCADE_MARKER_BEGIN}\n\n${body}\n\n${CASCADE_MARKER_END}`;
}

// ── the in-place splice ─────────────────────────────────────────────
// Replace the marked region [BEGIN … END] with `region`. Everything outside (the
// file header · the dimension blocks) is preserved verbatim. Idempotent on a
// fresh-built file (the committed region IS the emitter's output · Guard B).
export function spliceCascade(cssText, region) {
  const begin = cssText.indexOf(CASCADE_MARKER_BEGIN);
  const endStart = cssText.indexOf(CASCADE_MARKER_END);
  if (begin === -1 || endStart === -1 || endStart < begin) {
    throw new Error(
      '[semantic-css] the generated-cascade markers were not found (or are out of order) in ' +
      'tokens-semantic.css — restore the BEGIN/END markers around the cascade region.',
    );
  }
  const end = endStart + CASCADE_MARKER_END.length;
  return cssText.slice(0, begin) + region + cssText.slice(end);
}

// ── the flip · SoT → tokens-semantic.css, in place ──────────────────
// Slice 0 of the build (scripts/tokens-parser.js): regenerate the accent×theme
// cascade from the SoT BEFORE the semantic slice reads the CSS. Returns the
// rewritten string + the region so a caller can reuse them without re-reading.
export async function flipSemanticCss({ semanticPath, semanticColours }) {
  const region = emitCascadeRegion(buildSemanticCascade(semanticColours));
  const semantic = spliceCascade(await readFile(semanticPath, 'utf8'), region);
  await writeFile(semanticPath, semantic, 'utf8');
  return { semantic, region };
}
