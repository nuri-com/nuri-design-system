/* ──────────────────────────────────────────────────────────────
 * NURI · PARSER · PRIMITIVE
 * Reads styles/tokens-primitive.css and returns the flat list of
 * raw {cssVar, value} pairs that have a literal RHS (i.e. not a
 * var() alias). Used to build the DTCG-nested tokens.json (colour
 * primitive scope) and to seed the primitive map that the semantic
 * resolver chases var() chains through.
 *
 * Extracted from the orchestrator as part of the N+5 split (see
 * roadmap/N+5.md); moved to pipeline/parsers/ at N+6.0.4 alongside
 * the source/output physical separation (decision 35). The 6
 * primitive round-trip tests still consume these exports unchanged
 * via the orchestrator at pipeline/tokens-parser.js.
 * ────────────────────────────────────────────────────────────── */

import postcss from 'postcss';

// Principle P9 · DTCG naming · token type inference.
// Order matters — longer prefixes first. Mirrors lib/docs/tokens.js so
// the two parsers can't disagree.
//
// `--nuri-line-height-*` and `--nuri-shadow-*` are kept as defensive
// type inference even though no primitives ship under those prefixes
// today:
//   --nuri-line-height-*  unitless per decision 29.
//   --nuri-shadow-*       arrives with the Elevation foundation.
// `--nuri-size-*` and `--nuri-space-*` are the semantic dimension
// vocabulary landed at N+6.1 (decision 36); they live in the
// semantic layer but reach this table because per-component CSS
// references chain through `inferType` to decide JS-emit shape and
// the docs-side tokens parser shares the same prefix table.
// When a future primitive (or alias) lands the parser already
// classifies it correctly.
export const TYPE_PREFIXES = [
  [/^--nuri-color-/, 'color'],
  [/^--nuri-px-/, 'dimension'],
  [/^--nuri-size-/, 'dimension'],
  [/^--nuri-space-/, 'dimension'],
  [/^--nuri-radius-/, 'dimension'],
  [/^--nuri-font-size-/, 'dimension'],
  [/^--nuri-line-height-/, 'dimension'],
  [/^--nuri-border-/, 'dimension'],
  [/^--nuri-font-family-/, 'fontFamily'],
  [/^--nuri-font-weight-/, 'fontWeight'],
  [/^--nuri-duration-/, 'duration'],
  [/^--nuri-shadow-/, 'shadow'],
];

export function inferType(cssVar) {
  for (const [re, type] of TYPE_PREFIXES) {
    if (re.test(cssVar)) return type;
  }
  return 'unknown';
}

// "--nuri-color-gray-1-light" → ["color", "gray", "1", "light"]
export function pathFor(cssVar) {
  return cssVar.replace(/^--nuri-/, '').split('-');
}

// Read every primitive declaration (cssVar, value) pair from the
// CSS file. Skips aliases (var(...) on the RHS) — those are the
// active-neutral switcher, not raw primitives.
//
// Walks descendant rules so future @layer-wrapped primitives still
// parse — today the file is unlayered, but the walker is cheap.
export async function readPrimitives(css) {
  const root = postcss.parse(css);
  const out = [];
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--nuri-')) return;
    const value = decl.value.trim();
    if (value.startsWith('var(')) return;
    out.push({ cssVar: decl.prop, value });
  });
  return out;
}

function setNested(root, path, leaf) {
  let node = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (node[key] == null) node[key] = {};
    node = node[key];
  }
  node[path[path.length - 1]] = leaf;
}

// Emit DTCG-nested tree from a list of {cssVar, value} primitives,
// filtered by predicate. Each leaf is { $type, $value }.
//
// Path comes from the CSS var name minus the --nuri- prefix, split
// on dashes. That makes `--nuri-color-gray-1-light` →
// `color.gray.1.light` (4-deep, theme-suffixed) and
// `--nuri-color-black-alpha-1` → `color.black.alpha.1` (3-deep, no
// theme — alpha tokens are theme-invariant per rule 3).
export function buildDtcg(primitives, predicate) {
  const tree = {};
  for (const { cssVar, value } of primitives) {
    if (predicate && !predicate(cssVar)) continue;
    const path = pathFor(cssVar);
    setNested(tree, path, {
      $type: inferType(cssVar),
      $value: value,
    });
  }
  return tree;
}

export function countLeaves(node) {
  if (node && typeof node === 'object' && '$value' in node) return 1;
  let n = 0;
  for (const key of Object.keys(node)) n += countLeaves(node[key]);
  return n;
}
