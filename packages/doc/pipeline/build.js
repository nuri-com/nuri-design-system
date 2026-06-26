/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · BUILD (N+42 · A4 · the doc-gen orchestrator · N+43 · A4b axes)
 *
 * Generates the Nuri documentation from @nuri/spec's DATA exports (convergence §5 ·
 * decision 75 · "spec emits data, doc transforms data → Markdown"). Two families,
 * each a frozen @nuri/spec SoT → a just-the-docs Markdown page:
 *   · COMPONENTS (A4)  — each descriptor → generated/components/<source>.md (the
 *                        descriptor IR · descriptor-ir.js → docs.js#emitDocPage).
 *   · AXES (A4b)       — each of the 5 namespace-axis SoTs → generated/axes/<source>.md
 *                        (the axis IR · axis-ir.js → docs.js#emitAxisPage). The axes
 *                        are the system's spine (box · stack · palette · interactive ·
 *                        typography · decision 73 · 2 agnostic + 3 bespoke).
 *
 * All sources are @nuri/spec DATA, read in node via the strip.js loader (node 20
 * cannot import a .ts · NEVER spec's pipeline functions):
 *   · the descriptor IR  — from @nuri/spec/descriptors/<name> (the browser-ESM twin).
 *   · palette · tokens ·  — from @nuri/spec/{palette, tokens, token-vars}.
 *     token-vars
 *   · the 5 axis SoTs     — from @nuri/spec/{resolve-map, property-spelling,
 *                           palette-surface, interactive-effects, typography-axis}.
 *
 * The <nuri-demo> STORY (components only) is authored in _includes/demo/<source>.html
 * (decision 57.2 · NOT generated); the page carries an `## Example` include slot. All
 * output re-emits byte-identical (decision 35 · the doc CI gate).
 *
 * DAG: doc → prototype → spec. The build reads @nuri/spec only (the descriptor twins +
 * the data exports); @nuri/prototype is consumed at RUNTIME (the staged site · stage.mjs).
 * ────────────────────────────────────────────────────────────── */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadSpecData } from './strip.js';
import { docIrFromDescriptor, exportNameFor, DOC_COMPONENTS } from './descriptor-ir.js';
import { AXIS_DOCS } from './axis-ir.js';
import { emitDocPage, emitAxisPage, buildDocTokenInputs, makeRoleResolver } from './docs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_ROOT = resolve(__dirname, '..');
const COMPONENTS_OUT = resolve(DOC_ROOT, 'generated/components');
const AXES_OUT = resolve(DOC_ROOT, 'generated/axes');

// The descriptor browser-ESM twins (.js · node-importable · still emitted by
// @nuri/spec's Slice 7 · also consumed by @nuri/prototype's recipes). Read by a
// cross-package relative path — the build-free precedent (@nuri/prototype's
// recipes import the same `../../spec/build/descriptors/<name>.js`).
const SPEC_DESCRIPTORS = resolve(__dirname, '../../spec/build/descriptors');

// ── COMPONENTS · each frozen descriptor → its doc page (the A4 family) ──
async function buildComponentDocs() {
  const specTokens = await loadSpecData('tokens');
  const { tokenVars } = await loadSpecData('token-vars');
  const { palette } = await loadSpecData('palette');
  const { tokens, colors } = buildDocTokenInputs(specTokens, tokenVars);

  await mkdir(COMPONENTS_OUT, { recursive: true });
  const reports = [];
  for (const spec of DOC_COMPONENTS) {
    const twin = pathToFileURL(resolve(SPEC_DESCRIPTORS, `${spec.name}.js`)).href;
    const descriptor = (await import(twin))[exportNameFor(spec.name)];
    const ir = docIrFromDescriptor(spec, descriptor);
    const out = resolve(COMPONENTS_OUT, `${spec.source}.md`);
    await writeFile(out, emitDocPage(ir, { palette, tokens, colors }), 'utf8');
    reports.push({ family: 'component', source: spec.source, detail: `${Object.keys(ir.axes).length} axes`, out });
  }
  return reports;
}

// ── AXES · each of the 5 namespace-axis SoTs → its doc page (the A4b family) ──
async function buildAxisDocs() {
  // The data bag the axis-IR builders read (axis-ir.js#AXIS_DOCS · each build(d) is
  // a pure function of it · the SAME bag Guard G feeds). The agnostic Field table +
  // the per-target spelling registry; the 3 bespoke SoTs; the palette role resolver
  // (the ONLY axis that resolves tokens · reuses the N+22 colour resolver).
  const { STACK_FIELDS, BOX_FIELDS } = await loadSpecData('resolve-map');
  const { PROPERTY_SPELLING } = await loadSpecData('property-spelling');
  const { surface } = await loadSpecData('palette-surface');
  const { effects } = await loadSpecData('interactive-effects');
  const { axis } = await loadSpecData('typography-axis');
  const specTokens = await loadSpecData('tokens');
  const { tokenVars } = await loadSpecData('token-vars');
  const d = {
    stackFields: STACK_FIELDS,
    boxFields: BOX_FIELDS,
    registry: PROPERTY_SPELLING,
    surface,
    effects,
    axis,
    roleColor: makeRoleResolver(specTokens, tokenVars),
  };

  await mkdir(AXES_OUT, { recursive: true });
  const reports = [];
  for (const entry of AXIS_DOCS) {
    const ir = entry.build(d);
    const out = resolve(AXES_OUT, `${entry.source}.md`);
    await writeFile(out, emitAxisPage(ir, { nav: entry.nav, src: entry.src, lead: entry.lead }), 'utf8');
    reports.push({ family: 'axis', source: entry.source, detail: ir.kind, out });
  }
  return reports;
}

export async function buildDocs() {
  return [...(await buildComponentDocs()), ...(await buildAxisDocs())];
}

async function main() {
  const reports = await buildDocs();
  console.log(
    reports
      .map((r) => `[doc] wrote ${r.family} '${r.source}' (${r.detail} · generated) → ${r.out}`)
      .join('\n'),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
