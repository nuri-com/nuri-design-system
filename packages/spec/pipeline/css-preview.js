/* ══════════════════════════════════════════════════════════════════
 * NURI · CSS-PREVIEW RUNNER (the L3.1 reversible spike · decision 70)
 * ──────────────────────────────────────────────────────────────────
 * Generates the SHADOW namespace CSS — build/css-preview/box.css + stack.css —
 * from the Field table (resolve-map.ts) via the namespace-css.js emitter. The
 * web emit S1 promised ("three platforms, one table"), built at last (L3 step 1).
 *
 * STANDALONE · NOT wired into `npm run build` — nothing live changes (the spike
 * anti-goal). Run on demand:  node pipeline/css-preview.js
 * The committed output is GUARDED by pipeline/css-preview.test.js (re-emit
 * freshness · the Guard-D posture) and PROVEN ≡ the hand CSS there.
 *
 * The hand lib/components/<ns>/<ns>.css is the parity ORACLE (untouched · still
 * the live SoT · decision 2 stands until the L3 flip). This writes ONLY under
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..'); // packages/spec

// The Field table — mis-homed in @nuri/rn (the spike shim · cascade.md: belongs
// in @nuri/spec · the L3 flip relocates it). Read cross-package + type-stripped.
const RESOLVE_MAP = resolve(REPO_ROOT, '../rn/factory/resolve-map.ts');
const SEMANTIC_CSS = resolve(REPO_ROOT, 'styles/tokens-semantic.css');
const OUT_DIR = resolve(REPO_ROOT, 'build/css-preview');

// Generate the shadow CSS for every NS_SPEC — exported so the test re-runs the
// SAME generation in-memory (one source, two readers · decision 48).
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

async function main() {
  const generated = await generateAll();
  await mkdir(OUT_DIR, { recursive: true });
  for (const { ns, css } of generated) {
    const out = resolve(OUT_DIR, `${ns}.css`);
    await writeFile(out, css, 'utf8');
    console.log(`[css-preview] generated namespace CSS '${ns}' (shadow) → ${out}`);
  }
  console.log(`[css-preview] ${generated.length} files · proven ≡ the hand CSS by pipeline/css-preview.test.js`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
