/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · TYPOGRAPHY NAMESPACE CSS EMIT (the L3.1b reversible shadow · decision 70 / 67 / 73)
 * ──────────────────────────────────────────────────────────────────
 * The typography AXIS (pipeline/typography-axis.ts) → the web typography namespace
 * CSS. typography is the THIRD and LAST bespoke axis (decision 73 corrected dec 70:
 * bespoke, not agnostic): a thin <nuri-typography> WRAPPER for declarative muted/align
 * authoring, single-sourced but NOT a Field-table member (box/stack rode the generic
 * resolve-map.ts table at L3.1; typography is a type-STEP ref in resolve.ts, bespoke ·
 * like palette/interactive). Spec carries neutral wrapper intent; this projection
 * owns selector/declaration spelling.
 *
 * REVERSIBLE SHADOW (the L3.1 / palette / interactive discipline · roadmap/N+33 / N+34):
 * generates to build/css-preview/typography.css, proven ≡ the hand
 * lib/components/typography/typography.css (the parity oracle · pipeline/
 * typography-css.test.js). NOT wired into `npm run build`; the live web factory, the
 * pages, the recipe layer, and the RN factory (typeStyle) are untouched. decision 2
 * STANDS for the namespace layer until L3c.
 *
 * ── THE SCOPE LINE · the WRAPPER only (the type SCALE is OUT · the critical sub-decision) ──
 * The typography axis splits on web: {muted, align} → THIS wrapper; {size, emphasis} →
 * the foundation type SCALE (styles/typography.css · the .nuri-type-{step} utilities →
 * --nuri-type-* primitives) + typography.js at runtime — an L1/L2 TOKEN layer still
 * CSS-SoT (decision 71/72 · a separate later token flip · NOT this slice). This emitter
 * writes NO --nuri-type-* and NO .nuri-type-{step}.
 *
 * ── The dispatch + shell, precisely ─────────────────────────────────
 *   · SHELL (emitter-owned · mirrored from hand · the box/stack precedent · NOT the SoT):
 *       base      · `nuri-typography` — display:inline (the host flows inline by default).
 *       skeleton  · `nuri-typography:not(:defined)` — display:inline (the pre-upgrade
 *                   state until typography.js applies the utility class). Parametrized by
 *                   the SoT's `element`; the rule STRUCTURE is the emitter's.
 *   · DISPATCH (projection-owned spelling from typography-axis.ts intent):
 *       muted     · `nuri-typography[data-muted]` — color: var(--nuri-text-muted) (the
 *                   reflected boolean attr · decision 53 · presence gate).
 *       align     · `nuri-typography[align="<v>"]` — display:block + text-align:<v> (the
 *                   plain prop-driven HTML attr · decision 59 · equality gate · one rule
 *                   per start/center/end). block flips the inline host so text-align applies.
 *
 * ── THE ELEMENT (the one place typography diverges from palette/interactive) ──
 * palette/interactive are MERGED-NODE (no element · the `.nuri-<ns>` class lands on the
 * painting node · 65.3 §6 / B1.5 §4.2). typography is a real <nuri-typography> ELEMENT
 * with a SHELL — like box/stack (display:contents wrappers), NOT like palette. So every
 * selector here is the ELEMENT `nuri-typography…` (NO leading dot), and the emit carries
 * the shell (base + :not(:defined)) the merged-node axes lack.
 *
 * ── THE LOAD-BEARING ORDER (the order-sensitivity RECURS on `display`) ──
 * The :not(:defined) skeleton (inline · (0,1,1)) and the [align] rules (block · (0,1,1))
 * are EQUAL specificity — a pre-upgrade aligned node matches BOTH, so `display` resolves
 * by SOURCE ORDER. The emit is shell-FIRST (base, :not(:defined)) then dispatch (muted,
 * align…), so [align]'s block is emitted LAST and wins → a pre-upgrade aligned node is
 * block (text-align takes effect even before upgrade). The order guard proves it
 * (typography-css.test.js · the interactive Guard-D pattern, here on `display`).
 *
 * ── THE SPELLING (the per-target delta · the SoT-vs-shell line) ─────────────
 * typography's web projection spells muted as `data-muted` + the role var, and
 * align as `[align="<v>"]` + display/text-align declarations. The spec remains
 * selector/declaration-free.
 *
 * loadAxis imports the .ts SoT through the shared TS data loader. The L3c flip
 * relocates the SoT into @nuri/spec proper and retires the hand CSS.
 * ══════════════════════════════════════════════════════════════════ */

import { loadTsDataFromPath } from './strip.js';

