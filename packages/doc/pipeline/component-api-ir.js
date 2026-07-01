import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const PILOT_COMPONENTS = new Set(['button', 'icon-avatar']);

const NOTE_BY_PROP = {
  variant: 'style axis',
  size: 'style axis',
  accent: 'theme scope',
  onPress: 'pressable behaviour',
  disabled: 'pressable behaviour',
  accessibilityLabel: 'pressable behaviour',
  icon: 'scalar icon name',
  name: 'scalar icon name',
};

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

function pascal(name) {
  const c = camel(name);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function isComponentApiPilot(name) {
  return PILOT_COMPONENTS.has(name);
}

export function componentPropTypeName(name) {
  return `${pascal(name)}Props`;
}

function noteForProp(name, type, isPrimaryType) {
  if (name === 'children') return isPrimaryType ? 'default content slot' : 'slot content';
  if (NOTE_BY_PROP[name]) return NOTE_BY_PROP[name];
  if (type === 'IconName') return 'scalar icon name';
  return 'component prop';
}

function parsePropObject(spec, typeName, body, isPrimaryType) {
  const props = [];
  const forbidden = [];
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;
    const prop = /^([A-Za-z_$][\w$]*)(\?)?:\s*(.+);$/.exec(line);
    if (!prop) {
      throw new Error(`[docs] ${spec.name}: unsupported ${typeName} member '${line}'`);
    }
    const [, name, optional, type] = prop;
    const entry = {
      name,
      required: optional !== '?',
      type,
      note: noteForProp(name, type, isPrimaryType),
    };
    if (type === 'never') forbidden.push(entry);
    else props.push(entry);
  }
  if (!props.length && !forbidden.length) {
    throw new Error(`[docs] ${spec.name}: '${typeName}' did not expose any documentable props`);
  }
  return { typeName, props, forbidden };
}

export function componentApiIrFromSource(spec, source) {
  const primaryTypeName = componentPropTypeName(spec.name);
  const publicTypePrefix = pascal(spec.name);
  const typeRe = /export\s+type\s+([A-Za-z_$][\w$]*)\s*=\s*\{([\s\S]*?)\n\};/g;

  const types = [];
  for (const match of source.matchAll(typeRe)) {
    const [, typeName, body] = match;
    if (!typeName.endsWith('Props') || !typeName.startsWith(publicTypePrefix)) continue;
    types.push(parsePropObject(spec, typeName, body, typeName === primaryTypeName));
  }
  if (!types.some((t) => t.typeName === primaryTypeName)) {
    throw new Error(`[docs] ${spec.name}: generated RN file does not export '${primaryTypeName}' as a narrow object type`);
  }

  return {
    name: spec.name,
    source: spec.source,
    typeName: primaryTypeName,
    src: `packages/rn/generated/components/${spec.source}.ts`,
    types,
    props: types[0].props,
    forbidden: types[0].forbidden,
  };
}

export async function componentApiIrFromFile(spec, rnGenerated) {
  const file = resolve(rnGenerated, 'components', `${spec.name}.ts`);
  return componentApiIrFromSource(spec, await readFile(file, 'utf8'));
}
