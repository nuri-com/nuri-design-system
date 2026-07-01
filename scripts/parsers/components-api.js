/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · COMPONENT-API CODEGEN (Path C · Phase 2)
 * ──────────────────────────────────────────────────────────────────
 * The RN projection's per-component PUBLIC-SURFACE emit. Phase 1 made every
 * descriptor DECLARE its `api` (data + guard · scripts/component-api.test.js);
 * this emitter makes that data DO WORK — for each catalog component it emits an
 * EXACT `{Name}Props` type + a typed export at packages/rn/generated/components/
 * <name>.ts, so `@nuri/rn`'s public surface stops being the global `NuriBaseProps`
 * bag and becomes each component's REAL surface (`ButtonProps` with no icon/prefix/
 * suffix; `IconButtonProps` with a required scalar `icon` + `children?: never`).
 *
 * ── THE MECHANISM · a TYPE NARROWING, not a rewrite (docs/component-api-target.md
 *    §Phase 2 · §1c) ────────────────────────────────────────────────
 * `createNuriComponent` returns `FC<NuriComponentProps<A>>` (the WIDE bag). The
 * emitted export binds that SAME instance to `FC<{Name}Props>` (the NARROW surface).
 * This is SOUND with NO cast: props are contravariant, so `FC<Wide>` ⊑ `FC<Narrow>`
 * whenever `Narrow` ⊑ `Wide` (every narrow prop is acceptable to the wide bag). The
 * instance, the recipe and the render are UNCHANGED — only the TYPE tightens. The
 * factory internals (the primaryPart / same-name / selected heuristics) stay until
 * Phase 3; the render-smoke snapshots stay byte-identical. The load-bearing proof is
 * the `@ts-expect-error` TYPE test (packages/rn/type-tests/component-types.test-d.tsx),
 * NOT a render snapshot — tsc can't see a runtime, and the render can't see a type.
 *
 * ── THE FIELD MAP (each `api` field → the emitted prop) ────────────
 *   · axes: ['variant','size']         → `variant?: '…' | '…'` (union ← variants[axis] keys)
 *   · themeScope.accent                → `accent?: Accent`
 *   · behaviour.pressable.props        → only the DECLARED subset of
 *                                        onPress?/disabled?/accessibilityLabel?
 *   · propMaps.selected                → `selected?: boolean`
 *   · a `default` slot (children-sink) → `children?: React.ReactNode`
 *   · a slot with `prop` (icon-name)   → `<prop>: IconName` (REQUIRED iff required)
 *   · a non-default icon-name / text slot (tab-bar-item's icon/label · NOT `prop`,
 *     NOT composition yet · Phase 4 converts them) → `<slot>?: IconName` / `?: string`
 *   · a non-default region/node/children slot (topbar's leading/center) → NO prop
 *     (composition via the flat region sub-components · attached on the instance)
 *   · NO `default` slot                → `children?: never`
 *
 * ── SOURCE · the AUTHORED descriptors (the Arc-2 recipe-emit path) ──
 * Reads each descriptor's `api`+`variants` off the AUTHORED source (packages/spec/
 * components/<name>.ts) via the one browser-ESM strip (emitDescriptorJsFromSource +
 * a data:-URL import · node 20 cannot import the .ts), EXACTLY as scripts/parsers/
 * recipes.js does. Byte-identical to reading the committed twin (the twin is that
 * strip's verbatim output · gated by Guard D). Output committed + drift-gated (the
 * `npm run build` re-emit-clean gate · like recipes.ts).
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { emitDescriptorJsFromSource, exportNameFor } from './descriptors.js';

// kebab → Pascal (`tab-bar-item` → `TabBarItem`) — the RN name rule (the twin of
// createNuriComponent's `pascalCase`). Single tokens capitalize + join.
const pascalCase = (kebab) => kebab.split('-').map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join('');
// A single part token → its PascalCase (region sub-component: `leading` → `Leading`).
const pascalPart = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// lower-first (the compound slots local var: `Topbar` → `topbar`).
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// The TS type for each legal pressable prop (the schema union · schema.ts).
const PRESSABLE_TS = { onPress: '() => void', disabled: 'boolean', accessibilityLabel: 'string' };

