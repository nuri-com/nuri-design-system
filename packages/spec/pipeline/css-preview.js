/* ══════════════════════════════════════════════════════════════════
 * NURI · NAMESPACE-CSS GENERATOR (the L3 LIVE source · decision 74 · the L3c flip)
 * ──────────────────────────────────────────────────────────────────
 * Generates the LIVE namespace CSS — lib/components/{box,stack,palette,
 * interactive,typography}/<ns>.css — from the TS SoTs:
 *   · box + stack  ← the agnostic Field table (resolve-map.ts) via namespace-css.js
 *                    (L3.1 · "three platforms, one table" · the S1 promise).
 *   · palette      ← the bespoke SURFACE role table (palette-surface.ts) via
 *                    palette-css.js (L3b·1 · the first bespoke axis · decision 67).
 *   · interactive  ← the bespoke EFFECT set (interactive-effects.ts) via
 *                    interactive-css.js (L3b·2 · the second bespoke axis · dec 67/73).
 *   · typography   ← the bespoke AXIS (typography-axis.ts · shell + muted/align) via
 *                    typography-css.js (L3.1b · the third/last bespoke axis · dec 67/73).
 * palette + interactive + typography are NOT NS_SPECs (not Field-table members ·
 * bespoke shapes) — each is a separate call alongside the NS_SPECS loop.
 *
 * WIRED INTO `npm run build` (pipeline/tokens-parser.js · the namespace-CSS slice ·
 * after the Slice-0 token flips, which write the tokens-*.css this reads for the
 * scale vocab). flipNamespaceCss() regenerates the five files IN PLACE over the live
 * lib/components/<ns>/<ns>.css. decision 2 reversed for the namespace layer (decision
 * 74 · executing decision 70 · the L3c flip · N+38): the hand namespace CSS retired
 * (git-recoverable) and the generator is the SOLE source — the pages <link> these
 * files and the web factory (lib/runtime/factory.js) styles the `nuri-*` merged nodes
 * with them. Freshness (re-emit ≡ committed) is gated by
 * pipeline/{css-preview,palette-css,interactive-css,typography-css}.test.js.
 *
 * Standalone regen (equivalent to the build slice):  node pipeline/css-preview.js
 *
 * The Field table + the property-spelling registry (the per-target property NAME ·
 * decision 73 cl.2) are HOMED in @nuri/spec's pipeline/ (N+39 · the rn→spec DAG ·
 * was mis-homed in @nuri/rn through the shadow phase). Read in place + type-stripped
 * (node 20 cannot import the .ts); @nuri/rn imports them via the exports map.
 * ══════════════════════════════════════════════════════════════════ */

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadFieldTable,
  loadRegistry,
  readScaleVocab,
  emitNamespaceCss,
  NS_SPECS,
} from './parsers/namespace-css.js';
import { loadSurface, emitPaletteCss } from './parsers/palette-css.js';
import { loadEffects, emitInteractiveCss } from './parsers/interactive-css.js';
import { loadAxis, emitTypographyCss } from './parsers/typography-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec

// The Field table — homed in @nuri/spec's pipeline/ (N+39 · decision 73 cl.2 / 74 ·
// the rn→spec DAG · was mis-homed in @nuri/rn through the shadow phase). Read in
// place + type-stripped (node 20 cannot import the .ts).
const RESOLVE_MAP = resolve(REPO_ROOT, 'pipeline/resolve-map.ts');
// The property-spelling registry — the per-target property NAME (canonical id →
// { rn, css } · decision 73 cl.2); the web emit reads `.css`. A local pipeline/ SoT.
const REGISTRY_TS = resolve(REPO_ROOT, 'pipeline/property-spelling.ts');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
// The bespoke palette SoT — a local pipeline/ SoT (like dimensions.ts/colours.ts).
const SURFACE_TS = resolve(REPO_ROOT, 'pipeline/palette-surface.ts');
// The bespoke interactive SoT — likewise a local pipeline/ SoT.
const EFFECTS_TS = resolve(REPO_ROOT, 'pipeline/interactive-effects.ts');
// The bespoke typography SoT — likewise a local pipeline/ SoT (the shell + muted/align).
const TYPOGRAPHY_TS = resolve(REPO_ROOT, 'pipeline/typography-axis.ts');
// The LIVE target — regenerated in place over the (retired) hand namespace CSS.
const COMPONENTS_DIR = resolve(REPO_ROOT, 'lib/components');

