/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · DIMENSION CSS EMIT (N+31 · decision 70 · the first flip)
 * ──────────────────────────────────────────────────────────────────
 * The TS dimension SoT (packages/spec/tokens/dimensions.ts) → the dimension declarations in
 * styles/tokens-{primitive,semantic}.css. decision 2 is REVERSED for the
 * dimension layer: these values are WRITTEN INTO the CSS, not read out of it.
 *
 * The emit is an in-place PASSTHROUGH (the S1 "passthrough-hybrid"): postcss
 * parses the hand CSS and ONLY the dimension declarations' values are rewritten
 * from the SoT — every non-dimension declaration, comment, and byte of
 * whitespace passes through verbatim (postcss preserves raws · setting a decl's
 * value to its current value round-trips byte-identical, verified). So no page
 * repointing, and because the values are unchanged this slice the whole pipeline
 * downstream (tokens.json · tokens.ts · …) stays byte-identical.
 *
 * Two ownership families, one per file (kept disjoint so the LOCKED reserved
 * radius PRIMITIVES are never touched):
 *   · tokens-primitive.css → the --nuri-px-* scale ONLY (NOT --nuri-radius-*,
 *     which are the reserved radius primitives · hand · decision 32 / 36.1).
 *   · tokens-semantic.css  → --nuri-{space,size,radius,ratio}-* (the L2 semantics ·
 *     ratio is UNITLESS · a bare number, not a px dimension · the aspect-ratio scale).
 *
 * Each rewrite asserts the SoT and the CSS own EXACTLY the same leaves in their
 * families (the drift guard · both directions) — a px primitive added to one but
 * not the other fails the build loudly rather than silently diverging.
 *
 * loadDimensions imports the .ts SoT through scripts/ts-data-loader.js, the
 * build-time TS→ESM boundary shared by the projections.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

import { loadTsDataFromPath } from '../ts-data-loader.js';

function refreshTokenCssProvenance(cssText) {
  return cssText
    .replaceAll('pipeline/colours.ts', 'packages/spec/tokens/colours.ts')
    .replaceAll('pipeline/dimensions.ts', 'packages/spec/tokens/dimensions.ts')
    .replaceAll('pipeline/typography.ts', 'packages/spec/tokens/typography.ts')
    .replaceAll('pipeline/tokens-parser.js', 'scripts/tokens-parser.js')
    .replaceAll('pipeline/parsers/semantic-css.js', 'scripts/parsers/semantic-css.js');
}

export async function loadDimensions(dimensionsTsPath) {
  const mod = await loadTsDataFromPath(dimensionsTsPath);
  // A loader regression must fail LOUD here, not silently emit garbage: every
  // SoT table must survive the strip as a non-empty object.
  for (const name of ['px', 'space', 'size', 'radius', 'ratio']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[dimension-css] loadDimensions: ${name} missing/empty (loader regression?)`);
    }
  }
  return { px: mod.px, space: mod.space, size: mod.size, radius: mod.radius, ratio: mod.ratio };
}

// ── SoT leaf → the CSS declaration RHS ──────────────────────────────
// A reference (`{ ref: N }`) becomes `var(--nuri-px-N)` (the cascade); a
// structured literal (`{ value, unit }`) becomes its CSS spelling, discriminated by
// `unit`: `none` is a BARE number (the `ratio` scale · `aspect-ratio: 1.586` — NO
// `px`, the named risk), `px` is a pixel dimension — 0 stays unitless `0` by Nuri
// convention (decision 32), else `${value}px`. The shape is exhaustive over Leaf —
// an unrecognised leaf throws.
export function leafRhs(leaf) {
  if (leaf && 'ref' in leaf) return `var(--nuri-px-${leaf.ref})`;
  if (leaf && typeof leaf.value === 'number') {
    if (leaf.unit === 'none') return `${leaf.value}`;
    return leaf.value === 0 ? '0' : `${leaf.value}px`;
  }
  throw new Error(`[dimension-css] leaf is neither { ref } nor { value, unit }: ${JSON.stringify(leaf)}`);
}

// ── SoT → the { cssVar → RHS } maps the rewriter applies, one per file ──
// Primitive file: the --nuri-px-N scale (value == name · decision 32). The KEYS
// of `px` ARE the scale (the DTCG shape · no array restated).
export function primitiveDimMap({ px }) {
  return new Map(Object.keys(px).map((n) => [`--nuri-px-${n}`, `${n}px`]));
}

// Semantic file: the space/size/radius/ratio leaves → var(--nuri-px-N) | literal.
export function semanticDimMap({ space, size, radius, ratio }) {
  const map = new Map();
  for (const [scale, table] of [['space', space], ['size', size], ['radius', radius], ['ratio', ratio]]) {
    for (const [leaf, def] of Object.entries(table)) {
      map.set(`--nuri-${scale}-${leaf}`, leafRhs(def));
    }
  }
  return map;
}

// ── the in-place rewrite (the passthrough emit) ─────────────────────
// Parse `cssText`, set every declaration whose prop is in `declMap` to its SoT
// value (verbatim everything else), and enforce the drift guard in BOTH
// directions over `ownedRe` (the family this file owns): the SoT must declare
// exactly the leaves the CSS does. Returns the restringified CSS.
export function rewriteDimensionDecls(cssText, declMap, ownedRe) {
  const root = postcss.parse(cssText);
  const seen = new Set();
  const cssOwned = new Set();
  root.walkDecls((decl) => {
    if (ownedRe.test(decl.prop)) cssOwned.add(decl.prop);
    if (!declMap.has(decl.prop)) return;
    if (seen.has(decl.prop)) {
      throw new Error(`[dimension-css] ${decl.prop} declared more than once — the SoT must own a single declaration per leaf`);
    }
    seen.add(decl.prop);
    decl.value = declMap.get(decl.prop);
  });
  const missingInCss = [...declMap.keys()].filter((p) => !seen.has(p));
  if (missingInCss.length) {
    throw new Error(`[dimension-css] the SoT declares ${missingInCss.join(', ')} but the CSS has no such declaration — add it to the CSS or remove it from packages/spec/tokens/dimensions.ts`);
  }
  const orphanInCss = [...cssOwned].filter((p) => !declMap.has(p));
  if (orphanInCss.length) {
    throw new Error(`[dimension-css] the CSS declares ${orphanInCss.join(', ')} but packages/spec/tokens/dimensions.ts does not — the SoT must own every dimension declaration in its families`);
  }
  return root.toString();
}

// ── the flip · SoT → both token CSS files, in place ─────────────────
// Slice 0 of the build (scripts/tokens-parser.js): regenerate the dimension
// declarations from the SoT BEFORE every downstream slice reads the CSS. Writes
// into styles/ (the S1 passthrough-hybrid trade · muddier provenance for zero
// repointing); byte-identical while values are unchanged. Returns the rewritten
// strings so a caller can reuse them without re-reading.
export async function flipDimensionCss({ primitivePath, semanticPath, dims }) {
  const primitive = rewriteDimensionDecls(
    refreshTokenCssProvenance(await readFile(primitivePath, 'utf8')), primitiveDimMap(dims), /^--nuri-px-/,
  );
  await writeFile(primitivePath, primitive, 'utf8');
  const semantic = rewriteDimensionDecls(
    refreshTokenCssProvenance(await readFile(semanticPath, 'utf8')), semanticDimMap(dims), /^--nuri-(space|size|radius|ratio)-/,
  );
  await writeFile(semanticPath, semantic, 'utf8');
  return { primitive, semantic };
}
