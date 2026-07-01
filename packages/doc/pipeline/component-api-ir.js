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
  children: 'default content slot',
  icon: 'scalar icon name',
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

export function componentApiIrFromSource(spec, source) {
  const typeName = componentPropTypeName(spec.name);
  const match = new RegExp(`export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`).exec(source);
  if (!match) {
    throw new Error(`[docs] ${spec.name}: generated RN file does not export '${typeName}' as a narrow object type`);
  }

  const props = [];
  const forbidden = [];
  for (const rawLine of match[1].split('\n')) {
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
      note: NOTE_BY_PROP[name] || 'component prop',
    };
    if (type === 'never') forbidden.push(entry);
    else props.push(entry);
  }
  if (!props.length) throw new Error(`[docs] ${spec.name}: '${typeName}' did not expose any documentable props`);

  return {
    name: spec.name,
    source: spec.source,
    typeName,
    src: `packages/rn/generated/components/${spec.source}.ts`,
    props,
    forbidden,
  };
}

export async function componentApiIrFromFile(spec, rnGenerated) {
  const file = resolve(rnGenerated, 'components', `${spec.name}.ts`);
  return componentApiIrFromSource(spec, await readFile(file, 'utf8'));
}
