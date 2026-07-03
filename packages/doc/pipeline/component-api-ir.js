import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const COMPONENT_API_DOCS = [
  {
    source: 'button',
    name: 'button',
    title: 'Button',
    nav: 1,
    file: 'packages/rn/generated/components/button.ts',
    type: 'ButtonProps',
    relatedPrefix: 'Button',
  },
  {
    source: 'icon-button',
    name: 'icon-button',
    title: 'Icon Button',
    nav: 2,
    file: 'packages/rn/generated/components/icon-button.ts',
    type: 'IconButtonProps',
    relatedPrefix: 'IconButton',
  },
  {
    source: 'icon-avatar',
    name: 'icon-avatar',
    title: 'Icon Avatar',
    nav: 3,
    file: 'packages/rn/generated/components/icon-avatar.ts',
    type: 'IconAvatarProps',
    relatedPrefix: 'IconAvatar',
  },
  {
    source: 'list',
    name: 'list',
    title: 'List',
    nav: 4,
    file: 'packages/rn/generated/components/list.ts',
    type: 'ListProps',
    relatedPrefix: 'List',
  },
  {
    source: 'tab-bar',
    name: 'tab-bar',
    title: 'Tab Bar',
    nav: 6,
    file: 'packages/rn/generated/components/tab-bar.ts',
    type: 'TabBarProps',
    relatedPrefix: 'TabBar',
  },
  {
    source: 'list-action',
    name: 'list-action',
    title: 'List Action',
    nav: 5,
    file: 'packages/rn/generated/components/list-action.ts',
    type: 'ListActionProps',
    relatedPrefix: 'ListAction',
  },
  {
    source: 'tab-bar-item',
    name: 'tab-bar-item',
    title: 'Tab Bar Item',
    nav: 7,
    file: 'packages/rn/generated/components/tab-bar-item.ts',
    type: 'TabBarItemProps',
    relatedPrefix: 'TabBarItem',
  },
  {
    source: 'topbar',
    name: 'topbar',
    title: 'Topbar',
    nav: 8,
    file: 'packages/rn/generated/components/topbar.ts',
    type: 'TopbarProps',
    relatedPrefix: 'Topbar',
  },
  {
    source: 'stack',
    title: 'Stack',
    nav: 9,
    file: 'packages/rn/primitives/Stack.tsx',
    type: 'StackProps',
  },
  {
    source: 'view',
    title: 'View',
    nav: 10,
    file: 'packages/rn/primitives/View.tsx',
    type: 'ViewProps',
  },
  {
    source: 'typography',
    title: 'Typography',
    nav: 11,
    file: 'packages/rn/primitives/Text.tsx',
    type: 'TextProps',
  },
  {
    source: 'icon',
    title: 'Icon',
    nav: 12,
    file: 'packages/rn/primitives/NuriIcon.tsx',
    type: 'NuriIconProps',
  },
];

const NOTE_BY_PROP = {
  variant: 'style axis',
  size: 'style axis',
  width: 'style axis',
  height: 'style axis',
  minHeight: 'style axis',
  minWidth: 'style axis',
  padding: 'style axis',
  paddingX: 'style axis',
  paddingY: 'style axis',
  paddingStart: 'style axis',
  paddingEnd: 'style axis',
  paddingTop: 'style axis',
  paddingBottom: 'style axis',
  radius: 'style axis',
  aspectRatio: 'style axis',
  direction: 'style axis',
  align: 'style axis',
  justify: 'style axis',
  gap: 'style axis',
  wrap: 'style axis',
  fill: 'style axis',
  emphasis: 'style axis',
  muted: 'style axis',
  chrome: 'style axis',
  accent: 'theme scope',
  onPress: 'pressable behaviour',
  disabled: 'pressable behaviour',
  accessibilityLabel: 'pressable behaviour',
  selected: 'state axis',
  icon: 'scalar icon name',
  name: 'scalar icon name',
  label: 'scalar label',
  color: 'glyph rendering',
  dimension: 'glyph rendering',
};

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

