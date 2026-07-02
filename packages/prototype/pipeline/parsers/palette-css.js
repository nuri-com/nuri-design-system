/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · PALETTE NAMESPACE CSS EMIT (the L3b·1 reversible shadow · decision 70 / 67)
 * ──────────────────────────────────────────────────────────────────
 * The palette SURFACE role table (pipeline/palette-surface.ts) → the web palette
 * namespace CSS. palette is the FIRST bespoke axis (decision 67): the colour
 * funnel, single-sourced but NOT a Field-table member (box/stack rode the generic
 * resolve-map.ts table at L3.1; palette has its own bespoke shape). This is the
 * inverse-spelling of resolvePalette (packages/rn/runtime/resolve.ts): the RN
 * resolver maps `surface[variant] → { bg, fg, pressedBg, border }` onto a node; this
 * writes the `.nuri-palette[data-*]` dispatch the CSS cascade resolves.
 *
 * REVERSIBLE SHADOW (the L3.1 discipline · roadmap/N+30-L3.1.md): generates to
 * build/css-preview/palette.css, proven ≡ the hand lib/components/palette/
 * palette.css (the parity oracle · pipeline/palette-css.test.js). NOT wired into
 * `npm run build`; the live web factory, the pages, the recipe layer, and
 * build/palette.ts (still derived from the hand CSS via pipeline/parsers/
 * palette.js · byte-identical) are untouched. decision 2 STANDS for the namespace
 * layer until L3c.
 *
 * ── The dispatch, precisely (the inverse of resolvePalette) ─────────
 *   · REST state · one rule per (axis, input): `.nuri-palette[data-<axis>="<v>"]`
 *     paints the COMPLETE pair — `background` (when the role has a bg) + `color`
 *     + optional border stroke.
 *     `variant` (solid/soft/ghost/subtle) carries accent identity; `chrome`
 *     (canvas/subtle/strong) is the theme-only slot. variant XOR chrome.
 *   · PRESSED · `.nuri-palette[data-variant="<v>"][data-press-color]:active`
 *     swaps `background` (background-only · the scale/opacity transients are
 *     interactive's). Gated on `[data-press-color]` so a STATIC surface never
 *     matches :active. variant-only — the chrome slot + subtle have no pressed.
 *
 * ── NO SHELL (palette is the MERGED-NODE axis · 65.3 §6 / B1.5 §4.2) ─
 * Unlike box/stack (custom-element wrappers · display:contents · :not(:defined)
 * skeletons), there is NO <nuri-palette> element and no palette.js — the class +
 * data-attrs land directly ON the painting node (`class="nuri-box nuri-stack
 * nuri-palette" data-variant="…"`). So the emit has no PRE/POST shell, no base
 * rule, no :not(:defined): every selector is the `.nuri-palette[data-*]` class
 * dispatch. The namespaces are disjoint (box owns no colour) so the rule-sets
 * co-exist on one node without collision.
 *
 * ── The SPELLING (the per-target delta) ─────────────────────────────
 * A bare-string paint is an L2 role NAME → `var(--nuri-<role>)` (e.g. accent-solid
 * → var(--nuri-accent-solid)); a `{ literal }` paint emits verbatim (transparent ·
 * no var). The property spelling is the hand CSS's: the `background` SHORTHAND
 * (not background-color) + `color`. There is NO logical→physical remap and NO
 * shorthand/longhand family overlap (background/color are direct, disjoint
 * properties) — so structural ≡ to the hand CSS IS the complete computed-style
 * proof for palette (unlike box's padding family · see palette-css.test.js
 * Guard A). The accent×theme cascade rides the EXISTING [data-accent] scope in
 * tokens-semantic.css (the decision-63 #4b/#6b self-scope · N+32) — NOT reproduced
 * here; palette only references var(--nuri-accent-*).
 *
 * loadSurface imports the .ts SoT through the shared TS data loader. The L3c flip
 * relocates the table into @nuri/spec proper and retires the hand CSS.
 * ══════════════════════════════════════════════════════════════════ */

import { loadTsDataFromPath } from './strip.js';

// ── load the TS SoT (the SURFACE role table) ────────────────────────
export async function loadSurface(surfaceTsPath) {
  const mod = await loadTsDataFromPath(surfaceTsPath);
  // A loader regression must fail LOUD here, not silently emit garbage.
  const s = mod.surface;
  if (!s || typeof s !== 'object' || !s.variant || !s.chrome) {
    throw new Error('[palette-css] loadSurface: surface missing/empty or lacks variant/chrome (loader regression?)');
  }
  return s;
}

// ── a Paint → its CSS value ─────────────────────────────────────────
// A bare string is an L2 role NAME (the emit prefixes --nuri- → var(...)); a
// `{ literal }` is the verbatim CSS value (the transparent exception · no var).
// Exhaustive — an unrecognised paint throws (the assertNever analogue).
export function paintToCss(paint) {
  if (typeof paint === 'string') return `var(--nuri-${paint})`;
  if (paint && typeof paint.literal === 'string') return paint.literal;
  throw new Error(`[palette-css] paint is neither an L2 role name nor a { literal }: ${JSON.stringify(paint)}`);
}

// ── the merged-node dispatch selectors (NO element wrapper · the class IS the
// painting node) ──
const restSel = (axis, input) => `.nuri-palette[data-${axis}="${input}"]`;
const pressedSel = (input) => `.nuri-palette[data-variant="${input}"][data-press-color]:active`;

// the two INPUT axes, in the emit / hand-CSS order (variant before chrome).
const AXES = ['variant', 'chrome'];

// ── the SURFACE table → its [data-*] dispatch rules ─────────────────
// A rule = { sel, decls: [[prop, value], …] }. REST rules paint the complete pair
// (background when present · color always); PRESSED rules swap background only.
export function rulesForSurface(surface) {
  const rest = [];
  for (const axis of AXES) {
    const rows = surface[axis];
    if (!rows) throw new Error(`[palette-css] surface has no '${axis}' axis`);
    for (const input of Object.keys(rows)) {
      const role = rows[input];
      if (role.fg === undefined) {
        throw new Error(`[palette-css] ${axis}.${input}: every surface role must paint an fg (the complete-pair contract)`);
      }
      const decls = [];
      // bg is OPTIONAL — absent ⇒ fg-only (the `subtle` role · decision 50). When
      // present (incl. the explicit transparent) it paints first, then color.
      if (role.bg !== undefined) decls.push(['background', paintToCss(role.bg)]);
      decls.push(['color', paintToCss(role.fg)]);
      if (role.border !== undefined) decls.push(['border', `var(--nuri-border-1) solid ${paintToCss(role.border)}`]);
      rest.push({ sel: restSel(axis, input), decls });
    }
  }

  // PRESSED · variant-only (the chrome slot + subtle have no pressed channel).
  // Iterate the variant axis; a row without a `pressed` paint emits no rule.
  const pressed = [];
  for (const input of Object.keys(surface.variant)) {
    const role = surface.variant[input];
    if (role.pressed === undefined) continue; // subtle (fg-only) · no pressed swap
    pressed.push({ sel: pressedSel(input), decls: [['background', paintToCss(role.pressed)]] });
  }

  return [...rest, ...pressed];
}

// ── serialize a rule → CSS text (indented inside @layer rules) ──────
function serializeRule({ sel, decls }) {
  const body = decls.map(([p, v]) => `${p}: ${v};`).join(' ');
  return `  ${sel} { ${body} }`;
}

// ══════════════════════════════════════════════════════════════════
// emitPaletteCss · the SURFACE table → the full shadow CSS file
// ══════════════════════════════════════════════════════════════════
// Layout: provenance header + empty `@layer tokens` (mirrors the hand palette.css
// · palette dispatches the semantic vocabulary directly · decision 37) + `@layer
// rules` { rest dispatch (variant then chrome) · pressed swaps }.
export function emitPaletteCss(surface) {
  const ruleLines = rulesForSurface(surface).map(serializeRule);

  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · PALETTE · GENERATED — DO NOT EDIT BY HAND`,
    ` *`,
    ` * GENERATED from the SURFACE role table (packages/spec/axes/palette-surface.ts)`,
    ` * by prototype/pipeline/css-preview.js — the inverse-spelling of resolvePalette`,
    ` * (packages/rn/runtime/resolve.ts) — wired into npm run build -w @nuri/prototype (its`,
    ` * own build · regenerates IN PLACE over prototype/styles/palette.css). This is the LIVE`,
    ` * palette namespace CSS: the pages link it and the web factory styles nuri-palette`,
    ` * nodes with it. decision 2 reversed for the namespace layer (decision 74 · executing`,
    ` * decision 70 · the L3c flip · N+38 · carved to @nuri/prototype at N+41) — the hand SoT`,
    ` * retired (git-recoverable), the generator is the sole source, and packages/rn/generated/data/`,
    ` * palette.ts asserts its contract against the same SURFACE SoT (re-sourced at N+40 · the`,
    ` * recipe-CSS cross-checks retired with the recipes · scripts/parsers/palette.js).`,
    ` * Re-run npm run build -w @nuri/prototype; freshness gated by`,
    ` * prototype/pipeline/palette-css.test.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `@layer tokens {`,
    `  /* Empty by design (decision 37 · the Stack/Box pattern). Palette dispatches`,
    `   * the semantic accent/chrome vocabulary directly in \`@layer rules\` via`,
    `   * attribute selectors — component-token aliasing would be useless`,
    `   * indirection. Mirrors the hand palette.css. */`,
    `}`,
    ``,
    `@layer rules {`,
    ruleLines.join('\n'),
    `}`,
    ``,
  ].join('\n');
}