// A descriptor SOURCE → its live data object (the recipes.js path · the one strip +
// a data:-URL import · node 20 cannot import the .ts).
async function loadDescriptor(spec, source) {
  const js = emitDescriptorJsFromSource(spec, source);
  const mod = await import('data:text/javascript,' + encodeURIComponent(js));
  const descriptor = mod[exportNameFor(spec.name)];
  if (!descriptor || !descriptor.api) {
    throw new Error(`[components-api] loadDescriptor: '${spec.name}' export ${exportNameFor(spec.name)} missing/invalid api`);
  }
  return descriptor;
}

// ── buildProps · the descriptor's `api` → the emitted `{Name}Props` field lines +
// the import/compound bookkeeping (usesAccent/usesIcon/regionParts). ──
function buildProps(api, variants) {
  const lines = [];
  let usesAccent = false;
  let usesIcon = false;
  let hasDefault = false;

  // axes → the public style-prop unions (values ← variants[axis] keys · the guard
  // pins every api.axes member is a real variants axis).
  for (const axis of api.axes) {
    const values = Object.keys(variants[axis] || {});
    if (!values.length) continue;
    lines.push(`  ${axis}?: ${values.map((v) => `'${v}'`).join(' | ')};`);
  }

  // accent — the universal-but-DECLARED theme scope (Overrides §2).
  if (api.themeScope && api.themeScope.accent) {
    usesAccent = true;
    lines.push('  accent?: Accent;');
  }

  // behaviour — only the DECLARED subset of the pressable props.
  const pressableProps = (api.behaviour && api.behaviour.pressable && api.behaviour.pressable.props) || [];
  for (const p of pressableProps) lines.push(`  ${p}?: ${PRESSABLE_TS[p]};`);

  // the `selected`→state bridge as a clean consumer boolean (propMaps.selected).
  if (api.propMaps && api.propMaps.selected) lines.push('  selected?: boolean;');

  // slots — the content entry points (the field map above).
  for (const [slotName, slot] of Object.entries(api.slots)) {
    if (slot.default === true) {
      // the untagged-children sink (Option A · §1c) → `children?: React.ReactNode`
      // (emitted last, below); never a named prop.
      hasDefault = true;
      continue;
    }
    if (slot.prop) {
      // the scalar icon-name shorthand (Overrides §1a) — REQUIRED iff `required`.
      usesIcon = true;
      lines.push(`  ${slot.prop}${slot.required ? '' : '?'}: IconName;`);
      continue;
    }
    // a non-default, non-prop slot. icon-name / text slots (tab-bar-item's
    // icon/label) route TODAY's same-name props (byte-identical · Phase 4 converts
    // them to composed children); region/node/children slots are composition
    // (the flat sub-components), NOT props.
    if (slot.kind === 'icon-name') {
      usesIcon = true;
      lines.push(`  ${slotName}?: IconName;`);
    } else if (slot.kind === 'text') {
      lines.push(`  ${slotName}?: string;`);
    }
  }

  // the children channel — the sink when there is a `default` slot, else FORBIDDEN
  // (`children?: never` · a component with no untagged-children slot).
  lines.push(hasDefault ? '  children?: React.ReactNode;' : '  children?: never;');

  // region slots (kind:'region') → the compound flat sub-components attached on the
  // instance (createNuriComponent.compoundSlots) · preserved on the generated export.
  const regionParts = Object.values(api.slots).filter((s) => s.kind === 'region').map((s) => s.part);

  return { lines, usesAccent, usesIcon, regionParts };
}

function fileHeader(name) {
  return [
    '/* ──────────────────────────────────────────────────────────────',
    ` * NURI · COMPONENT · ${name.toUpperCase()} · EXACT PUBLIC SURFACE · GENERATED · DO NOT EDIT BY HAND`,
    ' *',
    ` * The EXACT-typed public export for \`${name}\` (Path C · Phase 2). \`{Name}Props\``,
    " * is emitted from the descriptor's `api` (packages/spec/components/" + name + '.ts);',
    ' * the export binds the EXISTING createNuriComponent instance to it — a TYPE',
    ' * NARROWING over the wide `NuriComponentProps` bag (FC<Wide> ⊑ FC<Narrow> · props',
    ' * contravariant · NO cast · same instance · same recipe · render byte-identical).',
    ' *',
    ' * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/',
    ' * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit',
    " * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.",
    ' * ────────────────────────────────────────────────────────────── */',
    '',
  ].join('\n');
}