// Generate the namespace CSS for every NS_SPEC (the agnostic Field-table axes) —
// exported so the test re-runs the SAME generation in-memory (one source, two
// readers · decision 48).
export async function generateAll() {
  const table = await loadFieldTable(RESOLVE_MAP);
  const registry = await loadRegistry(REGISTRY_TS);
  const scaleVocab = await readScaleVocab(SEMANTIC_CSS);
  return NS_SPECS.map((spec) => ({
    ns: spec.ns,
    css: emitNamespaceCss({
      ns: spec.ns,
      title: spec.title,
      fields: table[spec.fieldsKey],
      scaleVocab,
      registry,
    }),
  }));
}

// Generate the palette namespace CSS from the bespoke SURFACE table — exported (like
// generateAll) so palette-css.test.js re-runs the SAME generation in-memory. palette
// is bespoke (decision 67), hence a separate call.
export async function generatePalette() {
  const surface = await loadSurface(SURFACE_TS);
  return { ns: 'palette', css: emitPaletteCss(surface) };
}

// Generate the interactive namespace CSS from the bespoke EFFECT set — exported (like
// generatePalette) so interactive-css.test.js re-runs the SAME generation in-memory.
// interactive is bespoke (decision 67/73), hence a separate call.
export async function generateInteractive() {
  const effects = await loadEffects(EFFECTS_TS);
  return { ns: 'interactive', css: emitInteractiveCss(effects) };
}

// Generate the typography namespace CSS from the bespoke AXIS — exported (like
// generatePalette/generateInteractive) so typography-css.test.js re-runs the SAME
// generation in-memory. typography is bespoke (decision 67/73 · a real element wrapper
// with a shell, unlike palette/interactive's merged node), hence a separate call.
export async function generateTypography() {
  const axis = await loadAxis(TYPOGRAPHY_TS);
  return { ns: 'typography', css: emitTypographyCss(axis) };
}

// Generate ALL five namespace CSS files (box · stack · palette · interactive ·
// typography) in one pass — the single reader for both the build flip and the tests.
export async function generateNamespaceCss() {
  return [
    ...(await generateAll()),
    await generatePalette(),
    await generateInteractive(),
    await generateTypography(),
  ];
}

// flipNamespaceCss · generate the five files and write them IN PLACE over the live
// lib/components/<ns>/<ns>.css. Called by pipeline/tokens-parser.js (the build) and by
// main() (standalone regen). Mirrors the Slice-0 flip* idiom (flipDimensionCss /
// flipColourCss / flipSemanticCss) — the namespace CSS is now a generated projection,
// not a hand source. Returns [{ ns, out }] for the build log.
export async function flipNamespaceCss() {
  const generated = await generateNamespaceCss();
  const reports = [];
  for (const { ns, css } of generated) {
    const out = resolve(COMPONENTS_DIR, ns, `${ns}.css`);
    await writeFile(out, css, 'utf8');
    reports.push({ ns, out });
  }
  return reports;
}

async function main() {
  const reports = await flipNamespaceCss();
  for (const { ns, out } of reports) {
    console.log(`[css-preview] generated namespace CSS '${ns}' (live · in place) → ${out}`);
  }
  console.log(
    `[css-preview] ${reports.length} files regenerated in place · freshness gated by ` +
    `pipeline/{css-preview,palette-css,interactive-css,typography-css}.test.js`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
