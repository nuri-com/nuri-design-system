/* ══════════════════════════════════════════════════════════════════
 * NURI · @nuri/prototype · NAMESPACE-CSS GENERATOR (the L3 LIVE source · decision 74)
 * ──────────────────────────────────────────────────────────────────
 * Generates the LIVE namespace CSS — prototype's styles/{box,stack,palette,
 * interactive,typography}.css — from @nuri/spec's TS SoTs:
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
 * POST-FLIP, @nuri/prototype OWNS the namespace-CSS generation (N+41 · the A3 carve ·
 * convergence §5 "each library owns the emitter for its own surface"). WIRED INTO
 * `npm run build -w @nuri/prototype` (this file IS the build script · package.json
 * scripts.build). flipNamespaceCss() regenerates the five files IN PLACE over
 * prototype's styles/<ns>.css; the re-emit is byte-identical to the pre-carve
 * lib/components/<ns>/<ns>.css the flip (decision 74 · N+38) generated in @nuri/spec.
 * decision 2 stays reversed for the namespace layer — the generator is the SOLE source;
 * the pages <link> these files and the web factory (factory/factory.js) styles the
 * `nuri-*` merged nodes with them. Freshness (re-emit ≡ committed) is gated by
 * pipeline/{css-preview,palette-css,interactive-css,typography-css}.test.js.
 *
 * Standalone regen (equivalent to the build):  node pipeline/css-preview.js
 *
 * The five axis SoTs live in @nuri/spec (the data root · DAG: prototype → spec). They
 * are read across the package boundary via the spec EXPORTS MAP (import.meta.resolve)
 * + imported through the shared TS data loader. The scale vocab
 * rides spec's generated styles/tokens-semantic.css (read via the spec package root).
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
import { loadInteractive, emitInteractiveCss } from './parsers/interactive-css.js';
import { loadAxis, emitTypographyCss } from './parsers/typography-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..'); // packages/prototype

// The five axis SoTs are @nuri/spec DATA — resolved across the package boundary via the
// spec EXPORTS MAP (the declared cross-package contract · N+41 · the A3 carve · convergence
// §5 "prototype reads spec's data"). import.meta.resolve honours `exports`; the loaders read
// each .ts through the shared TS data loader. resolve-map +
// property-spelling were already exported (N+39 · the rn→spec DAG); palette-surface /
// interactive-effects / typography-axis were added at A3 for THIS reader.
const specPath = (subpath) => fileURLToPath(import.meta.resolve(subpath));
const RESOLVE_MAP = specPath('@nuri/spec/resolve-map');         // the box/stack Field table
const REGISTRY_TS = specPath('@nuri/spec/property-spelling');   // the per-target property NAME (.css column)
const SURFACE_TS = specPath('@nuri/spec/palette-surface');      // the bespoke palette SURFACE role table
const EFFECTS_TS = specPath('@nuri/spec/interactive-effects');  // the bespoke interactive EFFECT set
const TYPOGRAPHY_TS = specPath('@nuri/spec/typography-axis');   // the bespoke typography AXIS (shell + muted/align)
// The scale vocab is the GENERATED token CSS (--nuri-{space,size,radius}-* leaves). It is
// this prototype projection's OWN output now (N+62 · decision 80 · was @nuri/spec's styles/);
// the codegen (root scripts/) writes it into generated/styles/, this build reads it back.
const SEMANTIC_CSS = resolve(PKG_ROOT, 'generated/styles/tokens-semantic.css');
// The LIVE target — the 5 generated namespace CSS, written into prototype's own styles/
// (post-flip prototype OWNS the namespace CSS · decision 74 · was lib/components/<ns>/<ns>.css
// in spec before the A3 carve · the re-emit is byte-identical to those pre-carve files).
const STYLES_DIR = resolve(PKG_ROOT, 'styles');

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
  const sot = await loadInteractive(EFFECTS_TS);
  return { ns: 'interactive', css: emitInteractiveCss(sot) };
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
    const out = resolve(STYLES_DIR, `${ns}.css`);
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
