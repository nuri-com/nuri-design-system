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

import { loadSpecData, loadDataFromPath } from './strip.js';
import { docIrFromDescriptor, exportNameFor, DOC_COMPONENTS } from './descriptor-ir.js';
import { AXIS_DOCS } from './axis-ir.js';
import { FOUNDATION_DOCS } from './foundations-ir.js';
import { emitDocPage, emitAxisPage, emitFoundationPage, buildDocTokenInputs, makeRoleResolver } from './docs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_ROOT = resolve(__dirname, '..');
const COMPONENTS_OUT = resolve(DOC_ROOT, 'generated/components');
const AXES_OUT = resolve(DOC_ROOT, 'generated/axes');
const FOUNDATIONS_OUT = resolve(DOC_ROOT, 'generated/foundations');

// The generated artifacts left @nuri/spec for the two PROJECTIONS at N+62 (the infra
// exit · decision 80): the RN contract (tokens · palette → @nuri/rn/generated/) and the
// web output (the descriptor twins · token-var registry → @nuri/prototype/generated/).
// doc reads each from the projection that OWNS it, by cross-package relative path — the
// build-free precedent (the recipes import the same prototype/generated descriptor twins).
const RN_GENERATED = resolve(__dirname, '../../rn/generated');
const PROTO_GENERATED = resolve(__dirname, '../../prototype/generated');
const SPEC_DESCRIPTORS = resolve(PROTO_GENERATED, 'descriptors');

// ── COMPONENTS · each frozen descriptor → its doc page (the A4 family) ──
async function buildComponentDocs() {
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const { palette } = await loadDataFromPath(resolve(RN_GENERATED, 'palette.ts'));
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
  const { opts, webChrome, webOrder } = await loadSpecData('interactive-effects');
  const { axis } = await loadSpecData('typography-axis');
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const d = {
    stackFields: STACK_FIELDS,
    boxFields: BOX_FIELDS,
    registry: PROPERTY_SPELLING,
    surface,
    opts,
    webChrome,
    webOrder,
    axis,
    typeSizes: Object.keys(specTokens.type), // the 6 type-step sizes (the `size` axis rows · decision 77)
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

// ── FOUNDATIONS · each token SoT → its doc page (the A4c family · decision 75's 3rd
// family). The token vocabulary is the cascade's BASE (L1 primitives → L2 the accent×
// theme matrix) the axis pages reference by name. Reads the two TS SoTs (dimensions ·
// colours · the additive exports) + the resolved tokens/role-resolver (the SAME reads
// the component/axis pages use). The pages are AGNOSTIC resolving-value tables. ──
async function buildFoundationDocs() {
  const dimensions = await loadSpecData('dimensions');
  const colours = await loadSpecData('colours');
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const { tokens } = buildDocTokenInputs(specTokens, tokenVars);
  const d = {
    dimensions, // { px, space, size, radius } · the L1 + L2 dimension SoT
    colours, // { neutralScales, lilac, blackAlpha, whiteAlpha, chrome, accent } · the colour SoT
    tokens, // the resolved px scales (px-suffixed) + the type composite + emphasisWeight
    roleColor: makeRoleResolver(specTokens, tokenVars), // a semantic role → { var, hex }
  };

  await mkdir(FOUNDATIONS_OUT, { recursive: true });
  const reports = [];
  for (const entry of FOUNDATION_DOCS) {
    const ir = entry.build(d);
    const out = resolve(FOUNDATIONS_OUT, `${entry.source}.md`);
    await writeFile(out, emitFoundationPage(ir, { nav: entry.nav, src: entry.src, lead: entry.lead }), 'utf8');
    reports.push({ family: 'foundation', source: entry.source, detail: ir.kind, out });
  }
  return reports;
}

export async function buildDocs() {
  return [...(await buildComponentDocs()), ...(await buildAxisDocs()), ...(await buildFoundationDocs())];
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
