/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · INTERACTIVE NAMESPACE CSS EMIT (the L3b·2 reversible shadow · decision 70 / 67 / 73)
 * ──────────────────────────────────────────────────────────────────
 * The interactive EFFECT set (pipeline/interactive-effects.ts) → the web interactive
 * namespace CSS. interactive is the SECOND bespoke axis (decision 67 / 73): the
 * structured per-part interaction opt-in (decision 65.3 §6 / 65.4), single-sourced
 * but NOT a Field-table member (box/stack rode the generic resolve-map.ts table at
 * L3.1; interactive has its own bespoke shape · like palette). This is the
 * inverse-spelling of flattenPart (packages/rn/factory/resolve.ts): the RN path
 * realizes the opt-in as STATE PATCHES on a node (`state.pressed &&
 * interactive.pressScale → style.transform = scale`); this writes the
 * `.nuri-interactive[gate]:state` dispatch the CSS pseudo-class cascade resolves.
 *
 * REVERSIBLE SHADOW (the L3.1 / palette discipline · roadmap/N+33-L3b-palette.md):
 * generates to build/css-preview/interactive.css, proven ≡ the hand
 * lib/components/interactive/interactive.css (the parity oracle · pipeline/
 * interactive-css.test.js). NOT wired into `npm run build`; the live web factory,
 * the pages, the recipe layer, and the RN factory (flattenPart) are untouched.
 * decision 2 STANDS for the namespace layer until L3c.
 *
 * ── The dispatch, precisely (the inverse of flattenPart's gate logic) ───────
 *   · affordance · `.nuri-interactive` — cursor + the press transition (automatic).
 *   · focus · `.nuri-interactive:focus-visible` — the brand outline ring (automatic).
 *   · pressScale · `.nuri-interactive[data-press-scale]:active` — the :active scale,
 *     gated so a static surface never matches :active.
 *   · disabledGuard · `.nuri-interactive[aria-disabled="true"]:active` — reverts the
 *     scale to none when disabled. EQUAL specificity to pressScale (0,3,0), so it
 *     wins ONLY by SOURCE ORDER (emitted later · LOAD-BEARING · the brief §5).
 *   · disabledOpacity · `.nuri-interactive:disabled, .nuri-interactive[aria-disabled=
 *     "true"]` — the shared dim (a multi-selector / comma rule · automatic).
 *
 * ── NO SHELL (interactive is the MERGED-NODE axis · 65.3 §6 / B1.5 §4.2) ─
 * Unlike box/stack (custom-element wrappers · display:contents · :not(:defined)
 * skeletons), there is NO <nuri-interactive> element and no interactive.js — the
 * class + the gate attrs land directly ON the painting node (`class="nuri-box
 * nuri-palette nuri-interactive" data-press-scale`). So the emit has no PRE/POST
 * shell, no :not(:defined): every selector is the `.nuri-interactive` class dispatch.
 * The namespaces are disjoint (65.3 §6) so the rule-sets co-exist with no collision.
 *
 * ── The SPELLING (the per-target delta · the SoT-vs-shell line) ─────────────
 * interactive is the THINNEST axis: the SoT carries each declaration VERBATIM (a
 * literal [prop, value] pair, the `var(--nuri-…)` interaction constant inline). There
 * is NO value transform (unlike palette's role-NAME → `var(--nuri-<role>)`, or
 * dimensions' `{ ref }` → `var(--nuri-px-N)`) — the constants are consumed directly
 * (decision 45). The only derivation is the SELECTOR ASSEMBLY: `.nuri-interactive` +
 * the attr gate + the pseudo-state, comma-joined for the multi-selector rule. The
 * property spelling is the hand CSS's (cursor / transition / outline / transform /
 * opacity — no logical→physical remap; these are direct, mechanism-divergent props).
 *
 * loadEffects type-strips + data:-URL imports the .ts SoT (node 20 cannot import a
 * .ts) — reusing dimension-css.js#stripTypes (one strip impl · decision 48): the
 * descriptor-twin / L3.1 / N+31 / C1 / C2 / palette technique. The L3c flip relocates
 * the SoT into @nuri/spec proper and retires the hand CSS.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { stripTypes } from './dimension-css.js';

// ── load the TS SoT (the EFFECT set) ────────────────────────────────
export async function loadEffects(effectsTsPath) {
  const src = await readFile(effectsTsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypes(src)));
  // A strip regression must fail LOUD here, not silently emit garbage.
  const e = mod.effects;
  if (!Array.isArray(e) || e.length === 0) {
    throw new Error('[interactive-css] loadEffects: effects missing/empty (strip regression?)');
  }
  return e;
}

