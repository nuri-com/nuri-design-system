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

import { emitDescriptorJsFromSource, exportNameFor, validateDescriptorTypographyFlow } from './descriptors.js';

const pascalCase = (kebab) => kebab.split('-').map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join('');
const pascalPart = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const q = (value) => JSON.stringify(value);

const PRESSABLE_TS = {
  onPress: '() => void',
  disabled: 'boolean',
  accessibilityLabel: 'string',
  accessibilityValue: 'string',
};
const SLOT_PROP_TS = { onPress: '() => void', disabled: 'boolean', accessibilityLabel: 'string', source: 'ImageSourcePropType' };
const INPUT_TS = {
  value: 'string',
  onChangeText: '(text: string) => void',
  placeholder: 'string',
  inputMode: "'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search'",
  secureTextEntry: 'boolean',
  autoCapitalize: "'none' | 'sentences' | 'words' | 'characters'",
  sanitize: '(text: string) => string',
  maxLength: 'number',
  disabled: 'boolean',
  onFocus: '() => void',
  onBlur: '() => void',
  accessibilityLabel: 'string',
};

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
      if (child.component && child.el) throw new Error(`[components-api] part '${part}' declares both component and el`);
      if (child.component && child.parts) throw new Error(`[components-api] component part '${part}' cannot declare nested parts`);
      if (!child.component && !child.el) throw new Error(`[components-api] part '${part}' declares neither component nor el`);
      seen.add(part);
      parts.push(part);
      walk(child);
    }
  };
  walk(anatomy);
  return parts;
}

function anatomyIndex(anatomy) {
  const index = new Map([['root', anatomy]]);
  const walk = (node) => {
    if (!node?.parts) return;
    for (const [part, child] of Object.entries(node.parts)) {
      index.set(part, child);
      walk(child);
    }
  };
  walk(anatomy);
  return index;
}

function componentRefs(descriptor) {
  const refs = [];
  const walk = (part, node) => {
    if (node.component) refs.push({ part, component: node.component, props: node.props || {} });
    for (const [childPart, child] of Object.entries(node.parts || {})) walk(childPart, child);
  };
  walk('root', descriptor.structure.anatomy);
  return refs;
}

function componentRefsByPart(descriptor) {
  return new Map(componentRefs(descriptor).map((ref) => [ref.part, ref]));
}

function publicPropsForDescriptor(descriptor) {
  const props = new Set(descriptor.api.axes || []);
  if (descriptor.api.themeScope?.accent) props.add('accent');
  for (const prop of descriptor.api.behaviour?.pressable?.props || []) props.add(prop);
  for (const prop of descriptor.api.behaviour?.input?.props || []) props.add(prop);
  for (const prop of Object.keys(descriptor.api.propMaps || {})) props.add(prop);
  for (const [slotName, slot] of Object.entries(descriptor.api.slots || {})) {
    if (slot.default === true) props.add('children');
    if (slot.prop) props.add(slot.prop);
    else if (!slot.component && (slot.kind === 'icon-name' || slot.kind === 'image-source' || slot.kind === 'text')) props.add(slotName);
  }
  return props;
}

