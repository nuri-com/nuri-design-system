/* ══════════════════════════════════════════════════════════════════
 * NURI · PARSER · COMPONENT-API CODEGEN (Path C)
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

// The HOST half of the frozen `El` host/leaf partition — the script-side mirror
// of schema.ts's totality-pinned HOST_ELS (the parser runs synchronously at emit
// time; the authoritative partition lives beside the `El` type). Bound to the
// SoT by the component-api guard's mirror-parity test (it transpile-loads
// schema.ts and asserts ≡), so this hand list cannot drift silently.
export const HOST_ELS = ['view', 'pressable'];

function anatomyParts(anatomy) {
  if (!anatomy || !HOST_ELS.includes(anatomy.el)) {
    throw new Error('[components-api] descriptor anatomy must declare a host root (view or pressable)');
  }
  const parts = ['root'];
  const seen = new Set(parts);
  const walk = (node) => {
    if (!node || !node.parts) return;
    for (const [part, child] of Object.entries(node.parts)) {
      if (part === 'root') throw new Error("[components-api] 'root' is reserved for the descriptor host and cannot be nested");
      if (seen.has(part)) throw new Error(`[components-api] duplicate descriptor-local part '${part}'`);
      seen.add(part);
      parts.push(part);
      walk(child);
    }
  };
  walk(anatomy);
  return parts;
}

function assertLocalPart(name, partSet, part, surface) {
  if (!partSet.has(part)) {
    throw new Error(
      `[components-api] ${name}: ${surface} targets part '${part}', which is not in the descriptor anatomy (${[...partSet].join(', ')})`,
    );
  }
}

export function validateDescriptorLocalParts(name, descriptor) {
  const parts = anatomyParts(descriptor.structure?.anatomy);
  const partSet = new Set(parts);

  const base = descriptor.structure?.base || {};
  for (const part of Object.keys(base)) assertLocalPart(name, partSet, part, 'structure.base');

  const variants = descriptor.variants || {};
  for (const [axis, values] of Object.entries(variants)) {
    for (const [value, partMap] of Object.entries(values)) {
      for (const part of Object.keys(partMap || {})) {
        assertLocalPart(name, partSet, part, `variants.${axis}.${value}`);
      }
    }
  }

  const slots = descriptor.api?.slots || {};
  for (const [slotName, slot] of Object.entries(slots)) {
    assertLocalPart(name, partSet, slot.part, `api.slots.${slotName}.part`);
  }

  const target = descriptor.api?.behaviour?.pressable?.target;
  if (target !== undefined) assertLocalPart(name, partSet, target, 'api.behaviour.pressable.target');

  return parts;
}

async function loadDescriptor(spec, source) {
  const js = emitDescriptorJsFromSource(spec, source);
  const mod = await import('data:text/javascript,' + encodeURIComponent(js));
  const descriptor = mod[exportNameFor(spec.name)];
  if (!descriptor || !descriptor.api) {
    throw new Error(`[components-api] loadDescriptor: '${spec.name}' export ${exportNameFor(spec.name)} missing/invalid api`);
  }
  validateDescriptorLocalParts(spec.name, descriptor);
  return descriptor;
}

function buildProps(api, variants) {
  const lines = [];
  let usesAccent = false;
  let usesIcon = false;
  let hasDefault = false;
  const regionParts = Object.values(api.slots).filter((s) => s.kind === 'region').map((s) => s.part);
  const componentSlots = Object.entries(api.slots)
    .filter(([, s]) => s.component === true)
    .map(([slotName, slot]) => ({ slotName, ...slot }));

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
    if (slot.component === true) {
      if (slot.kind === 'icon-name') usesIcon = true;
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

  const acceptsChildren = hasDefault || regionParts.length > 0 || componentSlots.length > 0;
  lines.push(acceptsChildren ? '  children?: React.ReactNode;' : '  children?: never;');

  return { lines, usesAccent, usesIcon, regionParts, componentSlots };
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

function emitContent(api, partTypeName, displayNameConst) {
  const lines = [`  const content: Partial<Record<${partTypeName}, React.ReactNode>> = {};`];
  const regionSlots = Object.values(api.slots).filter((slot) => slot.kind === 'region');
  const fallbackRegion = Object.values(api.slots).find((slot) => slot.kind === 'region' && slot.default === true);
  const componentSlots = Object.values(api.slots).filter((slot) => slot.component === true);
  const fallbackSlot = Object.values(api.slots).find((slot) => slot.default === true);

  // Regions WITHOUT component slots (Topbar) use the wholesale per-region
  // harvest. With component slots declared, region markers are composition
  // entries themselves (the walker routes + validates them per scope), so the
  // separate region harvest would be a dead second walk.
  if (regionSlots.length && !componentSlots.length) {
    lines.push(`  const harvested = harvestNuriSlots<${partTypeName}>(props.children, ${fallbackRegion ? q(fallbackRegion.part) : 'undefined'});`);
    for (const slot of regionSlots) {
      lines.push(`  if (harvested[${q(slot.part)}] !== undefined) content[${q(slot.part)}] = harvested[${q(slot.part)}];`);
    }
  }

  if (componentSlots.length) {
    lines.push(`  const composition: Partial<Record<${partTypeName}, NuriCompositionEntry<${partTypeName}>[]>> = {};`);
    lines.push(`  const harvestedComposition = harvestNuriComposition<${partTypeName}>(props.children, ${fallbackSlot ? q(fallbackSlot.part) : 'undefined'}, ${displayNameConst});`);
    lines.push('  if (harvestedComposition.hasSlots) {');
    lines.push('    composition.root = harvestedComposition.items;');
    lines.push('  }');
  }

  for (const [slotName, slot] of Object.entries(api.slots)) {
    if (slot.kind === 'region' || slot.component === true) continue;
    if (slot.default === true) {
      if (componentSlots.length) {
        lines.push(`  if (!harvestedComposition.hasSlots && props.children !== undefined) content[${q(slot.part)}] = props.children;`);
      } else {
        lines.push(`  if (props.children !== undefined) content[${q(slot.part)}] = props.children;`);
      }
      continue;
    }
    const prop = slot.prop || (slot.kind === 'icon-name' || slot.kind === 'text' ? slotName : null);
    if (prop) lines.push(`  if (props.${prop} !== undefined) content[${q(slot.part)}] = props.${prop};`);
  }

  return lines;
}

function emitBehaviour(api, partTypeName) {
  const pressable = api.behaviour && api.behaviour.pressable;
  const lines = [`  const behaviour: NuriBehaviour<${partTypeName}> = {};`];
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
    ` * The exact public export for \`${name}\` (Path C component-API). \`{Name}Props\``,
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
  const partTypeName = `${Pascal}Part`;
  const parts = validateDescriptorLocalParts(name, descriptor);
  const { lines, usesAccent, usesIcon, regionParts, componentSlots } = buildProps(descriptor.api, descriptor.variants || {});
  const hasRegions = regionParts.length > 0;
  const hasComponentSlots = componentSlots.length > 0;

  const rendererImports = ['nuriNames', 'renderDescriptorInstance'];
  if (hasRegions) rendererImports.push('createNuriSlot');
  if (hasRegions && !hasComponentSlots) rendererImports.push('harvestNuriSlots');
  if (hasComponentSlots) rendererImports.push('createNuriSlot', 'harvestNuriComposition');
  const uniqueRendererImports = [...new Set(rendererImports)];

  const imports = [
    "import * as React from 'react';",
    `import { ${uniqueRendererImports.join(', ')} } from '../../runtime/renderer';`,
    `import type { NuriBehaviour${hasComponentSlots ? ', NuriCompositionEntry' : ''} } from '../../runtime/renderer';`,
    `import { ${descId} } from '@nuri/spec/descriptors/${name}';`,
    "import { recipes } from '../data/recipes';",
  ];
  if (usesAccent) {
    imports.push("import { NuriScope } from '../../theme';");
    imports.push("import type { Accent } from '../data/tokens';");
  }
  if (usesIcon) imports.push("import type { IconName } from '../data/icons';");

  const displayNameConst = `${local}DisplayName`;
  const innerName = `${Pascal}Inner`;
  const body = [
    `export type ${Pascal}Props = {`,
    ...lines,
    '};',
    '',
    `type ${partTypeName} = ${parts.map((part) => `'${part}'`).join(' | ')};`,
    '',
    `const ${displayNameConst} = nuriNames('${name}').rn;`,
  ];

  if (hasRegions) {
    for (const part of regionParts) {
      body.push(`export const ${Pascal}${pascalPart(part)} = createNuriSlot(${q(part)}, \`${'${'}${displayNameConst}}${pascalPart(part)}\`, 'children', ${displayNameConst});`);
    }
  }
  if (hasComponentSlots) {
    for (const slot of componentSlots) {
      const slotPascal = pascalPart(slot.slotName);
      if (slot.kind === 'icon-name') {
        body.push(
          `export type ${Pascal}${slotPascal}Props = {`,
          '  name: IconName;',
          '  children?: never;',
          '};',
          `export const ${Pascal}${slotPascal} = createNuriSlot<${Pascal}${slotPascal}Props>(${q(slot.part)}, \`${'${'}${displayNameConst}}${slotPascal}\`, 'name', ${displayNameConst});`,
        );
      } else {
        body.push(
          `export type ${Pascal}${slotPascal}Props = {`,
          '  children?: React.ReactNode;',
          '};',
          `export const ${Pascal}${slotPascal} = createNuriSlot<${Pascal}${slotPascal}Props>(${q(slot.part)}, \`${'${'}${displayNameConst}}${slotPascal}\`, 'children', ${displayNameConst});`,
        );
      }
    }
  }

  body.push(
    '',
    `const ${innerName}: React.FC<${Pascal}Props> = (props) => {`,
    ...emitSelection(descriptor),
    ...emitContent(descriptor.api, partTypeName, displayNameConst),
    ...emitBehaviour(descriptor.api, partTypeName),
    '',
    '  return renderDescriptorInstance({',
    `    descriptor: ${descId},`,
    `    recipe: recipes[${q(name)}],`,
    `    displayName: ${displayNameConst},`,
    '    selection,',
    '    content,',
    ...(hasComponentSlots ? ['    composition,'] : []),
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
  for (const { name, Pascal, regionSubs, componentSubs } of entries) {
    const values = [Pascal, ...regionSubs, ...componentSubs].join(', ');
    lines.push(`export { ${values} } from './${name}';`);
    lines.push(`export type { ${[`${Pascal}Props`, ...componentSubs.map((sub) => `${sub}Props`)].join(', ')} } from './${name}';`);
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
    const componentSubs = Object.entries(descriptor.api.slots)
      .filter(([, s]) => s.component === true)
      .map(([slotName]) => `${Pascal}${pascalPart(slotName)}`);
    indexEntries.push({ name: spec.name, Pascal, regionSubs, componentSubs });
  }
  files.push({ filename: 'index.ts', source: emitIndex(indexEntries) });
  return { files, coverage: descriptorComponents.map((s) => s.name) };
}
