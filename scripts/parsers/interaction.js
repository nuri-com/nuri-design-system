/* ──────────────────────────────────────────────────────────────
 * NURI · INTERACTION BASELINE PARSER (Node)
 *
 * The TRANSVERSAL interaction baseline { pressScale · disabledOpacity }
 * (the decision-45 cross-component design constants). Its SoT is now
 * packages/spec/axes/interaction.ts (a tiny pure-data TS module · N+61 · Slice
 * 3b·2b·i) — the values no longer live ONLY in the hand-authored CSS.
 *
 * This module owns the family end to end from the SoT:
 *   · loadInteraction    — imports the TS SoT through the shared TS data loader
 *   · flipInteractionCss — writes the SoT values INTO the --nuri-interaction-*
 *                          declarations in styles/tokens-primitive.css (decision 2
 *                          reversed for the family · the dimension/type-css posture)
 *   · buildInteraction   — the { leaf → literal } record the emit consumes, FROM
 *                          the SoT (no CSS read · projection model §4 · decision 80)
 *   · emitInteractionTs  — packages/rn/generated/data/interaction.ts (the RN runtime's reader · decision 48)
 *
 * ONE source (packages/spec/axes/interaction.ts), THREE faces: the web CSS primitives, the
 * RN generated/data/interaction.ts, and the runtime that reads it (the icon model · decision
 * 48). Was CSS-sourced (the emit read --nuri-interaction-* back out · a TS→CSS→TS
 * round-trip); the SoT flip kills that last round-trip for the family (Smell-1 ·
 * decision 66 arc #0 · classified primitive.interaction in semantic.js).
 * ────────────────────────────────────────────────────────────── */

import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

import { loadTsDataFromPath } from '../ts-data-loader.js';

// leaf identifier → the --nuri-interaction-* primitive it OWNS. Double duty:
// the emit ORDER (byte-stable across builds · the drift guard compares re-emit)
// AND the CSS declaration each leaf flips. pressScale → --nuri-interaction-press-
// scale · disabledOpacity → --nuri-interaction-disabled-opacity.
export const INTERACTION_PRIMITIVES = {
  pressScale:      '--nuri-interaction-press-scale',
  disabledOpacity: '--nuri-interaction-disabled-opacity',
};

// ── load the TS SoT ────────────────────────────────────────────────
export async function loadInteraction(interactionTsPath) {
  const mod = await loadTsDataFromPath(interactionTsPath);
  if (!mod.interaction || typeof mod.interaction !== 'object') {
    throw new Error('[interaction] loadInteraction: `interaction` missing/empty (loader regression?)');
  }
  return mod.interaction;
}

// Validate + stringify the SoT into the { leaf → literal } record the emit
// consumes. The values are bare unitless numbers (0.97 · 0.4) emitted verbatim
// (String(0.97) === '0.97') so the JS literals match the CSS exactly. Throws
// loudly if a leaf goes missing or stops being numeric so a renamed/retyped SoT
// surfaces at build, not in a silent emit.
export function buildInteraction(interaction) {
  const out = {};
  for (const leaf of Object.keys(INTERACTION_PRIMITIVES)) {
    const v = interaction[leaf];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(
        `interaction leaf '${leaf}' is not a finite number (got ${v}). ` +
        `packages/spec/axes/interaction.ts is the cross-component design-constant SoT (decision 45).`,
      );
    }
    out[leaf] = String(v);
  }
  return out;
}

// ── the in-place CSS flip · SoT → tokens-primitive.css ──────────────
// Set every --nuri-interaction-* declaration to its SoT value (verbatim
// everything else · postcss preserves raws), enforcing the drift guard in BOTH
// directions: the SoT must own exactly the --nuri-interaction-* leaves the CSS
// declares. Mirrors type-css.js#rewriteTypeDecls.
export function rewriteInteractionDecls(cssText, interaction) {
  const want = new Map(
    Object.entries(INTERACTION_PRIMITIVES).map(([leaf, cssVar]) => [cssVar, String(interaction[leaf])]),
  );
  const root = postcss.parse(cssText);
  const seen = new Set();
  const cssOwned = new Set();
  root.walkDecls((decl) => {
    if (/^--nuri-interaction-/.test(decl.prop)) cssOwned.add(decl.prop);
    if (!want.has(decl.prop)) return;
    if (seen.has(decl.prop)) {
      throw new Error(`[interaction] ${decl.prop} declared more than once — the SoT must own a single declaration per leaf`);
    }
    seen.add(decl.prop);
    decl.value = want.get(decl.prop);
  });
  const missingInCss = [...want.keys()].filter((p) => !seen.has(p));
  if (missingInCss.length) {
    throw new Error(`[interaction] the SoT declares ${missingInCss.join(', ')} but the CSS has no such declaration — add it to the CSS or remove it from packages/spec/axes/interaction.ts`);
  }
  const orphanInCss = [...cssOwned].filter((p) => !want.has(p));
  if (orphanInCss.length) {
    throw new Error(`[interaction] the CSS declares ${orphanInCss.join(', ')} but packages/spec/axes/interaction.ts does not — the SoT must own every --nuri-interaction-* declaration`);
  }
  return root.toString();
}

// The flip · SoT → tokens-primitive.css, in place (Slice 0 of the build). Returns
// the rewritten string so a caller can reuse it.
export async function flipInteractionCss({ primitivePath, interaction }) {
  const cssText = await readFile(primitivePath, 'utf8');
  const css = rewriteInteractionDecls(cssText, interaction);
  await writeFile(primitivePath, css, 'utf8');
  return css;
}

// Emit the build/interaction.ts source (string). The caller owns the
// file write (mirrors the emitTokensTs / emitTypeTs pattern).
export function emitInteractionTs(interaction) {
  const entries = Object.entries(interaction);
  const width = Math.max(...entries.map(([k]) => k.length)) + 1; // + ':'
  const lines = [
    `/* ──────────────────────────────────────────────────────────────`,
    ` * NURI · INTERACTION BASELINE · GENERATED · DO NOT EDIT BY HAND`,
    ` *`,
    ` * Source · packages/spec/axes/interaction.ts (the interaction baseline SoT)`,
    ` * Emitter · scripts/tokens-parser.js — run \`npm run build\``,
    ` *`,
    ` * The TRANSVERSAL cross-component interaction baseline (decision 45):`,
    ` * the { pressScale · disabledOpacity } design constants, flattened from`,
    ` * the packages/spec/axes/interaction.ts SoT (the SAME values the build flips into the`,
    ` * --nuri-interaction-* CSS primitives · one source, two readers · decision`,
    ` * 48). A single transversal emit — the RN runtime's theme reads it directly,`,
    ` * instead of reaching into a per-component file for a non-component value`,
    ` * (Smell-1 · decision 66 arc #0). NOT a runtime/TokenPath set; the values`,
    ` * are context-invariant.`,
    ` * ────────────────────────────────────────────────────────────── */`,
    ``,
    `export const interaction = {`,
  ];
  for (const [leaf, value] of entries) {
    lines.push(`  ${`${leaf}:`.padEnd(width + 1)} ${value},`);
  }
  lines.push(`} as const;`);
  lines.push('');
  return lines.join('\n');
}
