/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · DIMENSION → packages/rn/generated/data/tokens.ts (N+60 · Slice 3b·2a · decision 80)
 * ──────────────────────────────────────────────────────────────────
 * Re-sources the DIMENSION arm of packages/rn/generated/data/tokens.ts
 * (space · size · radius · ratio · border) STRAIGHT from
 * packages/spec/tokens/dimensions.ts — no CSS round-trip. The N+59 colour
 * twin (parsers/colour-tokens.js) did this for chrome + accent; this finishes the
 * RN contract's value arm (projection model §4 · no TS→CSS→TS round-trip).
 *
 * The dimension scales are CONTEXT-INVARIANT (no accent / no theme · the singleton
 * groups). So the resolver returns each leaf in resolveSemanticCrossProduct's shape
 * ({ [cssVar]: { [accent]: { [theme]: literal } } }) with the IDENTICAL literal in
 * every (accent, theme) cell — the orchestrator Object.assign-merges it over the
 * resolved map and the generic emitTokensTs singleton path collapses the redundant
 * cells back to one value per leaf, byte-identical to the old cascade walk.
 *
 * A leaf resolves to the final CSS literal the semantic var() chain bottoms out at
 * (the value the browser / RN sees):
 *   · { value: 0, unit:px } → '0'          — the collapsed-gutter sentinel, unitless (dec 32).
 *   · { value: V, unit:px } → `${V}px`     — the 9999 pill sentinel (amendment 36.1).
 *   · { value: V, unit:none}→ `${V}`       — the BARE ratio (aspectRatio: 1.586 · NO px).
 * The shape is exhaustive over dimensions.ts's Leaf union — an unrecognised leaf throws.
 * ══════════════════════════════════════════════════════════════════ */

import { ACCENTS, THEMES } from './semantic.js';

// The scales packages/rn/generated/data/tokens.ts exposes as singleton dimension namespaces (decision 36 ·
// amendment 36.1). Their KEYS are the leaf names (the DTCG shape · no array restated).
const DIMENSION_SCALES = ['space', 'size', 'radius', 'ratio', 'border'];

// Resolve a dimensions.ts leaf to its final CSS literal. Mirrors
// dimension-css.js's leafRhs.
export function resolveDimLeaf(leaf) {
  if (leaf && typeof leaf.value === 'number') {
    // `none` is a BARE number (the `ratio` scale · RN `aspectRatio: 1.586` — NO `px`,
    // the named risk); `px` is the pixel dimension (0 collapses unitless · decision 32).
    if (leaf.unit === 'none') return `${leaf.value}`;
    return leaf.value === 0 ? '0' : `${leaf.value}px`;
  }
  throw new Error(`[dimension-tokens] leaf is not { value, unit }: ${JSON.stringify(leaf)}`);
}

// The dimension arm of packages/rn/generated/data/tokens.ts, resolved from the TS SoT. Returns the
// cross-product node map (the resolveSemanticCrossProduct shape) so the orchestrator
// merges it into `resolved` exactly as it merges the colour chrome arm — every
// (accent, theme) cell of a leaf holds the identical literal (dimensions don't vary
// by context · the singleton emit asserts that invariance + collapses the cells).
export function resolveDimensionTokens(dims) {
  const out = {};
  for (const scale of DIMENSION_SCALES) {
    const table = dims[scale];
    if (!table || typeof table !== 'object') {
      throw new Error(`[dimension-tokens] packages/spec/tokens/dimensions.ts has no '${scale}' table`);
    }
    for (const [leaf, def] of Object.entries(table)) {
      const literal = resolveDimLeaf(def);
      const perAccent = {};
      for (const a of ACCENTS) {
        perAccent[a] = {};
        for (const t of THEMES) perAccent[a][t] = literal;
      }
      out[`--nuri-${scale}-${leaf}`] = perAccent;
    }
  }
  return out;
}
