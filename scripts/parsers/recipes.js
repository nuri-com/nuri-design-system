/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · BAKED GEOMETRY RECIPE EMIT (Arc 2 · D11 + D5 · geometry bake)
 * ──────────────────────────────────────────────────────────────────
 * The RN projection's BUILD-TIME geometry bake. box/stack/typography/interactive
 * are STATIC — a pure function of the descriptor + selection, ZERO theme/state
 * input — yet the RN factory re-resolved them every render (`flattenPart` per
 * part + per press · D11). This emitter resolves them ONCE at build into
 * `packages/rn/generated/recipes.ts`; the factory LOADS + composes them
 * (`flattenBakedPart` · resolve.ts). It PROMOTES the old test-only
 * `toUnistylesRecipe` precompute (D5), reshaped COLOUR-FREE.
 *
 * ── THE TOOLCHAIN SEAM (stated · brief §Open seams) ────────────────
 * The bake reuses the SINGLE-SOURCED namespace→style MAPPING (@nuri/spec's
 * resolve-map STACK_FIELDS/BOX_FIELDS + property-spelling `.rn` + the dimension
 * scales), applied by a Node port of resolve.ts's `applyFields`. This is the
 * documented NODE-REIMPL fallback the brief sanctions, NOT a second copy of the
 * mapping: it is the RN twin of the web geometry emit (prototype/pipeline/parsers/
 * namespace-css.js, which applies the SAME tables in Node to emit box.css/stack.css).
 * Node 20 cannot run the TS resolver (no tsx/esbuild · the deliberate node-20 +
 * type-strip toolchain · debt-register SEED-1b), and adding a bundler for one emit
 * is out of grain. The applier interpreter is ~30 lines; the KNOWLEDGE (the field
 * tables + spellings + scales) is single-sourced in spec. The oracle-equivalence
 * guard (packages/rn/factory/__tests__/geometry-bake.test.ts) binds this emit
 * byte-for-byte to the TS runtime resolver (flattenPart), mutation-proven — so a
 * drift between the two appliers fails CI, not silently ships.
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

import { stripTypes as stripTypesShared } from './dimension-css.js';
import { emitDescriptorJsFromSource, exportNameFor } from './descriptors.js';

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

// ── applyFieldsNode · the Node port of resolve.ts's `applyFields` (box · stack) ──
// Walks the shared Field TABLE in its declaration order (NOT the input's) so the
// emit reproduces the runtime resolver's key order byte-for-byte. The RN property
// NAME is the property-spelling registry's `.rn` column (single-sourced spelling);
// the `expand` (fill) arm is an RN-spelled multi-prop fragment straight off the table.
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
        Object.assign(out, f.cases[value]);
        break;
      default:
        throw new Error(`[recipes] unhandled field via '${f.via}'`);
    }
  }
  return out;
}

// ── resolveGeometryNode · the Node port of resolveNS, GEOMETRY-ONLY (palette
// SKIPPED · structurally colour-free) + theme-free. stack/box → applyFieldsNode;
// typography → a type REF; interactive → the opt-in carried onto the node. ──
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
        if (v.size !== undefined) node.type = v.emphasis ? { size: v.size, emphasis: true } : { size: v.size };
        break;
      case 'palette':
        break; // colour is the Arc-1 runtime path — NEVER baked (the no-colour invariant)
      case 'interactive':
        node.interactive = v;
        break;
      default:
        throw new Error(`[recipes] unhandled namespace '${key}'`);
    }
  }
  return node;
}

// read a dotted theme-ish path (the opt's `token` · e.g. 'interaction.pressScale').
const readPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