// ── load the TS SoT (the typography AXIS) ───────────────────────────
export async function loadAxis(axisTsPath) {
  const mod = await loadTsDataFromPath(axisTsPath);
  // A loader regression must fail LOUD here, not silently emit garbage.
  const a = mod.axis;
  if (
    !a || typeof a !== 'object' ||
    typeof a.element !== 'string' || !a.element ||
    !a.muted || typeof a.muted.role !== 'string' ||
    !a.align || !Array.isArray(a.align.values) || a.align.values.length === 0
  ) {
    throw new Error('[typography-css] loadAxis: axis missing element/muted/align (loader regression?)');
  }
  return a;
}

// ══════════════════════════════════════════════════════════════════
// THE SHELL · non-dispatch structural boilerplate (mirrored from hand · the box/stack
// precedent · NOT the SoT · see header). Parametrized by the element name.
// ══════════════════════════════════════════════════════════════════
// The element BASE (display:inline) + the pre-upgrade SKELETON (:not(:defined) · same
// inline). Emitted FIRST (shell-before-dispatch · the hand order · LOAD-BEARING for
// the equal-specificity display pair). A rule = { sel, decls: [[prop, value], …] }.
function shellRules(element) {
  return [
    { sel: element, decls: [['display', 'inline']] },
    { sel: `${element}:not(:defined)`, decls: [['display', 'inline']] },
  ];
}

function roleVar(role) {
  return `var(--nuri-${role})`;
}

export function typographyWebProjection(axis) {
  const { element } = axis;
  const dispatch = [
    {
      name: 'muted',
      sel: `${element}[data-muted]`,
      selector: `${element}[data-muted]`,
      decls: [['color', roleVar(axis.muted.role)]],
    },
    ...axis.align.values.map((value) => ({
      name: `align${value[0].toUpperCase()}${value.slice(1)}`,
      sel: `${element}[align="${value}"]`,
      selector: `${element}[align="${value}"]`,
      decls: [['display', 'block'], ['text-align', value]],
    })),
  ];
  return { element, dispatch };
}

// ── serialize a rule → CSS text (indented inside @layer rules) ──────
function serializeRule({ sel, decls }) {
  const body = decls.map(([p, v]) => `${p}: ${v};`).join(' ');
  return `  ${sel} { ${body} }`;
}

// ══════════════════════════════════════════════════════════════════
// emitTypographyCss · the typography AXIS → the full shadow CSS file
// ══════════════════════════════════════════════════════════════════
// Layout: provenance header + empty `@layer tokens` (mirrors the hand typography.css ·
// the wrapper reuses the foundation --nuri-type-* via the utility classes · decision 37)
// + `@layer rules` { the SHELL (base · :not(:defined)) THEN the dispatch (muted · align
// in projection order) · shell-first is LOAD-BEARING for the display pair }.
export function emitTypographyCss(axis) {
  const { element, dispatch } = typographyWebProjection(axis);
  const ruleLines = [
    ...shellRules(element).map(serializeRule),
    ...dispatch.map(serializeRule),
  ];

  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · TYPOGRAPHY · GENERATED — DO NOT EDIT BY HAND`,
    ` *`,
    ` * GENERATED from the typography AXIS (packages/spec/pipeline/typography-axis.ts) by`,
    ` * prototype/pipeline/css-preview.js, wired into npm run build -w @nuri/prototype (its`,
    ` * own build · regenerates IN PLACE over prototype/styles/typography.css). This is the`,
    ` * LIVE typography WRAPPER CSS: the pages link it and the web factory styles`,
    ` * nuri-typography with it. decision 2 reversed for the namespace layer (decision 74 ·`,
    ` * executing decision 70 · the L3c flip · N+38 · carved to @nuri/prototype at N+41) —`,
    ` * the hand SoT retired (git-recoverable), the generator is the sole source. WRAPPER`,
    ` * ONLY — the type SCALE (packages/spec/styles/typography.css · the .nuri-type-{step}`,
    ` * utilities → --nuri-type-* primitives · {size, emphasis}) stays CSS-SoT, OUT of scope`,
    ` * (a later token flip). The display order is LOAD-BEARING — the :not(:defined) shell`,
    ` * before the [align] dispatch so a pre-upgrade aligned node resolves display to block.`,
    ` * Re-run npm run build -w @nuri/prototype; freshness gated by`,
    ` * prototype/pipeline/typography-css.test.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `@layer tokens {`,
    `  /* Empty by design (decision 37 · the Stack/Box/Palette/Interactive pattern).`,
    `   * typography reuses the foundation --nuri-type-* primitives via the .nuri-type-`,
    `   * {step} utility classes (styles/typography.css) — no component-token aliasing.`,
    `   * Mirrors the hand typography.css. */`,
    `}`,
    ``,
    `@layer rules {`,
    ruleLines.join('\n'),
    `}`,
    ``,
  ].join('\n');
}