function pascal(name) {
  const c = camel(name);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function componentPropTypeName(name) {
  return `${pascal(name)}Props`;
}

function noteForProp(name, type, isPrimaryType, childrenNote) {
  // The primary type's `children` note is DATA-derived (componentApiIrFromFile
  // reads the descriptor's api.slots): a declared `default: true` sink is a
  // 'default content slot'; children accepted only for typed slot/region
  // composition are 'composition children' — the docs never promise a bare-
  // children sink the engine does not have.
  if (name === 'children') return isPrimaryType ? (childrenNote ?? 'default content slot') : 'slot content';
  if (NOTE_BY_PROP[name]) return NOTE_BY_PROP[name];
  if (type === 'IconName') return 'scalar icon name';
  return 'component prop';
}

function splitTopLevel(value, separator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    const prev = value[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ')' || ch === ']') depth -= 1;
    else if (ch === separator && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function objectBody(expr) {
  const trimmed = expr.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}') ? trimmed.slice(1, -1) : null;
}

function extractExportedTypeAliases(source) {
  const aliases = new Map();
  const scanSource = source.replace(/\/\/.*$/gm, '');
  const marker = /export\s+type\s+([A-Za-z_$][\w$]*)\s*=/g;
  for (const match of scanSource.matchAll(marker)) {
    const [, typeName] = match;
    const start = match.index + match[0].length;
    let i = start;
    let depth = 0;
    let quote = null;
    for (; i < scanSource.length; i += 1) {
      const ch = scanSource[i];
      const prev = scanSource[i - 1];
      if (quote) {
        if (ch === quote && prev !== '\\') quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
        continue;
      }
      if (ch === '{' || ch === '(' || ch === '[') depth += 1;
      else if (ch === '}' || ch === ')' || ch === ']') depth -= 1;
      else if (ch === ';' && depth === 0) break;
    }
    aliases.set(typeName, scanSource.slice(start, i).trim());
  }
  return aliases;
}

function objectKeysType(source, exportName) {
  const re = new RegExp(`export\\s+const\\s+${exportName}\\s*:\\s*\\{([\\s\\S]*?)\\n\\}\\s*=`);
  const match = re.exec(source);
  if (!match) return null;
  const keys = [];
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trim();
    const prop = /^'([^']+)'|^([A-Za-z_$][\w$]*)\s*:/.exec(line);
    if (prop) keys.push(prop[1] || prop[2]);
  }
  return keys.length ? keys.map((k) => `'${k}'`).join(' | ') : null;
}

function displayType(rawType, aliases) {
  const type = rawType.trim();
  const alias = aliases.get(type);
  if (!alias || objectBody(alias)) return type;
  return alias;
}

function parsePropObject(spec, typeName, body, isPrimaryType, aliases) {
  const props = [];
  const forbidden = [];
  for (const rawLine of body.split('\n')) {
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    if (!line || line.startsWith('//')) continue;
    const prop = /^([A-Za-z_$][\w$]*)(\?)?:\s*([^;]+);?$/.exec(line);
    if (!prop) {
      throw new Error(`[docs] ${spec.name || spec.source}: unsupported ${typeName} member '${line}'`);
    }
    const [, name, optional, rawType] = prop;
    const type = displayType(rawType, aliases);
    const entry = {
      name,
      required: optional !== '?',
      type,
      note: noteForProp(name, type, isPrimaryType, spec.childrenNote),
    };
    if (type === 'never') forbidden.push(entry);
    else props.push(entry);
  }
  if (!props.length && !forbidden.length) {
    throw new Error(`[docs] ${spec.name || spec.source}: '${typeName}' did not expose any documentable props`);
  }
  return { typeName, props, forbidden };
}

