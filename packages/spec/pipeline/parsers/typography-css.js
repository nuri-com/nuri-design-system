/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · TYPOGRAPHY NAMESPACE CSS EMIT (the L3.1b reversible shadow · decision 70 / 67 / 73)
 * ──────────────────────────────────────────────────────────────────
 * The typography AXIS (pipeline/typography-axis.ts) → the web typography namespace
 * CSS. typography is the THIRD and LAST bespoke axis (decision 73 corrected dec 70:
 * bespoke, not agnostic): a thin <nuri-typography> WRAPPER for declarative muted/align
 * authoring, single-sourced but NOT a Field-table member (box/stack rode the generic
 * resolve-map.ts table at L3.1; typography is a type-STEP ref in resolve.ts, bespoke ·
 * like palette/interactive). This is the inverse-spelling of the wrapper's intent: the
 * RN path realizes muted → a Text colour + align → Text style textAlign (decision 59);
 * this writes the `nuri-typography[…]` element dispatch the CSS cascade resolves.
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
 *   · DISPATCH (the SoT · pipeline/typography-axis.ts):
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
 * typography (like interactive) carries each declaration VERBATIM (a literal
 * [prop, value] pair · the var(--nuri-text-muted) ref inline). There is NO value
 * transform (unlike palette's role-NAME → var(--nuri-<role>), or dimensions' { ref } →
 * var(--nuri-px-N)) — the property spelling is the hand CSS's (color / display /
 * text-align · direct props · no logical→physical remap). The only derivation is the
 * SELECTOR ASSEMBLY: `${element}${attr}` (the attr gate spelled by the SoT) + the
 * emitter's shell.
 *
 * loadAxis type-strips + data:-URL imports the .ts SoT (node 20 cannot import a .ts) —
 * reusing dimension-css.js#stripTypes (one strip impl · decision 48): the descriptor-
 * twin / L3.1 / N+31 / C1 / C2 / palette / interactive technique. The L3c flip relocates
 * the SoT into @nuri/spec proper and retires the hand CSS.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { stripTypes } from './dimension-css.js';

// ── load the TS SoT (the typography AXIS) ───────────────────────────
export async function loadAxis(axisTsPath) {
  const src = await readFile(axisTsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypes(src)));
  // A strip regression must fail LOUD here, not silently emit garbage.
  const a = mod.axis;
  if (
    !a || typeof a !== 'object' ||
    typeof a.element !== 'string' || !a.element ||
    !Array.isArray(a.dispatch) || a.dispatch.length === 0
  ) {
    throw new Error('[typography-css] loadAxis: axis missing element/dispatch (strip regression?)');
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

// ── a dispatch Rule → its CSS rule { sel, decls } ───────────────────
// sel = the element + the attr gate VERBATIM (`[data-muted]` presence OR `[align="v"]`
// equality · the SoT spells each · decision 53 / 59). decls pass through verbatim (the
// [prop, value] pairs · no value transform · the interactive precedent).
export function ruleForDispatch(element, rule) {
  if (typeof rule.attr !== 'string' || !rule.attr) {
    throw new Error(`[typography-css] dispatch rule '${rule.name}' has no attr gate`);
  }
  if (!Array.isArray(rule.decls) || rule.decls.length === 0) {
    throw new Error(`[typography-css] dispatch rule '${rule.name}' has no declarations`);
  }
  return { sel: `${element}${rule.attr}`, decls: rule.decls };
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
// in array order) · shell-first is LOAD-BEARING for the display pair }.
export function emitTypographyCss(axis) {
  const { element, dispatch } = axis;
  const ruleLines = [
    ...shellRules(element).map(serializeRule),
    ...dispatch.map((rule) => ruleForDispatch(element, rule)).map(serializeRule),
  ];

  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · TYPOGRAPHY · GENERATED · SHADOW · DO NOT EDIT / DO NOT REPOINT`,
    ` *`,
    ` * The L3.1b reversible shadow (decision 70 · docs/cascade.md L3 · the third and`,
    ` * LAST bespoke axis · decision 67 / 73). GENERATED from the typography AXIS`,
    ` * (pipeline/typography-axis.ts) by pipeline/css-preview.js. SHADOW OUTPUT — proven`,
    ` * structurally + computed-style EQUIVALENT to the hand SoT`,
    ` * lib/components/typography/typography.css (the parity oracle · pipeline/`,
    ` * typography-css.test.js), but NOTHING points at this file: the live web factory +`,
    ` * pages still load the hand CSS, and the RN factory realizes muted/align as Text`,
    ` * style (typeStyle · resolve.ts). It exists to PROVE "one TS axis → the web`,
    ` * typography wrapper CSS" without flipping anything. This is the WRAPPER ONLY — the`,
    ` * type SCALE (styles/typography.css · the .nuri-type-{step} utilities → --nuri-type-*`,
    ` * primitives · {size, emphasis}) is a separate TOKEN layer, still CSS-SoT, OUT of`,
    ` * scope (a later token flip). The display order is LOAD-BEARING — the :not(:defined)`,
    ` * shell before the [align] dispatch so a pre-upgrade aligned node resolves display to`,
    ` * block (the equal-specificity pair · the order guard proves it). The L3c flip (a`,
    ` * later session) makes this the source and retires the hand CSS + the recipe layer.`,
    ` * NEVER hand-edit — re-run pipeline/css-preview.js.`,
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