export function validateComponentReferences(catalog) {
  const names = new Set(Object.keys(catalog));

  for (const [name, descriptor] of Object.entries(catalog)) {
    const componentParts = new Set(componentRefs(descriptor).map((ref) => ref.part));
    for (const [surface, partMap] of [
      ['structure.base', descriptor.structure?.base || {}],
      ...Object.entries(descriptor.variants || {}).flatMap(([axis, values]) =>
        Object.entries(values).map(([value, partMap]) => [`variants.${axis}.${value}`, partMap]),
      ),
    ]) {
      for (const part of Object.keys(partMap || {})) {
        if (componentParts.has(part)) throw new Error(`[components-api] ${name}: ${surface} styles component-ref part '${part}' — the referenced component owns its contract`);
      }
    }

    for (const ref of componentRefs(descriptor)) {
      const target = catalog[ref.component];
      if (!target) throw new Error(`[components-api] ${name}: part '${ref.part}' references unknown component '${ref.component}'`);
      const targetProps = publicPropsForDescriptor(target);
      for (const [prop, value] of Object.entries(ref.props || {})) {
        if (!targetProps.has(prop)) {
          throw new Error(`[components-api] ${name}: component-ref '${ref.part}' maps prop '${prop}', which is not public on '${ref.component}'`);
        }
        if (typeof value === 'string' && value.startsWith('$axis.')) {
          const axis = value.slice('$axis.'.length);
          const sourceValues = Object.keys(descriptor.variants?.[axis] || {});
          if (!sourceValues.length) throw new Error(`[components-api] ${name}: component-ref '${ref.part}' binds missing axis '${axis}'`);
          const targetValues = Object.keys(target.variants?.[prop] || {});
          if (targetValues.length) {
            for (const sourceValue of sourceValues) {
              if (!targetValues.includes(sourceValue)) {
                throw new Error(`[components-api] ${name}: component-ref '${ref.part}' axis '${axis}' value '${sourceValue}' is not valid for '${ref.component}.${prop}'`);
              }
            }
          }
        } else if (typeof value === 'string' && value.startsWith('$slot.')) {
          const { fallback } = parseSlotBinding(value);
          const targetValues = Object.keys(target.variants?.[prop] || {});
          if (fallback !== undefined && targetValues.length && !targetValues.includes(fallback)) {
            throw new Error(`[components-api] ${name}: component-ref '${ref.part}' slot fallback '${prop}' value '${fallback}' is not valid for '${ref.component}.${prop}'`);
          }
        } else if (typeof value === 'string' && !value.startsWith('$slot.') && target.variants?.[prop]) {
          const targetValues = Object.keys(target.variants[prop] || {});
          if (!targetValues.includes(value)) {
            throw new Error(`[components-api] ${name}: component-ref '${ref.part}' fixed '${prop}' value '${value}' is not valid for '${ref.component}'`);
          }
        }
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (name, stack = []) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw new Error(`[components-api] component-ref cycle: ${[...stack, name].join(' -> ')}`);
    visiting.add(name);
    for (const ref of componentRefs(catalog[name] || {})) {
      if (names.has(ref.component)) visit(ref.component, [...stack, name]);
    }
    visiting.delete(name);
    visited.add(name);
  };
  for (const name of names) visit(name);
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
  const input = descriptor.api?.behaviour?.input;
  if (input?.target !== undefined) assertLocalPart(name, partSet, input.target, 'api.behaviour.input.target');
  if (input?.focusTarget !== undefined) assertLocalPart(name, partSet, input.focusTarget, 'api.behaviour.input.focusTarget');
  if (input?.labelPart !== undefined) assertLocalPart(name, partSet, input.labelPart, 'api.behaviour.input.labelPart');

  return parts;
}

async function loadDescriptor(spec, source) {
  const js = emitDescriptorJsFromSource(spec, source);
  const mod = await import('data:text/javascript,' + encodeURIComponent(js));
  const descriptor = mod[exportNameFor(spec.name)];
  if (!descriptor || !descriptor.api) {
    throw new Error(`[components-api] loadDescriptor: '${spec.name}' export ${exportNameFor(spec.name)} missing/invalid api`);
  }
  validateDescriptorTypographyFlow(spec.name, descriptor);
  validateDescriptorLocalParts(spec.name, descriptor);
  return descriptor;
}

function slotPropNamesForComponentRef(ref) {
  if (!ref) return [];
  const names = [];
  for (const value of Object.values(ref.props || {})) {
    if (typeof value === 'string' && value.startsWith('$slot.')) names.push(parseSlotBinding(value).prop);
  }
  return [...new Set(names)];
}

function requiredSlotPropNamesForComponentRef(ref, slot, catalog) {
  const names = slotPropNamesForComponentRef(ref);
  if (slot?.kind !== 'icon-name') return [];
  const target = catalog?.[ref?.component];
  return names.filter((name) => {
    if (name === 'accessibilityLabel') return true;
    const targetProp = Object.entries(ref?.props || {}).find(([, value]) =>
      typeof value === 'string' && value.startsWith('$slot.') && parseSlotBinding(value).prop === name
    )?.[0];
    if (!targetProp) return false;
    return Object.entries(target?.api?.slots || {}).some(([slotName, targetSlot]) =>
      (targetSlot.prop || slotName) === targetProp && targetSlot.required === true
    );
  });
}

function parseSlotBinding(value) {
  const body = value.slice('$slot.'.length);
  const [prop, ...fallbackParts] = body.split('|');
  return { prop, fallback: fallbackParts.length ? fallbackParts.join('|') : undefined };
}

function slotPropTs(prop, ref, catalog) {
  if (prop === 'accent') return 'Accent';
  if (prop === 'variant') {
    const values = Object.keys(catalog?.[ref?.component]?.variants?.variant || {});
    if (values.length) return values.map((v) => `'${v}'`).join(' | ');
  }
  return SLOT_PROP_TS[prop] || 'unknown';
}

function buildProps(api, variants, descriptor) {
  const lines = [];
  let usesAccent = false;
  let usesIcon = false;
  let usesImageSource = false;
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
  const inputProps = (api.behaviour && api.behaviour.input && api.behaviour.input.props) || [];
  for (const p of inputProps) lines.push(`  ${p}?: ${INPUT_TS[p]};`);

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
      if (slot.kind === 'image-source') {
        usesImageSource = true;
        lines.push(`  ${slot.prop}${slot.required ? '' : '?'}: ImageSourcePropType;`);
      } else {
        usesIcon = true;
        lines.push(`  ${slot.prop}${slot.required ? '' : '?'}: IconName;`);
      }
      continue;
    }
    if (slot.kind === 'icon-name') {
      usesIcon = true;
      lines.push(`  ${slotName}?: IconName;`);
    } else if (slot.kind === 'text') {
      lines.push(`  ${slotName}?: string;`);
    } else if (slot.kind === 'image-source') {
      usesImageSource = true;
      lines.push(`  ${slotName}?: ImageSourcePropType;`);
    }
  }

  const acceptsChildren = hasDefault || regionParts.length > 0 || componentSlots.length > 0;
  lines.push(acceptsChildren ? '  children?: React.ReactNode;' : '  children?: never;');

  return { lines, usesAccent, usesIcon, usesImageSource, regionParts, componentSlots };
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

  // THE content-presence BRIDGE (propMaps.contentMode · the selected-bridge
  // sibling): the named slot's scalar prop drives an INTERNAL axis — data in the
  // descriptor, one derived line in the adapter (web mirror: buildComponent).
  const contentMode = descriptor.api.propMaps && descriptor.api.propMaps.contentMode;
  if (contentMode) {
    const slot = descriptor.api.slots[contentMode.slot];
    const prop = (slot && slot.prop) || contentMode.slot;
    lines.push(
      `  selection[${q(contentMode.axis)}] = props.${prop} != null ? ${q(contentMode.present)} : ${q(contentMode.absent)};`,
    );
  }
  return lines;
}

