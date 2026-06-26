/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · BUILD (N+42 · A4 · the doc-gen orchestrator)
 *
 * Generates the component documentation: each frozen @nuri/spec descriptor →
 * a just-the-docs Markdown page under generated/components/<source>.md. This
 * is the pre-A4 pipeline's Slice 9, moved OUT of @nuri/spec and re-sourced onto
 * @nuri/spec's DATA exports (convergence §5 · decision 75 · "spec emits data,
 * doc transforms data → Markdown"):
 *   · the descriptor IR  — from @nuri/spec/descriptors/<name> (the browser-ESM
 *                          twin · node-importable · still emitted by @nuri/spec).
 *   · palette · tokens ·  — from @nuri/spec/{palette, tokens, token-vars} via the
 *     token-vars             DATA loader (strip.js), NOT the classifier internals.
 *
 * The <nuri-demo> STORY is authored in _includes/demo/<source>.html (decision
 * 57.2 · NOT generated); the page carries only an `## Example` include slot. The
 * output re-emits byte-identical (decision 35 · the doc CI gate).
 *
 * DAG: doc → prototype → spec. The build reads @nuri/spec only (the descriptor
 * twins + the data exports); @nuri/prototype is consumed at RUNTIME (the staged
 * site · stage.mjs), not here.
 * ────────────────────────────────────────────────────────────── */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadSpecData } from './strip.js';
import { docIrFromDescriptor, exportNameFor, DOC_COMPONENTS } from './descriptor-ir.js';
import { emitDocPage, buildDocTokenInputs } from './docs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_ROOT = resolve(__dirname, '..');
const GENERATED_OUT = resolve(DOC_ROOT, 'generated/components');

// The descriptor browser-ESM twins (.js · node-importable · still emitted by
// @nuri/spec's Slice 7 · also consumed by @nuri/prototype's recipes). Read by a
// cross-package relative path — the build-free precedent (@nuri/prototype's
// recipes import the same `../../spec/build/descriptors/<name>.js`).
const SPEC_DESCRIPTORS = resolve(__dirname, '../../spec/build/descriptors');

export async function buildDocs() {
  // The @nuri/spec DATA the value enrichment reads (the boundary · convergence §5).
  const specTokens = await loadSpecData('tokens');
  const { tokenVars } = await loadSpecData('token-vars');
  const { palette } = await loadSpecData('palette');
  const { tokens, colors } = buildDocTokenInputs(specTokens, tokenVars);

  await mkdir(GENERATED_OUT, { recursive: true });
  const reports = [];
  for (const spec of DOC_COMPONENTS) {
    const twin = pathToFileURL(resolve(SPEC_DESCRIPTORS, `${spec.name}.js`)).href;
    const descriptor = (await import(twin))[exportNameFor(spec.name)];
    const ir = docIrFromDescriptor(spec, descriptor);
    const out = resolve(GENERATED_OUT, `${spec.source}.md`);
    await writeFile(out, emitDocPage(ir, { palette, tokens, colors }), 'utf8');
    reports.push({ source: spec.source, axes: Object.keys(ir.axes).length, out });
  }
  return reports;
}

async function main() {
  const reports = await buildDocs();
  console.log(
    reports
      .map((r) => `[doc] wrote '${r.source}' (${r.axes} ${r.axes === 1 ? 'axis' : 'axes'} · generated) → ${r.out}`)
      .join('\n'),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