// ── emitComponentFile · one descriptor → its generated/components/<name>.ts ──
export function emitComponentFile(spec, descriptor) {
  const name = spec.name;
  const Pascal = pascalCase(name);
  const descId = exportNameFor(name);
  const { lines, usesAccent, usesIcon, regionParts } = buildProps(descriptor.api, descriptor.variants || {});
  const isCompound = regionParts.length > 0;

  const imports = [
    "import * as React from 'react';",
    `import { createNuriComponent, nuriNames${isCompound ? ', compoundSlots' : ''} } from '../../factory/createNuriComponent';`,
    `import { ${descId} } from '@nuri/spec/descriptors/${name}';`,
    "import { recipes } from '../recipes';",
  ];
  if (usesAccent) imports.push("import type { Accent } from '../tokens';");
  if (usesIcon) imports.push("import type { IconName } from '../icons';");

  const body = [
    `export type ${Pascal}Props = {`,
    ...lines,
    '};',
    '',
    `export const ${Pascal}: React.FC<${Pascal}Props> = createNuriComponent(`,
    `  ${descId},`,
    `  nuriNames('${name}').rn,`,
    `  recipes['${name}'],`,
    ');',
  ];

  if (isCompound) {
    const slotsVar = `${lowerFirst(Pascal)}Slots`;
    body.push('', `const ${slotsVar} = compoundSlots(${Pascal});`);
    for (const part of regionParts) {
      const slotId = `${Pascal}${pascalPart(part)}`;
      body.push(`export const ${slotId} = ${slotsVar}.${slotId};`);
    }
  }

  return fileHeader(name) + '\n' + imports.join('\n') + '\n\n' + body.join('\n') + '\n';
}

// ── the index barrel · re-exports every component + its Props type (+ region
// sub-components), so the RN factory barrel re-exports ONE path. ──
function emitIndex(entries) {
  const header = [
    '/* ──────────────────────────────────────────────────────────────',
    ' * NURI · COMPONENTS · EXACT PUBLIC SURFACE · BARREL · GENERATED · DO NOT EDIT BY HAND',
    ' *',
    ' * Re-exports every catalog component + its `{Name}Props` type (Path C · Phase 2).',
    ' * The RN factory barrel (packages/rn/factory/index.ts) re-exports THIS module.',
    ' * Emitter · scripts/parsers/components-api.js — run `npm run build`.',
    ' * ────────────────────────────────────────────────────────────── */',
    '',
  ].join('\n');
  const lines = [];
  for (const { name, Pascal, regionSubs } of entries) {
    const values = [Pascal, ...regionSubs].join(', ');
    lines.push(`export { ${values} } from './${name}';`);
    lines.push(`export type { ${Pascal}Props } from './${name}';`);
  }
  return header + '\n' + lines.join('\n') + '\n';
}

// ── emitComponentApi · the orchestrator step (tokens-parser.js). Loads every roster
// descriptor, emits its exact-surface file + the index barrel, and returns
// { files: [{ filename, source }], coverage } (coverage = the emitted names). ──
export async function emitComponentApi({ descriptorComponents, descriptorsDir }) {
  const files = [];
  const indexEntries = [];
  for (const spec of descriptorComponents) {
    const source = await readFile(`${descriptorsDir}/${spec.name}.ts`, 'utf8');
    const descriptor = await loadDescriptor(spec, source);
    files.push({ filename: `${spec.name}.ts`, source: emitComponentFile(spec, descriptor) });
    const Pascal = pascalCase(spec.name);
    const regionSubs = Object.values(descriptor.api.slots)
      .filter((s) => s.kind === 'region')
      .map((s) => `${Pascal}${pascalPart(s.part)}`);
    indexEntries.push({ name: spec.name, Pascal, regionSubs });
  }
  files.push({ filename: 'index.ts', source: emitIndex(indexEntries) });
  return { files, coverage: descriptorComponents.map((s) => s.name) };
}
