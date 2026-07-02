/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · BAKED GEOMETRY RECIPE EMIT (Arc 2 · D11 + D5 · geometry bake)
 * ──────────────────────────────────────────────────────────────────
 * The RN projection's BUILD-TIME geometry bake. box/stack/typography/interactive
 * are STATIC — a pure function of the descriptor + selection, ZERO theme/state
 * input — yet the RN factory re-resolved them every render (`flattenPart` per
 * part + per press · D11). This emitter resolves the box/stack GEOMETRY ONCE at
 * build into `packages/rn/generated/data/recipes.ts`; the runtime LOADS + composes it
 * (`flattenBakedPart` · runtime/resolve.ts). It PROMOTES the old test-only
 * `toUnistylesRecipe` precompute (D5), reshaped COLOUR-FREE.
 *
 * ── WHAT IS BAKED (per part · base + per axis/value) ───────────────
 *   · geometry     box ⊕ stack resolved to CONCRETE ViewStyle (colour SKIPPED).
 *   · typography   the RAW { size?, emphasis? } namespace PARTIAL (NOT a resolved
 *                  ref) — merged at runtime (mergeNS semantics · base ⊕ variants,
 *                  field-level, later wins) THEN resolved to the type ref, so an
 *                  emphasis-only variant over a base `size` composes faithfully.
 *   · interactive  the RAW { pressColor?, pressScale?, disabledOpacity? } opt-in
 *                  (booleans · colour-free) — carried through the SAME base/variant
 *                  channel so SELECTION-DEPENDENT interactivity is preserved (a
 *                  variant that opts a node into an effect is honoured, not dropped).
 * Both typography + interactive are baked as MERGEABLE PARTIALS and realized at
 * runtime by the SAME appliers the runtime resolver uses (typeStyle · flatten-
 * Interactive) — single source, so the bake cannot diverge from resolveNS's merge.
 *
 * ── THE TOOLCHAIN SEAM (stated · brief §Open seams) ────────────────
 * The bake reuses the SINGLE-SOURCED namespace→style MAPPING (@nuri/spec's
 * resolve-map STACK_FIELDS/BOX_FIELDS + property-spelling `.rn` + the dimension
 * scales), applied by a Node port of resolve.ts's `applyFields`. This is the
 * documented NODE-REIMPL fallback the brief sanctions, NOT a second copy of the
 * mapping: it is the RN twin of the web geometry emit (prototype/pipeline/parsers/
 * namespace-css.js, which applies the SAME tables in Node to emit box.css/stack.css).
 * Node 20 cannot run the TS resolver (no tsx/esbuild · the deliberate node-20 +
 * TS-data loader. The applier interpreter is ~30 lines; the KNOWLEDGE (the field
 * tables + spellings + scales) is single-sourced in spec. The oracle-equivalence
 * guard (packages/rn/__tests__/geometry-bake.test.ts · full node + style)
 * binds this emit byte-for-byte to the TS runtime resolver, mutation-proven — so a
 * drift between the two appliers fails CI, not silently ships. The generator's own
 * generality (variant-level interactive · emphasis-only typography) is pinned by
 * scripts/recipes.test.js.
 *
 * ── DENSITY SEAM (design, don't build · P11) ───────────────────────
 * The pipeline stays shaped as `descriptor refs × scale table → baked geometry`
 * (NOT hand-authored numbers): `applyFieldsNode` reads px from the `scales` table,
 * so a future `density` axis becomes `scale-table-selected-by-density → geometry
 * ByDensity` WITHOUT touching descriptors. Not implemented; just not foreclosed.
 *
 * The values are UNCHANGED (the emit is byte-identical geometry to the old runtime
 * resolver); this is an architecture-fidelity + perf move, not a behaviour change.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { emitDescriptorJsFromSource, exportNameFor } from './descriptors.js';
import { loadTsDataFromPath } from '../ts-data-loader.js';

// ── the RN key order the resolver merges in (resolve.ts NS_ORDER) · palette is
// SKIPPED here (colour is the Arc-1 runtime path · never baked) ──
const NS_ORDER = ['stack', 'box', 'typography', 'palette', 'interactive'];

// ── resolve a dimension SoT leaf → its concrete number ──────────────
// A `{ ref: N }` leaf points at the px primitive whose value == its name (decision
// 32 · `--nuri-px-N` == Npx), so the number IS the ref; a `{ value }` literal (the
// space.none / radius.full / ratio.* leaves outside the px scale) is verbatim. This
// is the SAME resolution leafRhs (dimension-css.js) does for CSS, in numeric form.
function resolveLeaf(leaf) {
  if (leaf && 'ref' in leaf) return leaf.ref;
  if (leaf && typeof leaf.value === 'number') return leaf.value;
  throw new Error(`[recipes] dimension leaf is neither { ref } nor { value }: ${JSON.stringify(leaf)}`);
}

// dims (loadDimensions output) → the numeric scale table applyFieldsNode reads.
export function buildScales(dims) {
  const out = {};
  for (const scale of ['space', 'size', 'radius', 'ratio']) {
    out[scale] = {};
    for (const [leaf, def] of Object.entries(dims[scale])) out[scale][leaf] = resolveLeaf(def);
  }
  return out;
}

function fillCaseToRn(fill) {
  const out = {
    flexGrow: fill.grow,
    flexShrink: fill.shrink,
  };
  if (fill.basis !== undefined) out.flexBasis = fill.basis;
  if (fill.minInline !== undefined) out.minWidth = fill.minInline;
  return out;
}

// ── applyFieldsNode · the Node port of resolve.ts's `applyFields` (box · stack) ──
// Walks the shared Field TABLE in its declaration order (NOT the input's) so the
// emit reproduces the runtime resolver's key order byte-for-byte. The RN property
// NAME is the property-spelling registry's `.rn` column (single-sourced spelling);
// the `expand` (fill) arm spells the table's neutral flex intent locally.
function applyFieldsNode(fields, ns, spelling, scales) {
  const out = {};
  const rnProp = (id) => {
    const entry = spelling[id];
    if (!entry || entry.rn === undefined) {
      throw new Error(`[recipes] canonical id '${id}' has no property-spelling registry entry`);
    }
    return entry.rn;
  };
  for (const key of Object.keys(fields)) {
    const value = ns[key];
    if (value === undefined) continue;
    const f = fields[key];
    switch (f.via) {
      case 'scale': {
        const table = scales[f.scale];
        if (!table || table[value] === undefined) {
          throw new Error(`[recipes] no ${f.scale} scale value for '${value}'`);
        }
        out[rnProp(f.prop)] = table[value];
        break;
      }
      case 'keyword':
        out[rnProp(f.prop)] = f.map[value];
        break;
      case 'literal':
        out[rnProp(f.prop)] = value;
        break;
      case 'flag':
        out[rnProp(f.prop)] = value ? f.on : f.off;
        break;
      case 'expand':
        Object.assign(out, fillCaseToRn(f.cases[value]));
        break;
      default:
        throw new Error(`[recipes] unhandled field via '${f.via}'`);
    }
  }
  return out;
}

// ── resolveGeometryNode · the Node port of resolveNS, GEOMETRY-ONLY (palette
// SKIPPED · structurally colour-free) + theme-free. stack/box → applyFieldsNode
// (concrete ViewStyle); typography + interactive are carried through as the RAW
// namespace partials (merged + realized at runtime · single source). ──
function resolveGeometryNode(ns, deps) {
  const node = { view: {} };
  for (const key of NS_ORDER) {
    const v = ns[key];
    if (v === undefined) continue;
    switch (key) {
      case 'stack':
        Object.assign(node.view, applyFieldsNode(deps.STACK_FIELDS, v, deps.spelling, deps.scales));
        break;
      case 'box':
        Object.assign(node.view, applyFieldsNode(deps.BOX_FIELDS, v, deps.spelling, deps.scales));
        break;
      case 'typography':
        node.typography = v; // the raw { size?, emphasis? } partial — merged at runtime
        break;
      case 'palette':
        break; // colour is the Arc-1 runtime path — NEVER baked (the no-colour invariant)
      case 'interactive':
        node.interactive = v; // the raw opt-in booleans — merged at runtime
        break;
      default:
        throw new Error(`[recipes] unhandled namespace '${key}'`);
    }
  }
  return node;
}

// ── anatomy walk (the Node twin of resolveAnatomy) → [{ name, el, open }] parts,
// root then children in authored key order (both factories' render order) ──
function anatomyParts(anatomy) {
  const out = [];
  const walk = (name, a) => {
    out.push({ name, el: a.el, open: !!a.open });
    if (a.parts) for (const child of Object.keys(a.parts)) walk(child, a.parts[child]);
  };
  walk('root', anatomy);
  return out;
}

// ── buildGeometryRecipe · one descriptor → its BakedComponentRecipe (geometry-only) ──
// The Node twin of the (removed) toUnistylesRecipe, reshaped colour-free. Per part:
// the base geometry + per-axis geometry patches (only axes/values that carry
// geometry); typography + interactive as base/variants channels of the RAW mergeable
// partials (so emphasis-only + variant-level interactive survive · the reviewer's
// blocking findings). Iterates ALL axis values (not only geometry-bearing ones) for
// the typography/interactive channels.
export function buildGeometryRecipe(descriptor, deps) {
  const recipe = {};
  const axes = descriptor.variants ? Object.keys(descriptor.variants) : [];
  for (const { name: part, el, open } of anatomyParts(descriptor.structure.anatomy)) {
    const baseNS = descriptor.structure.base?.[part] ?? {};
    const baseNode = resolveGeometryNode(baseNS, deps);

    const geomVariants = {};
    const typoVariants = {};
    const interVariants = {};
    for (const axis of axes) {
      const valueMap = descriptor.variants[axis];
      const axisGeom = {};
      const axisTypo = {};
      const axisInter = {};
      for (const value of Object.keys(valueMap)) {
        const partNS = valueMap[value][part];
        if (!partNS) continue;
        const vNode = resolveGeometryNode(partNS, deps);
        if (Object.keys(vNode.view).length) axisGeom[value] = vNode.view;
        if (vNode.typography !== undefined) axisTypo[value] = vNode.typography;
        if (vNode.interactive !== undefined) axisInter[value] = vNode.interactive;
      }
      if (Object.keys(axisGeom).length) geomVariants[axis] = axisGeom;
      if (Object.keys(axisTypo).length) typoVariants[axis] = axisTypo;
      if (Object.keys(axisInter).length) interVariants[axis] = axisInter;
    }

    const partRecipe = { el };
    if (open) partRecipe.open = true;
    partRecipe.geometry = { base: baseNode.view, variants: geomVariants };

    const typography = {};
    if (baseNode.typography !== undefined) typography.base = baseNode.typography;
    if (Object.keys(typoVariants).length) typography.variants = typoVariants;
    if (Object.keys(typography).length) partRecipe.typography = typography;

    const interactive = {};
    if (baseNode.interactive !== undefined) interactive.base = baseNode.interactive;
    if (Object.keys(interVariants).length) interactive.variants = interVariants;
    if (Object.keys(interactive).length) partRecipe.interactive = interactive;

    recipe[part] = partRecipe;
  }
  return recipe;
}

// ════════════════════════════════════════════════════════════════════
// LOADERS · the single-sourced spec tables (shared TS→ESM data transform)
// ════════════════════════════════════════════════════════════════════

async function loadFieldTable(resolveMapPath) {
  const mod = await loadTsDataFromPath(resolveMapPath);
  for (const name of ['STACK_FIELDS', 'BOX_FIELDS']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[recipes] loadFieldTable: resolve-map has no usable ${name} (loader regression?)`);
    }
  }
  return { STACK_FIELDS: mod.STACK_FIELDS, BOX_FIELDS: mod.BOX_FIELDS };
}

async function loadRegistry(propertySpellingPath) {
  const mod = await loadTsDataFromPath(propertySpellingPath);
  const reg = mod.PROPERTY_SPELLING;
  if (!reg || typeof reg !== 'object' || !reg.padding || reg.padding.rn === undefined) {
    throw new Error('[recipes] loadRegistry: PROPERTY_SPELLING missing/invalid (loader regression?)');
  }
  return reg;
}

// loadRecipeDeps · the single-sourced spec tables the bake applies. Exported so the
// generator test (scripts/recipes.test.js) bakes synthetic descriptors against the
// SAME deps the build uses (no divergent fixture).
export async function loadRecipeDeps({ resolveMapPath, propertySpellingPath, dims }) {
  const { STACK_FIELDS, BOX_FIELDS } = await loadFieldTable(resolveMapPath);
  const spelling = await loadRegistry(propertySpellingPath);
  const scales = buildScales(dims);
  return { STACK_FIELDS, BOX_FIELDS, spelling, scales };
}

// A descriptor SOURCE → its live data object (via the descriptor browser-ESM strip ·
// emitDescriptorJsFromSource · the one transform · then a data:-URL import).
async function loadDescriptor(spec, source) {
  const js = emitDescriptorJsFromSource(spec, source);
  const mod = await import('data:text/javascript,' + encodeURIComponent(js));
  const descriptor = mod[exportNameFor(spec.name)];
  if (!descriptor || !descriptor.structure) {
    throw new Error(`[recipes] loadDescriptor: '${spec.name}' export ${exportNameFor(spec.name)} missing/invalid`);
  }
  return descriptor;
}

// ── emitRecipesTs · the committed generated artifact (drift-gated) ──
export function emitRecipesTs(recipesByComponent) {
  const header = [
    '/* ──────────────────────────────────────────────────────────────',
    ' * NURI · BAKED GEOMETRY RECIPES · GENERATED · DO NOT EDIT BY HAND',
    ' *',
    ' * Source · the FROZEN descriptors (packages/spec/components/*.ts) resolved',
    ' * through the single-sourced box/stack MAPPING (resolve-map STACK_FIELDS/',
    ' * BOX_FIELDS + property-spelling `.rn` + the dimension scales).',
    ' * Emitter · scripts/parsers/recipes.js — run `npm run build`.',
    ' *',
    ' * The build-time-STATIC geometry slice (Arc 2 · D11 + D5): box/stack resolved to',
    ' * concrete ViewStyle ONCE, keyed by component → part; typography + interactive as',
    ' * the RAW mergeable namespace partials (merged + realized at runtime by the same',
    ' * appliers the runtime resolver uses). The RN runtime LOADS + composes this',
    ' * (flattenBakedPart · runtime/resolve.ts) instead of re-resolving every render. COLOUR-FREE',
    ' * by construction — NO backgroundColor / fg / pressedBg / hex / accent·mode variant;',
    ' * colour is the Arc-1 runtime theme path, merged on at render. Bound byte-for-byte',
    ' * to the TS runtime resolver by the oracle-equivalence guard (full node + style ·',
    ' * __tests__/geometry-bake.test.ts).',
    ' * ────────────────────────────────────────────────────────────── */',
    '',
    "import type { BakedComponentRecipe } from '../../runtime/resolve';",
    '',
  ].join('\n');
  const body = 'export const recipes: Record<string, BakedComponentRecipe> = ' +
    JSON.stringify(recipesByComponent, null, 2) + ';\n';
  return header + '\n' + body;
}

// ── emitRecipes · the orchestrator step (tokens-parser.js) ──
// Loads the spec tables + every roster descriptor, bakes each into its geometry
// recipe, and returns { source, coverage } (coverage = the emitted component names,
// for the loud coverage assertion — every roster component MUST have a recipe).
export async function emitRecipes({ descriptorComponents, descriptorsDir, resolveMapPath, propertySpellingPath, dims }) {
  const deps = await loadRecipeDeps({ resolveMapPath, propertySpellingPath, dims });

  const recipesByComponent = {};
  for (const spec of descriptorComponents) {
    const source = await readFile(`${descriptorsDir}/${spec.name}.ts`, 'utf8');
    const descriptor = await loadDescriptor(spec, source);
    recipesByComponent[spec.name] = buildGeometryRecipe(descriptor, deps);
  }
  return { source: emitRecipesTs(recipesByComponent), coverage: Object.keys(recipesByComponent) };
}
