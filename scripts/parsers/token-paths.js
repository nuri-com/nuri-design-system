/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · TOKEN-PATHS UNION → packages/rn/generated/data/token-paths.ts (N+60 · Slice 3b·2a · decision 80)
 * ──────────────────────────────────────────────────────────────────
 * Enumerates the TokenPath discriminated union STRAIGHT from the TS SoTs
 * (packages/spec/tokens/colours.ts chrome + accent role names · packages/spec/tokens/dimensions.ts
 * space/size/radius/ratio/border keys) — no longer from classifyAll(semanticRules) (the CSS).
 * This finishes the RN contract's TS-sourcing (projection model §4): the runtime-set
 * leaf paths are exactly the colour roles (camelCased) + the dimension leaf keys, in
 * the same emit order tokens.ts uses (chrome · accent · space · size · radius · ratio · border).
 *
 * The union is the consumer's compile-time guard: generated RN token consumers
 * are `TokenPath`-checked, so adding/renaming a runtime leaf without re-emitting
 * fails the TS compile (decision 34). Because the
 * SoT keys ARE the leaf names, the same edit that grows tokens.ts grows this union —
 * no CSS classify step in between (classifyAll stays only for the web token-vars · 3c).
 * ══════════════════════════════════════════════════════════════════ */

// camelCase a kebab role key — the leaf identifier tokens.ts exposes ('bg-canvas' →
// 'bgCanvas' · 'solid-pressed' → 'solidPressed'). Mirrors semantic.js's classifier
// camelCase so the union (chrome.bgCanvas · accent.solidPressed) stays byte-identical
// to the classify-by-cascade emit it replaces.
function camelCase(str) {
  return str.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

// Emit packages/rn/generated/data/token-paths.ts as a string from the TS SoTs. `chrome`/`accent` are the
// semantic colour roles (packages/spec/tokens/colours.ts · loadSemanticColours); `dims` is the
// dimension SoT (packages/spec/tokens/dimensions.ts · loadDimensions). Order: chrome roles, then
// accent roles (every accent owns the same role set · read from the first), then the
// space/size/radius/ratio/border leaf keys — the tokens.ts EMIT_ORDER.
export function emitTokenPathsTsFromSoT({ chrome, accent }, dims) {
  const paths = [];
  for (const role of Object.keys(chrome)) paths.push(`chrome.${camelCase(role)}`);
  const firstAccent = Object.keys(accent)[0];
  for (const role of Object.keys(accent[firstAccent])) paths.push(`accent.${camelCase(role)}`);
  for (const scale of ['space', 'size', 'radius', 'ratio', 'border']) {
    for (const leaf of Object.keys(dims[scale])) paths.push(`${scale}.${leaf}`);
  }

  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · TOKEN PATHS · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · packages/spec/tokens/colours.ts (chrome · accent roles) + packages/spec/tokens/dimensions.ts (space · size · radius · ratio · border)`,
    ` * Emitter · scripts/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * Discriminated union of every generated token leaf path. Consumed`,
    ` * by the RN projection and checked by TypeScript, so adding or`,
    ` * renaming a token leaf without re-emitting this union fails the`,
    ` * compile (decision 34 · N+6.0.3).`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
  ];
  if (paths.length === 0) {
    lines.push(`export type TokenPath = never;`);
    lines.push('');
    return lines.join('\n');
  }
  lines.push(`export type TokenPath =`);
  paths.forEach((p, i) => {
    const suffix = i === paths.length - 1 ? ';' : '';
    lines.push(`  | '${p}'${suffix}`);
  });
  lines.push('');
  return lines.join('\n');
}