// ── bakeInteractive · the base node's interactive opt-in → the STATIC state patches ──
// Walks `opts` in key order (pressColor → pressScale → disabledOpacity · the RN
// applier's order). A `from` opt (pressColor) is node-derived colour → a MARKER only
// (the pressedBg comes from the runtime colour path · Arc 1). A `token` opt
// (pressScale · disabledOpacity) is a theme-free constant → baked into the trigger's
// static patch (pressed → pressedStatic · disabled → disabledStatic), realized from
// the interaction baseline exactly as realizeToken does at runtime.
function bakeInteractive(interactiveNS, opts, interaction) {
  if (!interactiveNS) return undefined;
  const themeish = { interaction };
  const out = {};
  let pressedStatic;
  let disabledStatic;
  for (const key of Object.keys(opts)) {
    if (!interactiveNS[key]) continue;
    const opt = opts[key];
    if ('from' in opt.rn) {
      out[key] = true; // colour marker (pressColor · runtime pressedBg)
      continue;
    }
    // The interaction baseline loads as a numeric STRING (the CSS-flip SoT); the
    // runtime resolver uses a real NUMBER (generated/interaction.ts · theme.interaction).
    // Coerce so the bake is byte-identical to flattenPart (the oracle guard).
    const raw = Number(readPath(themeish, opt.rn.token));
    const value = opt.rn.shape === 'scale' ? [{ scale: raw }] : raw;
    out[key] = true;
    if (opt.trigger === 'pressed') (pressedStatic ??= {})[opt.rn.prop] = value;
    else if (opt.trigger === 'disabled') (disabledStatic ??= {})[opt.rn.prop] = value;
  }
  if (pressedStatic) out.pressedStatic = pressedStatic;
  if (disabledStatic) out.disabledStatic = disabledStatic;
  return Object.keys(out).length ? out : undefined;
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
// The Node twin of the (removed) toUnistylesRecipe, reshaped colour-free: per part,
// the base geometry + the per-axis geometry patches (only axes/values that carry
// geometry), the type-ref channel, and the interactive statics.
export function buildGeometryRecipe(descriptor, deps) {
  const recipe = {};
  const axes = descriptor.variants ? Object.keys(descriptor.variants) : [];
  for (const { name: part, el, open } of anatomyParts(descriptor.structure.anatomy)) {
    const baseNS = descriptor.structure.base?.[part] ?? {};
    const baseNode = resolveGeometryNode(baseNS, deps);

    const variants = {};
    const typeVariants = {};
    for (const axis of axes) {
      const valueMap = descriptor.variants[axis];
      const axisStyles = {};
      for (const value of Object.keys(valueMap)) {
        const partNS = valueMap[value][part];
        if (!partNS) continue;
        const vNode = resolveGeometryNode(partNS, deps);
        if (Object.keys(vNode.view).length) axisStyles[value] = vNode.view;
        if (vNode.type !== undefined) (typeVariants[axis] ??= {})[value] = vNode.type;
      }
      if (Object.keys(axisStyles).length) variants[axis] = axisStyles;
    }

    const partRecipe = { el };
    if (open) partRecipe.open = true;
    partRecipe.geometry = { base: baseNode.view, variants };

    const typeStep = {};
    if (baseNode.type !== undefined) typeStep.base = baseNode.type;
    if (Object.keys(typeVariants).length) typeStep.variants = typeVariants;
    if (Object.keys(typeStep).length) partRecipe.typeStep = typeStep;

    const interactive = bakeInteractive(baseNode.interactive, deps.opts, deps.interaction);
    if (interactive) partRecipe.interactive = interactive;

    recipe[part] = partRecipe;
  }
  return recipe;
}

// ════════════════════════════════════════════════════════════════════
// LOADERS · the single-sourced spec tables (node 20 · type-strip + data:-URL)
// ════════════════════════════════════════════════════════════════════

// resolve-map.ts's tagged-union `Field` type needs the bespoke strip (the SAME one
// prototype/pipeline/parsers/namespace-css.js uses · resolve-map has only `import
// type` imports, so the stripped module needs no resolution). Kept in lockstep by
// the oracle guard (a strip drift diverges the emit from the runtime resolver).
function stripFieldTable(src) {
  return src
    .replace(/^import type .*;\n/gm, '')
    .replace(/^export type ScaleName = .*;\n/m, '')
    .replace(/^export type Field =\n(?:\s*\|.*\n)*/m, '')
    .replace(/^((?:export )?const \w+): [^=\n]+ = /gm, '$1 = ');
}

async function loadFieldTable(resolveMapPath) {
  const src = await readFile(resolveMapPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripFieldTable(src)));
  for (const name of ['STACK_FIELDS', 'BOX_FIELDS']) {
    if (!mod[name] || typeof mod[name] !== 'object' || !Object.keys(mod[name]).length) {
      throw new Error(`[recipes] loadFieldTable: stripped resolve-map has no usable ${name} (strip regression?)`);
    }
  }
  return { STACK_FIELDS: mod.STACK_FIELDS, BOX_FIELDS: mod.BOX_FIELDS };
}

async function loadStripSoT(tsPath, exportName, sanity) {
  const src = await readFile(tsPath, 'utf8');
  const mod = await import('data:text/javascript,' + encodeURIComponent(stripTypesShared(src)));
  const value = mod[exportName];
  if (!value || typeof value !== 'object' || !sanity(value)) {
    throw new Error(`[recipes] loadStripSoT: ${tsPath} export '${exportName}' missing/invalid (strip regression?)`);
  }
  return value;
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
    ' * The build-time-STATIC geometry slice (Arc 2 · D11 + D5): box/stack/typography/',
    ' * interactive resolved to concrete ViewStyle ONCE, keyed by component → part.',
    ' * The RN factory LOADS + composes this (flattenBakedPart · resolve.ts) instead of',
    ' * re-resolving every render. COLOUR-FREE by construction — NO backgroundColor / fg /',
    ' * pressedBg / hex / accent·mode variant; colour is the Arc-1 runtime theme path,',
    ' * merged on at render. Bound byte-for-byte to the TS runtime resolver by the',
    ' * oracle-equivalence guard (factory/__tests__/geometry-bake.test.ts).',
    ' * ────────────────────────────────────────────────────────────── */',
    '',
    "import type { BakedComponentRecipe } from '../factory/resolve';",
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
export async function emitRecipes({ descriptorComponents, descriptorsDir, resolveMapPath, propertySpellingPath, interactivePath, dims, interaction }) {
  const { STACK_FIELDS, BOX_FIELDS } = await loadFieldTable(resolveMapPath);
  const spelling = await loadStripSoT(propertySpellingPath, 'PROPERTY_SPELLING', (r) => r.padding && r.padding.rn !== undefined);
  const opts = await loadStripSoT(interactivePath, 'opts', (o) => o.pressScale && o.pressScale.rn !== undefined);
  const scales = buildScales(dims);
  const deps = { STACK_FIELDS, BOX_FIELDS, spelling, scales, opts, interaction };

  const recipesByComponent = {};
  for (const spec of descriptorComponents) {
    const source = await readFile(`${descriptorsDir}/${spec.name}.ts`, 'utf8');
    const descriptor = await loadDescriptor(spec, source);
    recipesByComponent[spec.name] = buildGeometryRecipe(descriptor, deps);
  }
  return { source: emitRecipesTs(recipesByComponent), coverage: Object.keys(recipesByComponent) };
}
