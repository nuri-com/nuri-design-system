/* ══════════════════════════════════════════════════════════════════
 * NURI · CSS-PREVIEW RUNNER (the L3 reversible shadow · decision 70)
 * ──────────────────────────────────────────────────────────────────
 * Generates the SHADOW namespace CSS — build/css-preview/{box,stack,palette,
 * interactive,typography}.css — from the TS SoTs:
 *   · box + stack  ← the agnostic Field table (resolve-map.ts) via namespace-css.js
 *                    (L3.1 · "three platforms, one table" · the S1 promise).
 *   · palette      ← the bespoke SURFACE role table (palette-surface.ts) via
 *                    palette-css.js (L3b·1 · the first bespoke axis · decision 67).
 *   · interactive  ← the bespoke EFFECT set (interactive-effects.ts) via
 *                    interactive-css.js (L3b·2 · the second bespoke axis · dec 67/73).
 *   · typography   ← the bespoke AXIS (typography-axis.ts · shell + muted/align) via
 *                    typography-css.js (L3.1b · the third/last bespoke axis · dec 67/73).
 * palette + interactive + typography are NOT NS_SPECs (not Field-table members · bespoke
 * shapes) — each is a separate call alongside the NS_SPECS loop.
 *
 * STANDALONE · NOT wired into `npm run build` — nothing live changes (the shadow
 * anti-goal). Run on demand:  node pipeline/css-preview.js
 * The committed output is GUARDED (re-emit freshness) and PROVEN ≡ the hand CSS by
 * pipeline/css-preview.test.js (box/stack) + pipeline/palette-css.test.js (palette) +
 * pipeline/interactive-css.test.js (interactive).
 *
 * The hand lib/components/<ns>/<ns>.css is the parity ORACLE (untouched · still
 * the live SoT · decision 2 stands until the L3c flip). This writes ONLY under
 * build/css-preview/; it repoints nothing.
 * ══════════════════════════════════════════════════════════════════ */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadFieldTable,
  readScaleVocab,
  emitNamespaceCss,
  NS_SPECS,
} from './parsers/namespace-css.js';
import { loadSurface, emitPaletteCss } from './parsers/palette-css.js';
import { loadEffects, emitInteractiveCss } from './parsers/interactive-css.js';
import { loadAxis, emitTypographyCss } from './parsers/typography-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec

// The Field table — mis-homed in @nuri/rn (the shadow shim · cascade.md: belongs
// in @nuri/spec · the L3 flip relocates it). Read cross-package + type-stripped.
const RESOLVE_MAP = resolve(REPO_ROOT, '../rn/factory/resolve-map.ts');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
// The bespoke palette SoT — a local pipeline/ SoT (like dimensions.ts/colours.ts).
const SURFACE_TS = resolve(REPO_ROOT, 'pipeline/palette-surface.ts');
// The bespoke interactive SoT — likewise a local pipeline/ SoT.
const EFFECTS_TS = resolve(REPO_ROOT, 'pipeline/interactive-effects.ts');
// The bespoke typography SoT — likewise a local pipeline/ SoT (the shell + muted/align).
const TYPOGRAPHY_TS = resolve(REPO_ROOT, 'pipeline/typography-axis.ts');
const OUT_DIR = resolve(REPO_ROOT, 'build/css-preview');

// Generate the shadow CSS for every NS_SPEC (the agnostic Field-table axes) —
// exported so the test re-runs the SAME generation in-memory (one source, two
// readers · decision 48).
export async function generateAll() {
  const table = await loadFieldTable(RESOLVE_MAP);
  const scaleVocab = await readScaleVocab(SEMANTIC_CSS);
  return NS_SPECS.map((spec) => ({
    ns: spec.ns,
    css: emitNamespaceCss({
      ns: spec.ns,
      title: spec.title,
      fields: table[spec.fieldsKey],
      scaleVocab,
    }),
  }));
}

// Generate the SHADOW palette namespace CSS from the bespoke SURFACE table —
// exported (like generateAll) so palette-css.test.js re-runs the SAME generation
// in-memory. palette is bespoke (decision 67), hence a separate call.
export async function generatePalette() {
  const surface = await loadSurface(SURFACE_TS);
  return { ns: 'palette', css: emitPaletteCss(surface) };
}

// Generate the SHADOW interactive namespace CSS from the bespoke EFFECT set —
// exported (like generatePalette) so interactive-css.test.js re-runs the SAME
// generation in-memory. interactive is bespoke (decision 67/73), hence a separate call.
export async function generateInteractive() {
  const effects = await loadEffects(EFFECTS_TS);
  return { ns: 'interactive', css: emitInteractiveCss(effects) };
}

// Generate the SHADOW typography namespace CSS from the bespoke AXIS — exported (like
// generatePalette/generateInteractive) so typography-css.test.js re-runs the SAME
// generation in-memory. typography is bespoke (decision 67/73 · a real element wrapper
// with a shell, unlike palette/interactive's merged node), hence a separate call.
export async function generateTypography() {
  const axis = await loadAxis(TYPOGRAPHY_TS);
  return { ns: 'typography', css: emitTypographyCss(axis) };
}

async function main() {
  const generated = [
    ...(await generateAll()),
    await generatePalette(),
    await generateInteractive(),
    await generateTypography(),
  ];
  await mkdir(OUT_DIR, { recursive: true });
  for (const { ns, css } of generated) {
    const out = resolve(OUT_DIR, `${ns}.css`);
    await writeFile(out, css, 'utf8');
    console.log(`[css-preview] generated namespace CSS '${ns}' (shadow) → ${out}`);
  }
  console.log(`[css-preview] ${generated.length} files · proven ≡ the hand CSS by pipeline/{css-preview,palette-css,interactive-css,typography-css}.test.js`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
