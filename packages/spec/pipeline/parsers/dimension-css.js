/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · DIMENSION CSS EMIT (N+31 · decision 70 · the first flip)
 * ──────────────────────────────────────────────────────────────────
 * The TS dimension SoT (pipeline/dimensions.ts) → the dimension declarations in
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
 *   · tokens-semantic.css  → --nuri-{space,size,radius}-* (the L2 semantics).
 *
 * Each rewrite asserts the SoT and the CSS own EXACTLY the same leaves in their
 * families (the drift guard · both directions) — a px primitive added to one but
 * not the other fails the build loudly rather than silently diverging.
 *
 * loadDimensions type-strips + data:-URL imports the .ts SoT (node 20 cannot
 * import a .ts) — the technique the descriptor twins (decision 69) and the L3.1
 * Field-table loader (parsers/namespace-css.js) already use.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

// ── load the TS SoT ────────────────────────────────────────────────
// Strip the (deliberately trivial) TS apparatus dimensions.ts uses — only
// single-line `export type …;` and the `const X: T =` annotations — then import
// the self-contained data module (no runtime imports) via a data: URL.
export function stripTypes(src) {
  return src
    .replace(/^export type .*;\n/gm, '')
    .replace(/^((?:export )?const \w+): [^=\n]+ = /gm, '$1 = ');
}

export async function loadDimensions(dimensionsTsPath) {
  const src = await readFile(dimensionsTsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypes(src)));
  // A strip regression must fail LOUD here, not silently emit garbage.
  if (!Array.isArray(mod.PX_SCALE) || mod.PX_SCALE.length === 0) {
    throw new Error('[dimension-css] loadDimensions: PX_SCALE missing/empty (strip regression?)');
  }
  for (const name of ['SPACE', 'SIZE', 'RADIUS']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[dimension-css] loadDimensions: ${name} missing/empty (strip regression?)`);
    }
  }
  return { PX_SCALE: mod.PX_SCALE, SPACE: mod.SPACE, SIZE: mod.SIZE, RADIUS: mod.RADIUS };
}

// ── SoT leaf → the CSS declaration RHS ──────────────────────────────
// A px reference becomes `var(--nuri-px-N)` (the cascade); a literal is emitted
// verbatim. The shape is exhaustive over DimLeaf — an unrecognised leaf throws.
export function leafRhs(leaf) {
  if (leaf && typeof leaf.px === 'number') return `var(--nuri-px-${leaf.px})`;
  if (leaf && typeof leaf.literal === 'string') return leaf.literal;
  throw new Error(`[dimension-css] leaf is neither { px } nor { literal }: ${JSON.stringify(leaf)}`);
}

// ── SoT → the { cssVar → RHS } maps the rewriter applies, one per file ──
// Primitive file: the --nuri-px-N scale (value == name · decision 32).
export function primitiveDimMap({ PX_SCALE }) {
  return new Map(PX_SCALE.map((n) => [`--nuri-px-${n}`, `${n}px`]));
}

// Semantic file: the space/size/radius leaves → var(--nuri-px-N) | literal.
export function semanticDimMap({ SPACE, SIZE, RADIUS }) {
  const map = new Map();
  for (const [scale, table] of [['space', SPACE], ['size', SIZE], ['radius', RADIUS]]) {
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
    throw new Error(`[dimension-css] the SoT declares ${missingInCss.join(', ')} but the CSS has no such declaration — add it to the CSS or remove it from pipeline/dimensions.ts`);
  }
  const orphanInCss = [...cssOwned].filter((p) => !declMap.has(p));
  if (orphanInCss.length) {
    throw new Error(`[dimension-css] the CSS declares ${orphanInCss.join(', ')} but pipeline/dimensions.ts does not — the SoT must own every dimension declaration in its families`);
  }
  return root.toString();
}

// ── the flip · SoT → both token CSS files, in place ─────────────────
// Slice 0 of the build (pipeline/tokens-parser.js): regenerate the dimension
// declarations from the SoT BEFORE every downstream slice reads the CSS. Writes
// into styles/ (the S1 passthrough-hybrid trade · muddier provenance for zero
// repointing); byte-identical while values are unchanged. Returns the rewritten
// strings so a caller can reuse them without re-reading.
export async function flipDimensionCss({ primitivePath, semanticPath, dims }) {
  const primitive = rewriteDimensionDecls(
    await readFile(primitivePath, 'utf8'), primitiveDimMap(dims), /^--nuri-px-/,
  );
  await writeFile(primitivePath, primitive, 'utf8');
  const semantic = rewriteDimensionDecls(
    await readFile(semanticPath, 'utf8'), semanticDimMap(dims), /^--nuri-(space|size|radius)-/,
  );
  await writeFile(semanticPath, semantic, 'utf8');
  return { primitive, semantic };
}
