/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · BUILD (N+42 · A4 · the doc-gen orchestrator · N+43 · A4b axes)
 *
 * Generates the Nuri documentation from the source that owns each public surface:
 * @nuri/spec's DATA exports for authored SoTs, @nuri/rn/generated for the production
 * resolved contract + generated component prop types, and @nuri/prototype/generated
 * for browser-loadable descriptor/token-var twins. Two families:
 *   · COMPONENTS       — API-only pages render from the RN public prop types
 *                        because RN owns the production component consumer API.
 *   · AXES (A4b)       — each of the 5 namespace-axis SoTs → generated/axes/<source>.md
 *                        (the axis IR · axis-ir.js → docs.js#emitAxisPage). The axes
 *                        are the system's spine (box · stack · palette · interactive ·
 *                        typography · decision 73 · 2 agnostic + 3 bespoke).
 *
 * Sources are read as DATA, never by importing spec's pipeline functions:
 *   · API-only props      — from @nuri/rn generated component adapters and factory
 *                           public primitive prop types.
 *   · palette · tokens    — from @nuri/rn/generated/data/{palette,tokens}.ts.
 *   · token-vars          — from @nuri/prototype/generated/token-vars.ts.
 *   · the 5 axis SoTs     — from @nuri/spec/{resolve-map, property-spelling,
 *                           palette-surface, interactive-effects, typography-axis}.
 *
 * Component pages intentionally do not carry authored stories. All output re-emits
 * byte-identical (decision 35 · the doc CI gate).
 *
 * DAG: doc → rn/prototype → spec. The build reads the generated projection contracts
 * deliberately: RN for production API/value surfaces, prototype for browser-loadable
 * descriptor twins + CSS var spelling. @nuri/prototype is also consumed at RUNTIME
 * by the staged site (stage.mjs).
 * ────────────────────────────────────────────────────────────── */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadSpecData, loadDataFromPath } from './strip.js';
import { COMPONENT_API_DOCS, componentApiIrFromFile } from './component-api-ir.js';
import { AXIS_DOCS } from './axis-ir.js';
import { FOUNDATION_DOCS } from './foundations-ir.js';
import { emitComponentApiPage, emitAxisPage, emitFoundationPage, buildDocTokenInputs, makeRoleResolver } from './docs.js';
import { interactiveWebProjection } from '../../prototype/pipeline/parsers/interactive-css.js';
import { typographyWebProjection } from '../../prototype/pipeline/parsers/typography-css.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
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

// ── COMPONENTS · each public component surface → its API-only doc page ──
async function buildComponentDocs() {
  await mkdir(COMPONENTS_OUT, { recursive: true });
  const reports = [];
  for (const spec of COMPONENT_API_DOCS) {
    const ir = await componentApiIrFromFile(spec, REPO_ROOT);
    const out = resolve(COMPONENTS_OUT, `${spec.source}.md`);
    await writeFile(out, emitComponentApiPage(ir), 'utf8');
    const propCount = (ir.types || []).reduce((sum, type) => sum + type.props.length + (type.forbidden || []).length, 0);
    const typeCount = (ir.types || []).length || 1;
    const typeLabel = typeCount === 1 ? 'prop type' : 'prop types';
    const propLabel = propCount === 1 ? 'prop' : 'props';
    reports.push({ family: 'component', source: spec.source, detail: `${typeCount} ${typeLabel} · ${propCount} ${propLabel} · API`, out });
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
  const { opts } = await loadSpecData('interactive-effects');
  const interactiveWeb = interactiveWebProjection(opts);
  const { axis } = await loadSpecData('typography-axis');
  const typographyWeb = typographyWebProjection(axis);
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'data/tokens.ts'));
  const { tokenVars } = await loadDataFromPath(resolve(PROTO_GENERATED, 'token-vars.ts'));
  const d = {
    stackFields: STACK_FIELDS,
    boxFields: BOX_FIELDS,
    registry: PROPERTY_SPELLING,
    surface,
    opts,
    interactiveWeb,
    axis,
    typographyWeb,
    typeSizes: Object.keys(specTokens.type), // the 6 type-step sizes (the `size` axis rows · decision 77)
    roleColor: makeRoleResolver(specTokens, tokenVars),
  };

  await mkdir(AXES_OUT, { recursive: true });
  const reports = [];
  for (const entry of AXIS_DOCS) {
    const ir = entry.build(d);
    const out = resolve(AXES_OUT, `${entry.source}.md`);
    await writeFile(out, emitAxisPage({ ...ir, title: entry.title }, { nav: entry.nav, src: entry.src, lead: entry.lead }), 'utf8');
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
  const specTokens = await loadDataFromPath(resolve(RN_GENERATED, 'data/tokens.ts'));
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