function emitContent(api, partTypeName, displayNameConst, contentType = 'React.ReactNode', imageWins) {
  const lines = [`  const content: Partial<Record<${partTypeName}, ${contentType}>> = {};`];
  const regionSlots = Object.values(api.slots).filter((slot) => slot.kind === 'region');
  const fallbackRegion = Object.values(api.slots).find((slot) => slot.kind === 'region' && slot.default === true);
  const componentSlots = Object.entries(api.slots)
    .filter(([, slot]) => slot.component === true)
    .map(([slotName, slot]) => ({ slotName, ...slot }));
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
    for (const slot of componentSlots.filter((s) => s.required)) {
      lines.push(
        `  if (!harvestedComposition.items.some((entry) => entry.part === ${q(slot.part)})) {`,
        `    throw new Error(\`nuri-factory: '\${${displayNameConst}}' requires ${pascalPart(slot.slotName)}\`);`,
        '  }',
      );
    }
    // A mixed component may keep a REGION as its default bare-children sink.
    // Component-slot harvest switches the adapter to the composition envelope;
    // when no typed marker is authored, preserve the old region fallback exactly
    // as scalar default slots do below. Generic over every descriptor/part name.
    if (fallbackRegion) {
      lines.push(`  if (!harvestedComposition.hasSlots && props.children !== undefined) content[${q(fallbackRegion.part)}] = props.children;`);
    }
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
    const prop = slot.prop || (slot.kind === 'icon-name' || slot.kind === 'image-source' || slot.kind === 'text' ? slotName : null);
    if (prop) {
      const sourceGuard = imageWins?.iconProp === prop ? ` && props.${imageWins.sourceProp} === undefined` : '';
      lines.push(`  if (props.${prop} !== undefined${sourceGuard}) content[${q(slot.part)}] = props.${prop};`);
    }
  }

  return lines;
}

