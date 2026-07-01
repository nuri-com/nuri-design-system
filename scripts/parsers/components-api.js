/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · COMPONENT-API CODEGEN (Path C · Phase 3)
 * ──────────────────────────────────────────────────────────────────
 * Emits RN projection component adapters from each descriptor's public `api`.
 * The generated `{Name}Props` types stay exact, and the generated component
 * normalizes those props into the renderer's descriptor instance:
 * `{ selection, content, behaviour }`, plus an `NuriScope` wrapper for accent.
 *
 * The shared renderer no longer invents public API from anatomy. This emitter is
 * where declared axes, prop maps, slots, and behaviour become runtime input.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

import { emitDescriptorJsFromSource, exportNameFor } from './descriptors.js';

const pascalCase = (kebab) => kebab.split('-').map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join('');
const pascalPart = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const q = (value) => JSON.stringify(value);

const PRESSABLE_TS = { onPress: '() => void', disabled: 'boolean', accessibilityLabel: 'string' };

async function loadDescriptor(spec, source) {
  const js = emitDescriptorJsFromSource(spec, source);
  const mod = await import('data:text/javascript,' + encodeURIComponent(js));
  const descriptor = mod[exportNameFor(spec.name)];
  if (!descriptor || !descriptor.api) {
    throw new Error(`[components-api] loadDescriptor: '${spec.name}' export ${exportNameFor(spec.name)} missing/invalid api`);
  }
  return descriptor;
}

function buildProps(api, variants) {
  const lines = [];
  let usesAccent = false;
  let usesIcon = false;
  let hasDefault = false;

  for (const axis of api.axes) {
    const values = Object.keys(variants[axis] || {});
    if (!values.length) continue;
    lines.push(`  ${axis}?: ${values.map((v) => `'${v}'`).join(' | ')};`);
  }

  if (api.themeScope && api.themeScope.accent) {
    usesAccent = true;
    lines.push('  accent?: Accent;');
  }

  const pressableProps = (api.behaviour && api.behaviour.pressable && api.behaviour.pressable.props) || [];
  for (const p of pressableProps) lines.push(`  ${p}?: ${PRESSABLE_TS[p]};`);

  if (api.propMaps && api.propMaps.selected) lines.push('  selected?: boolean;');

  for (const [slotName, slot] of Object.entries(api.slots)) {
    if (slot.default === true) {
      hasDefault = true;
      continue;
    }
    if (slot.prop) {
      usesIcon = true;
      lines.push(`  ${slot.prop}${slot.required ? '' : '?'}: IconName;`);
      continue;
    }
    if (slot.kind === 'icon-name') {
      usesIcon = true;
      lines.push(`  ${slotName}?: IconName;`);
    } else if (slot.kind === 'text') {
      lines.push(`  ${slotName}?: string;`);
    }
  }

  lines.push(hasDefault ? '  children?: React.ReactNode;' : '  children?: never;');

  const regionParts = Object.values(api.slots).filter((s) => s.kind === 'region').map((s) => s.part);
  return { lines, usesAccent, usesIcon, regionParts };
}

function fallbackSelectionValue(descriptor, axis, values) {
  return descriptor.defaults?.[axis] ?? values[0];
}

function emitSelection(descriptor) {
  const variants = descriptor.variants || {};
  const publicAxes = new Set(descriptor.api.axes || []);
  const lines = ['  const selection: Record<string, string> = {'];
  for (const [axis, table] of Object.entries(variants)) {
    const values = Object.keys(table);
    if (!values.length) continue;
    const fallback = q(fallbackSelectionValue(descriptor, axis, values));
    const value = publicAxes.has(axis) ? `props.${axis} ?? ${fallback}` : fallback;
    lines.push(`    ${q(axis)}: ${value},`);
  }
  lines.push('  };');

  const selected = descriptor.api.propMaps && descriptor.api.propMaps.selected;
  if (selected) {
    lines.push(
      '  if (typeof props.selected === \'boolean\') {',
      `    selection[${q(selected.axis)}] = props.selected ? ${q(selected.true)} : ${q(selected.false)};`,
      '  }',
    );
  }
  return lines;
}

function emitContent(api) {
  const lines = ['  const content: Partial<Record<Part, React.ReactNode>> = {};'];
  const regionSlots = Object.values(api.slots).filter((slot) => slot.kind === 'region');
  const fallbackRegion = Object.values(api.slots).find((slot) => slot.kind === 'region' && slot.default === true);

  if (regionSlots.length) {
    lines.push(`  const harvested = harvestNuriSlots(props.children, ${fallbackRegion ? q(fallbackRegion.part) : 'undefined'});`);
    for (const slot of regionSlots) {
      lines.push(`  if (harvested[${q(slot.part)}] !== undefined) content[${q(slot.part)}] = harvested[${q(slot.part)}];`);
    }
  }

  for (const [slotName, slot] of Object.entries(api.slots)) {
    if (slot.kind === 'region') continue;
    if (slot.default === true) {
      lines.push(`  if (props.children !== undefined) content[${q(slot.part)}] = props.children;`);
      continue;
    }
    const prop = slot.prop || (slot.kind === 'icon-name' || slot.kind === 'text' ? slotName : null);
    if (prop) lines.push(`  if (props.${prop} !== undefined) content[${q(slot.part)}] = props.${prop};`);
  }

  return lines;
}