function propsFromType(spec, typeName, aliases, seen = new Set()) {
  if (seen.has(typeName)) {
    throw new Error(`[docs] ${spec.source}: circular prop type alias '${typeName}'`);
  }
  const expr = aliases.get(typeName);
  if (!expr) {
    throw new Error(`[docs] ${spec.source}: source does not export '${typeName}'`);
  }
  seen.add(typeName);
  try {
    const body = objectBody(expr);
    if (body != null) return parsePropObject(spec, typeName, body, typeName === spec.type, aliases);

    const parts = splitTopLevel(expr, '&');
    if (parts.length < 2) {
      throw new Error(`[docs] ${spec.source}: '${typeName}' is not an object prop type or supported intersection`);
    }

    const props = [];
    const forbidden = [];
    for (const part of parts) {
      const inline = objectBody(part);
      const parsed = inline != null
        ? parsePropObject(spec, typeName, inline, typeName === spec.type, aliases)
        : propsFromType({ ...spec, type: part }, part, aliases, seen);
      props.push(...parsed.props);
      forbidden.push(...(parsed.forbidden || []));
    }
    return { typeName, props, forbidden };
  } finally {
    seen.delete(typeName);
  }
}

export function componentApiIrFromSource(spec, source, extraSources = []) {
  const primaryTypeName = spec.type || componentPropTypeName(spec.name);
  const publicTypePrefix = spec.relatedPrefix || primaryTypeName.replace(/Props$/, '');
  const aliases = new Map();

  for (const text of [...extraSources, source]) {
    for (const [name, expr] of extractExportedTypeAliases(text)) aliases.set(name, expr);
  }

  const tokenSource = extraSources.join('\n');
  const sizeLeaf = objectKeysType(tokenSource, 'size');
  const ratioLeaf = objectKeysType(tokenSource, 'ratio');
  if (sizeLeaf) aliases.set('SizeLeaf', sizeLeaf);
  if (ratioLeaf) aliases.set('RatioLeaf', ratioLeaf);

  const types = [];
  for (const typeName of aliases.keys()) {
    if (spec.relatedPrefix) {
      if (!typeName.endsWith('Props') || !typeName.startsWith(publicTypePrefix)) continue;
    } else if (typeName !== primaryTypeName) {
      continue;
    }
    types.push(propsFromType({ ...spec, type: primaryTypeName }, typeName, aliases));
  }
  types.sort((a, b) => (a.typeName === primaryTypeName ? -1 : b.typeName === primaryTypeName ? 1 : 0));
  if (!types.some((t) => t.typeName === primaryTypeName)) {
    throw new Error(`[docs] ${spec.source}: source does not export '${primaryTypeName}' as a supported prop type`);
  }

  return {
    name: spec.name || spec.source,
    source: spec.source,
    title: spec.title,
    nav: spec.nav,
    typeName: primaryTypeName,
    src: spec.file,
    types,
    props: types[0].props,
    forbidden: types[0].forbidden,
  };
}

export async function componentApiIrFromFile(spec, repoRoot) {
  const source = await readFile(resolve(repoRoot, spec.file), 'utf8');
  const extraSources = await Promise.all([
    readFile(resolve(repoRoot, 'packages/spec/components/schema.ts'), 'utf8'),
    readFile(resolve(repoRoot, 'packages/rn/generated/data/tokens.ts'), 'utf8'),
  ]);
  // Descriptor-backed pages derive the primary `children` note from the api
  // DATA (the browser-ESM descriptor twin — the same read docs.js uses): a
  // `default: true` slot is a real bare-children sink; slots without one accept
  // children for typed composition only.
  let childrenNote;
  if (spec.name) {
    const twin = pathToFileURL(resolve(repoRoot, `packages/prototype/generated/descriptors/${spec.name}.js`)).href;
    const descriptor = (await import(twin))[`${camel(spec.name)}Descriptor`];
    const slots = Object.values(descriptor?.api?.slots ?? {});
    if (slots.length) {
      childrenNote = slots.some((slot) => slot.default === true) ? 'default content slot' : 'composition children';
    }
  }
  return componentApiIrFromSource({ ...spec, childrenNote }, source, extraSources);
}