function emitBehaviour(api, partTypeName) {
  const pressable = api.behaviour && api.behaviour.pressable;
  const input = api.behaviour && api.behaviour.input;
  const lines = [`  const behaviour: NuriBehaviour<${partTypeName}> = {};`];
  if (pressable) {
    lines.push('  behaviour.pressable = {', `    target: ${q(pressable.target)},`);
    if (pressable.role) lines.push(`    role: ${q(pressable.role)},`);
    if (pressable.popup) lines.push(`    popup: ${q(pressable.popup)},`);
    // Coerce: the bridge declares both arms, so an OMITTED `selected` announces
    // false — mirroring the web factory's `ctx.base.selected === true` (every tab
    // carries the selected state; never a silent native/web divergence).
    if (api.propMaps?.selected) lines.push('    selected: props.selected === true,');
    for (const prop of pressable.props) lines.push(`    ${prop}: props.${prop},`);
    lines.push('  };');
  }
  if (input) {
    lines.push('  behaviour.input = {', `    target: ${q(input.target)},`);
    if (input.focusTarget) lines.push(`    focusTarget: ${q(input.focusTarget)},`);
    if (input.labelPart) lines.push(`    labelPart: ${q(input.labelPart)},`);
    lines.push('    props: {');
    for (const prop of input.props) lines.push(`      ${prop}: props.${prop},`);
    lines.push('    },', '  };');
  }
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
    ' * behaviour, and optional accent scope before calling the shared descriptor renderer.',
    ' *',
    ' * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/',
    ' * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit',
    " * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.",
    ' * ────────────────────────────────────────────────────────────── */',
    '',
  ].join('\n');
}

