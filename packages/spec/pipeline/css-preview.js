/* ══════════════════════════════════════════════════════════════════
 * NURI · CSS-PREVIEW RUNNER (the L3 reversible shadow · decision 70)
 * ──────────────────────────────────────────────────────────────────
 * Generates the SHADOW namespace CSS — build/css-preview/{box,stack,palette}.css —
 * from the TS SoTs:
 *   · box + stack  ← the agnostic Field table (resolve-map.ts) via namespace-css.js
 *                    (L3.1 · "three platforms, one table" · the S1 promise).
 *   · palette      ← the bespoke SURFACE role table (palette-surface.ts) via
 *                    palette-css.js (L3b·1 · the first bespoke axis · decision 67).
 * palette is NOT an NS_SPEC (not a Field-table member · bespoke shape) — it is a
 * separate call alongside the NS_SPECS loop.
 *
 * STANDALONE · NOT wired into `npm run build` — nothing live changes (the shadow
 * anti-goal). Run on demand:  node pipeline/css-preview.js
 * The committed output is GUARDED (re-emit freshness) and PROVEN ≡ the hand CSS by
 * pipeline/css-preview.test.js (box/stack) + pipeline/palette-css.test.js (palette).
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec

// The Field table — mis-homed in @nuri/rn (the shadow shim · cascade.md: belongs
// in @nuri/spec · the L3 flip relocates it). Read cross-package + type-stripped.
const RESOLVE_MAP = resolve(REPO_ROOT, '../rn/factory/resolve-map.ts');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
// The bespoke palette SoT — a local pipeline/ SoT (like dimensions.ts/colours.ts).
const SURFACE_TS = resolve(REPO_ROOT, 'pipeline/palette-surface.ts');
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

async function main() {
  const generated = [...(await generateAll()), await generatePalette()];
  await mkdir(OUT_DIR, { recursive: true });
  for (const { ns, css } of generated) {
    const out = resolve(OUT_DIR, `${ns}.css`);
    await writeFile(out, css, 'utf8');
    console.log(`[css-preview] generated namespace CSS '${ns}' (shadow) → ${out}`);
  }
  console.log(`[css-preview] ${generated.length} files · proven ≡ the hand CSS by pipeline/{css-preview,palette-css}.test.js`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