// ── a SelectorPart → its full selector (NO element wrapper · the class IS the node) ──
// `.nuri-interactive` + the optional attr gate + the optional pseudo-state. Both
// absent ⇒ the bare class (affordance).
const BASE = '.nuri-interactive';
export function partToSelector(part) {
  if (part === null || typeof part !== 'object') {
    throw new Error(`[interactive-css] selector part is not an object: ${JSON.stringify(part)}`);
  }
  return BASE + (part.attr ?? '') + (part.state ?? '');
}

// ── an Effect → its rule { sel, decls } ─────────────────────────────
// `sel` is the comma-joined selector list (usually one part · disabledOpacity has
// two). `decls` passes through verbatim (the [prop, value] pairs · no value transform).
export function ruleForEffect(effect) {
  if (!Array.isArray(effect.on) || effect.on.length === 0) {
    throw new Error(`[interactive-css] effect '${effect.name}' has no selector parts`);
  }
  if (!Array.isArray(effect.decls) || effect.decls.length === 0) {
    throw new Error(`[interactive-css] effect '${effect.name}' has no declarations`);
  }
  const sel = effect.on.map(partToSelector).join(', ');
  return { sel, decls: effect.decls };
}

// ── serialize a rule → CSS text (indented inside @layer rules) ──────
function serializeRule({ sel, decls }) {
  const body = decls.map(([p, v]) => `${p}: ${v};`).join(' ');
  return `  ${sel} { ${body} }`;
}

// ══════════════════════════════════════════════════════════════════
// emitInteractiveCss · the EFFECT set → the full shadow CSS file
// ══════════════════════════════════════════════════════════════════
// Layout: provenance header + empty `@layer tokens` (mirrors the hand interactive.css
// · interactive dispatches the shared --nuri-interaction-* / --nuri-focus-ring
// vocabulary directly · decision 37) + `@layer rules` { the effect rules in the
// LOAD-BEARING array order · pressScale strictly before disabledGuard }.
export function emitInteractiveCss(effects) {
  const ruleLines = effects.map(ruleForEffect).map(serializeRule);

  return [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · NAMESPACE CSS · INTERACTIVE · GENERATED · SHADOW · DO NOT EDIT / DO NOT REPOINT`,
    ` *`,
    ` * The L3b·2 reversible shadow (decision 70 · docs/cascade.md L3 · the second`,
    ` * bespoke axis · decision 67 / 73). GENERATED from the interactive EFFECT set`,
    ` * (pipeline/interactive-effects.ts) by pipeline/css-preview.js — the inverse-`,
    ` * spelling of flattenPart (packages/rn/factory/resolve.ts). SHADOW OUTPUT —`,
    ` * proven structurally + computed-style EQUIVALENT to the hand SoT`,
    ` * lib/components/interactive/interactive.css (the parity oracle · pipeline/`,
    ` * interactive-css.test.js), but NOTHING points at this file: the live web factory`,
    ` * + pages still load the hand CSS, and the RN factory realizes these effects as`,
    ` * state patches (flattenPart). It exists to PROVE "one TS effect set → the web`,
    ` * interactive CSS" without flipping anything. The rule order is LOAD-BEARING —`,
    ` * pressScale before disabledGuard so a disabled control's transform resolves to`,
    ` * none (the equal-specificity pair · the order guard proves it). The L3c flip (a`,
    ` * later session) makes this the source and retires the hand CSS + the recipe layer.`,
    ` * NEVER hand-edit — re-run pipeline/css-preview.js.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `@layer tokens {`,
    `  /* Empty by design (decision 37 · the Stack/Box/Palette pattern). interactive`,
    `   * dispatches the shared --nuri-interaction-* / --nuri-focus-ring / --nuri-`,
    `   * duration-fast vocabulary directly in \`@layer rules\`; a --nuri-interactive-*`,
    `   * alias would be useless indirection. Mirrors the hand interactive.css. */`,
    `}`,
    ``,
    `@layer rules {`,
    ruleLines.join('\n'),
    `}`,
    ``,
  ].join('\n');
}