export function emitComponentFile(spec, descriptor, catalog = {}) {
  const name = spec.name;
  const Pascal = pascalCase(name);
  const local = lowerFirst(Pascal);
  const descId = exportNameFor(name);
  const partTypeName = `${Pascal}Part`;
  const parts = validateDescriptorLocalParts(name, descriptor);
  const { lines, usesAccent, usesIcon, usesImageSource, regionParts, componentSlots } = buildProps(descriptor.api, descriptor.variants || {}, descriptor);
  const refs = componentRefs(descriptor);
  const refsByPart = componentRefsByPart(descriptor);
  const refComponents = [...new Set(refs.map((ref) => ref.component))];
  const usesSlotAccent = refs.some((ref) =>
    Object.values(ref.props || {}).some((value) => typeof value === 'string' && value.startsWith('$slot.') && parseSlotBinding(value).prop === 'accent'),
  );
  const usesSlotImageSource = refs.some((ref) =>
    Object.values(ref.props || {}).some((value) => typeof value === 'string' && value.startsWith('$slot.') && parseSlotBinding(value).prop === 'source'),
  );
  const iconScalar = Object.entries(descriptor.api.slots).find(([, slot]) => slot.kind === 'icon-name' && slot.prop);
  const imageScalar = Object.entries(descriptor.api.slots).find(([, slot]) => slot.kind === 'image-source' && slot.prop);
  const imageWins = iconScalar && imageScalar
    ? { iconProp: iconScalar[1].prop, sourceProp: imageScalar[1].prop }
    : undefined;
  const hasRegions = regionParts.length > 0;
  const hasComponentSlots = componentSlots.length > 0;
  const hasInput = descriptor.api.behaviour?.input !== undefined;
  const optionalInputLabelSlot = hasInput
    ? componentSlots.find((slot) =>
      slot.part === descriptor.api.behaviour.input.labelPart &&
      slot.kind === 'text' &&
      slot.required !== true,
    )
    : undefined;
  const warnsMissingInputName =
    optionalInputLabelSlot !== undefined &&
    descriptor.api.behaviour.input.props.includes('accessibilityLabel');
  const contentLines = emitContent(
    descriptor.api,
    partTypeName,
    `${local}DisplayName`,
    usesImageSource ? 'NuriContent' : 'React.ReactNode',
    imageWins,
  );

  const rendererImports = ['nuriNames', 'renderDescriptorInstance'];
  if (hasRegions) rendererImports.push('createNuriSlot');
  if (hasRegions && !hasComponentSlots) rendererImports.push('harvestNuriSlots');
  if (hasComponentSlots) rendererImports.push('createNuriSlot', 'harvestNuriComposition');
  const uniqueRendererImports = [...new Set(rendererImports)];

  const rendererTypeImports = [`NuriBehaviour${hasComponentSlots ? ', NuriCompositionEntry' : ''}${usesImageSource ? ', NuriContent' : ''}`];
  const imports = [
    "import * as React from 'react';",
    `import { ${uniqueRendererImports.join(', ')} } from '../../runtime/renderer';`,
    `import type { ${rendererTypeImports.join(', ')} } from '../../runtime/renderer';`,
    `import { ${descId} } from '@nuri/spec/descriptors/${name}';`,
    "import { recipes } from '../data/recipes';",
  ];
  if (usesImageSource || usesSlotImageSource) imports.push("import type { ImageSourcePropType } from 'react-native';");
  if (usesAccent) {
    imports.push("import { scopedByAccent } from '../../primitives/shared';");
    imports.push("import type { Accent } from '../data/tokens';");
  } else if (usesSlotAccent) {
    imports.push("import type { Accent } from '../data/tokens';");
  }
  if (usesIcon) imports.push("import type { IconName } from '../data/icons';");
  for (const component of refComponents) {
    imports.push(`import { ${pascalCase(component)} } from './${component}';`);
  }

  const displayNameConst = `${local}DisplayName`;
  const innerName = `${Pascal}Inner`;
  const body = [
    ...(hasInput ? [`export type ${Pascal}Handle = { focus(): void; blur(): void };`, ''] : []),
    `export type ${Pascal}Props = {`,
    ...lines,
    '};',
    '',
    `type ${partTypeName} = ${parts.map((part) => `'${part}'`).join(' | ')};`,
    '',
    `const ${displayNameConst} = nuriNames('${name}').rn;`,
  ];
  if (imageWins) body.push(`let warned${Pascal}Content = false;`);
  if (warnsMissingInputName) body.push(`let warned${Pascal}AccessibleName = false;`);
  if (refComponents.length) {
    body.push('const componentRegistry = {');
    for (const component of refComponents) {
      body.push(`  ${q(component)}: ${pascalCase(component)} as React.ComponentType<Record<string, unknown>>,`);
    }
    body.push('};');
  }

  if (hasRegions) {
    for (const part of regionParts) {
      const subName = `${Pascal}${pascalPart(part)}`;
      body.push(
        `export type ${subName}Props = {`,
        '  children?: React.ReactNode;',
        '};',
        `export const ${subName} = createNuriSlot<${subName}Props>(${q(part)}, \`${'${'}${displayNameConst}}${pascalPart(part)}\`, 'children', ${displayNameConst});`,
      );
    }
  }
  if (hasComponentSlots) {
    for (const slot of componentSlots) {
      const slotPascal = pascalPart(slot.slotName);
      const ref = refsByPart.get(slot.part);
      const slotPropNames = slotPropNamesForComponentRef(ref);
      const requiredSlotPropNames = new Set(requiredSlotPropNamesForComponentRef(ref, slot, catalog));
      if (slot.kind === 'icon-name') {
        const nameRequired = !ref || requiredSlotPropNames.has('name');
        const propLines = [`  name${nameRequired ? '' : '?'}: IconName;`];
        for (const prop of slotPropNames.filter((p) => p !== 'name')) {
          propLines.push(`  ${prop}${requiredSlotPropNames.has(prop) ? '' : '?'}: ${slotPropTs(prop, ref, catalog)};`);
        }
        body.push(
          `export type ${Pascal}${slotPascal}Props = {`,
          ...propLines,
          '  children?: never;',
          '};',
          `export const ${Pascal}${slotPascal} = createNuriSlot<${Pascal}${slotPascal}Props>(${q(slot.part)}, \`${'${'}${displayNameConst}}${slotPascal}\`, 'name', ${displayNameConst});`,
        );
      } else {
        const isInputLabelSlot =
          slot.kind === 'text' &&
          descriptor.api.behaviour?.input?.labelPart === slot.part;
        const childrenType = isInputLabelSlot ? 'string' : 'React.ReactNode';
        const propLines = [`  children${slot.required ? '' : '?'}: ${childrenType};`];
        for (const prop of slotPropNames.filter((p) => p !== 'children')) {
          propLines.push(`  ${prop}?: ${slotPropTs(prop, ref, catalog)};`);
        }
        body.push(
          `export type ${Pascal}${slotPascal}Props = {`,
          ...propLines,
          '};',
          `export const ${Pascal}${slotPascal} = createNuriSlot<${Pascal}${slotPascal}Props>(${q(slot.part)}, \`${'${'}${displayNameConst}}${slotPascal}\`, 'children', ${displayNameConst});`,
        );
      }
    }
  }

  body.push(
    '',
    hasInput
      ? `const ${innerName} = React.forwardRef<${Pascal}Handle, ${Pascal}Props>((props, ref) => {`
      : `const ${innerName}: React.FC<${Pascal}Props> = (props) => {`,
    ...(imageWins ? [
      `  if (!warned${Pascal}Content && typeof __DEV__ !== 'undefined' && __DEV__ && ((props.${imageWins.iconProp} === undefined) === (props.${imageWins.sourceProp} === undefined))) {`,
      `    warned${Pascal}Content = true;`,
      `    console.warn('[nuri] <' + ${displayNameConst} + '> expects exactly one of "${imageWins.iconProp}" or "${imageWins.sourceProp}"; image source wins when both are provided.');`,
      '  }',
    ] : []),
    ...emitSelection(descriptor),
    ...contentLines,
    ...(warnsMissingInputName ? [
      `  if (!warned${Pascal}AccessibleName && typeof __DEV__ !== 'undefined' && __DEV__ && !harvestedComposition.items.some((entry) => entry.part === ${q(optionalInputLabelSlot.part)}) && props.accessibilityLabel === undefined) {`,
      `    warned${Pascal}AccessibleName = true;`,
      `    console.warn('[nuri] <' + ${displayNameConst} + '> expects either its ${pascalPart(optionalInputLabelSlot.slotName)} slot or accessibilityLabel so the input has an accessible name.');`,
      '  }',
    ] : []),
    ...emitBehaviour(descriptor.api, partTypeName),
    '',
    '  return renderDescriptorInstance({',
    `    descriptor: ${descId},`,
    `    recipe: recipes[${q(name)}],`,
    `    displayName: ${displayNameConst},`,
    '    selection,',
    '    content,',
    ...(hasComponentSlots ? ['    composition,'] : []),
    ...(refComponents.length ? ['    components: componentRegistry,'] : []),
    '    behaviour,',
    ...(hasInput ? ['    inputHandle: ref,'] : []),
    '  });',
    hasInput ? '});' : '};',
    `${innerName}.displayName = \`${'${'}${displayNameConst}}Inner\`;`,
    '',
  );

  if (usesAccent) {
    body.push(
      `export const ${Pascal} = scopedByAccent(${innerName});`,
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
  for (const { name, Pascal, regionSubs, componentSubs, hasInput } of entries) {
    const values = [Pascal, ...regionSubs, ...componentSubs].join(', ');
    lines.push(`export { ${values} } from './${name}';`);
    lines.push(`export type { ${[`${Pascal}Props`, ...(hasInput ? [`${Pascal}Handle`] : []), ...regionSubs.map((sub) => `${sub}Props`), ...componentSubs.map((sub) => `${sub}Props`)].join(', ')} } from './${name}';`);
  }
  return header + '\n' + lines.join('\n') + '\n';
}

export async function emitComponentApi({ descriptorComponents, descriptorsDir }) {
  const files = [];
  const indexEntries = [];
  const loaded = [];
  for (const spec of descriptorComponents) {
    const source = await readFile(`${descriptorsDir}/${spec.name}.ts`, 'utf8');
    const descriptor = await loadDescriptor(spec, source);
    loaded.push({ spec, descriptor });
  }
  const catalog = Object.fromEntries(loaded.map(({ spec, descriptor }) => [spec.name, descriptor]));
  validateComponentReferences(catalog);

  for (const { spec, descriptor } of loaded) {
    files.push({ filename: `${spec.name}.ts`, source: emitComponentFile(spec, descriptor, catalog) });
    const Pascal = pascalCase(spec.name);
    const regionSubs = Object.values(descriptor.api.slots)
      .filter((s) => s.kind === 'region')
      .map((s) => `${Pascal}${pascalPart(s.part)}`);
    const componentSubs = Object.entries(descriptor.api.slots)
      .filter(([, s]) => s.component === true)
      .map(([slotName]) => `${Pascal}${pascalPart(slotName)}`);
    indexEntries.push({ name: spec.name, Pascal, regionSubs, componentSubs, hasInput: descriptor.api.behaviour?.input !== undefined });
  }
  files.push({ filename: 'index.ts', source: emitIndex(indexEntries) });
  return { files, coverage: descriptorComponents.map((s) => s.name) };
}