function emitBehaviour(api) {
  const pressable = api.behaviour && api.behaviour.pressable;
  const lines = ['  const behaviour: NuriBehaviour = {};'];
  if (!pressable) return lines;

  lines.push('  behaviour.pressable = {', `    target: ${q(pressable.target)},`);
  for (const prop of pressable.props) lines.push(`    ${prop}: props.${prop},`);
  lines.push('  };');
  return lines;
}

function fileHeader(name) {
  return [
    '/* ──────────────────────────────────────────────────────────────',
    ` * NURI · COMPONENT · ${name.toUpperCase()} · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND`,
    ' *',
    ` * The exact public export for \`${name}\` (Path C · Phase 3). \`{Name}Props\``,
    " * is emitted from the descriptor's `api` (packages/spec/components/" + name + '.ts);',
    ' * the component adapter normalizes public props into selection, content,',
    ' * behaviour, and accent scope before calling the shared descriptor renderer.',
    ' *',
    ' * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/',
    ' * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit',
    " * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.",
    ' * ────────────────────────────────────────────────────────────── */',
    '',
  ].join('\n');
}

export function emitComponentFile(spec, descriptor) {
  const name = spec.name;
  const Pascal = pascalCase(name);
  const local = lowerFirst(Pascal);
  const descId = exportNameFor(name);
  const { lines, usesAccent, usesIcon, regionParts } = buildProps(descriptor.api, descriptor.variants || {});
  const hasRegions = regionParts.length > 0;

  const factoryImports = ['nuriNames', 'renderDescriptorInstance'];
  if (hasRegions) factoryImports.push('createNuriSlot', 'harvestNuriSlots');

  const imports = [
    "import * as React from 'react';",
    `import { ${factoryImports.join(', ')} } from '../../factory/createNuriComponent';`,
    "import type { NuriBehaviour } from '../../factory/createNuriComponent';",
    `import { ${descId} } from '@nuri/spec/descriptors/${name}';`,
    "import { recipes } from '../recipes';",
    "import type { Part } from '../../contract';",
  ];
  if (usesAccent) {
    imports.push("import { NuriScope } from '../../theme';");
    imports.push("import type { Accent } from '../tokens';");
  }
  if (usesIcon) imports.push("import type { IconName } from '../icons';");

  const displayNameConst = `${local}DisplayName`;
  const innerName = `${Pascal}Inner`;
  const body = [
    `export type ${Pascal}Props = {`,
    ...lines,
    '};',
    '',
    `const ${displayNameConst} = nuriNames('${name}').rn;`,
  ];

  if (hasRegions) {
    for (const part of regionParts) {
      body.push(`export const ${Pascal}${pascalPart(part)} = createNuriSlot(${q(part)}, \`${'${'}${displayNameConst}}${pascalPart(part)}\`);`);
    }
  }

  body.push(
    '',
    `const ${innerName}: React.FC<${Pascal}Props> = (props) => {`,
    ...emitSelection(descriptor),
    ...emitContent(descriptor.api),
    ...emitBehaviour(descriptor.api),
    '',
    '  return renderDescriptorInstance({',
    `    descriptor: ${descId},`,
    `    recipe: recipes[${q(name)}],`,
    `    displayName: ${displayNameConst},`,
    '    selection,',
    '    content,',
    '    behaviour,',
    '  });',
    '};',
    `${innerName}.displayName = \`${'${'}${displayNameConst}}Inner\`;`,
    '',
  );

  if (usesAccent) {
    body.push(
      `export const ${Pascal}: React.FC<${Pascal}Props> = (props) =>`,
      '  props.accent !== undefined',
      `    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(${innerName}, props) })`,
      `    : React.createElement(${innerName}, props);`,
      `${Pascal}.displayName = ${displayNameConst};`,
    );
  } else {
    body.push(`export const ${Pascal}: React.FC<${Pascal}Props> = ${innerName};`);
  }

  return fileHeader(name) + '\n' + imports.join('\n') + '\n\n' + body.join('\n') + '\n';
}

function emitIndex(entries) {
  const header = [
    '/* ──────────────────────────────────────────────────────────────',
    ' * NURI · COMPONENTS · GENERATED RN API ADAPTER BARREL · DO NOT EDIT BY HAND',
    ' *',
    ' * Re-exports every catalog component, generated region marker, and `{Name}Props`',
    ' * type. Emitter · scripts/parsers/components-api.js — run `npm run build`.',
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
