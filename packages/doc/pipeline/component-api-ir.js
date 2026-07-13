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
    source: 'alert',
    name: 'alert',
    title: 'Alert',
    nav: 2,
    file: 'packages/rn/generated/components/alert.ts',
    type: 'AlertProps',
    relatedPrefix: 'Alert',
  },
  {
    source: 'icon-button',
    name: 'icon-button',
    title: 'Icon Button',
    nav: 3,
    file: 'packages/rn/generated/components/icon-button.ts',
    type: 'IconButtonProps',
    relatedPrefix: 'IconButton',
  },
  {
    source: 'icon-avatar',
    name: 'icon-avatar',
    title: 'Icon Avatar',
    nav: 4,
    file: 'packages/rn/generated/components/icon-avatar.ts',
    type: 'IconAvatarProps',
    relatedPrefix: 'IconAvatar',
  },
  {
    source: 'list',
    name: 'list',
    title: 'List',
    nav: 5,
    file: 'packages/rn/generated/components/list.ts',
    type: 'ListProps',
    relatedPrefix: 'List',
  },
  {
    source: 'list-action',
    name: 'list-action',
    title: 'List Action',
    nav: 6,
    file: 'packages/rn/generated/components/list-action.ts',
    type: 'ListActionProps',
    relatedPrefix: 'ListAction',
  },
  {
    source: 'text-field',
    name: 'text-field',
    title: 'Text Field',
    nav: 7,
    file: 'packages/rn/generated/components/text-field.ts',
    type: 'TextFieldProps',
    relatedPrefix: 'TextField',
    lead: 'Use a `TextFieldHandle` ref for consumer-owned focus policy. Focus after a sheet enters with `<BottomSheet onOpenComplete={() => ref.current?.focus()}>`; for validation, call `ref.current?.focus()` from the invalid branch of the submit handler. The handle exposes only `focus()` and `blur()`—never the raw native input.',
  },
  {
    source: 'tab-bar',
    name: 'tab-bar',
    title: 'Tab Bar',
    nav: 8,
    file: 'packages/rn/generated/components/tab-bar.ts',
    type: 'TabBarProps',
    relatedPrefix: 'TabBar',
  },
  {
    source: 'tab-bar-item',
    name: 'tab-bar-item',
    title: 'Tab Bar Item',
    nav: 9,
    file: 'packages/rn/generated/components/tab-bar-item.ts',
    type: 'TabBarItemProps',
    relatedPrefix: 'TabBarItem',
  },
  {
    source: 'topbar',
    name: 'topbar',
    title: 'Topbar',
    nav: 10,
    file: 'packages/rn/generated/components/topbar.ts',
    type: 'TopbarProps',
    relatedPrefix: 'Topbar',
  },
  {
    source: 'view',
    title: 'View',
    nav: 11,
    lead: 'Column layout uses `<View>` with the schema default direction; rows use `direction="row"`.',
    file: 'packages/rn/primitives/View.tsx',
    type: 'ViewProps',
  },
  {
    source: 'typography',
    title: 'Typography',
    nav: 12,
    file: 'packages/rn/primitives/Text.tsx',
    type: 'TextProps',
  },
  {
    source: 'icon',
    title: 'Icon',
    nav: 13,
    file: 'packages/rn/primitives/NuriIcon.tsx',
    type: 'NuriIconProps',
  },
  {
    source: 'pressable',
    title: 'Pressable',
    nav: 14,
    file: 'packages/rn/primitives/Pressable.tsx',
    type: 'PressableProps',
  },
  {
    source: 'screen',
    title: 'Screen',
    nav: 15,
    file: 'packages/rn/primitives/Screen.tsx',
    type: 'ScreenProps',
  },
  {
    source: 'header',
    title: 'Header',
    nav: 16,
    file: 'packages/rn/primitives/Header.tsx',
    type: 'HeaderProps',
  },
  {
    source: 'scroll',
    title: 'Scroll',
    nav: 17,
    file: 'packages/rn/primitives/Scroll.tsx',
    type: 'ScrollProps',
  },
  {
    source: 'footer',
    title: 'Footer',
    nav: 18,
    file: 'packages/rn/primitives/Footer.tsx',
    type: 'FooterProps',
  },
  {
    source: 'dock',
    title: 'Dock',
    nav: 19,
    file: 'packages/rn/primitives/Dock.tsx',
    type: 'DockProps',
  },
  {
    source: 'separator',
    title: 'Separator',
    nav: 20,
    file: 'packages/rn/primitives/Separator.tsx',
    type: 'SeparatorProps',
  },
  {
    source: 'bottom-sheet',
    title: 'BottomSheet',
    nav: 21,
    file: 'packages/rn/primitives/BottomSheet.tsx',
    type: 'BottomSheetProps',
  },
  {
    source: 'bottom-sheet-panel',
    title: 'BottomSheet Panel',
    nav: 22,
    file: 'packages/rn/primitives/BottomSheet.tsx',
    type: 'BottomSheetPanelProps',
  },
  {
    source: 'nuri-root',
    title: 'NuriRoot',
    nav: 23,
    lead: '`NuriRoot` composes `NuriThemeProvider` → `OverlayProvider` → the canvas `View` → `NuriSafeAreaProvider` in contractual order. The overlay shares the active theme while staying above safe-area padding, so its outlet covers the whole window; the DS View owns canvas background and foreground scope. Insets remain consumer-resolved plain numbers, and omitted edges default to `0`. This is provider composition, not a behavior controller: `NuriThemeProvider`, `OverlayProvider`, and `NuriSafeAreaProvider` remain public for supported piecemeal assembly.',
    file: 'packages/rn/root.tsx',
    type: 'NuriRootProps',
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
  radiusTop: 'style axis',
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
  elevation: 'style axis',
  accent: 'theme scope',
  onPress: 'pressable behaviour',
  disabled: 'pressable behaviour',
  accessibilityLabel: 'pressable behaviour',
  accessibilityHint: 'pressable behaviour',
  role: 'pressable semantics',
  testID: 'native test hook',
  onLayout: 'RN-only native layout event',
  onLongPress: 'RN-only long-press behaviour',
  hitSlop: 'RN-only native touch target',
  ref: 'RN-only native host ref',
  value: 'input behaviour',
  onChangeText: 'input behaviour',
  placeholder: 'input behaviour',
  inputMode: 'input behaviour',
  secureTextEntry: 'input behaviour',
  onFocus: 'input behaviour',
  onBlur: 'input behaviour',
  selected: 'state axis',
  icon: 'scalar icon name',
  name: 'scalar icon name',
  label: 'scalar label',
  color: 'glyph rendering',
  dimension: 'glyph rendering',
  safeArea: 'safe-area reserve',
  safeAreaTop: 'safe-area reserve',
  safeAreaBottom: 'safe-area reserve',
  insetTop: 'dock inset reserve',
  insetBottom: 'dock inset reserve',
  detent: 'sheet behaviour',
  scrim: 'sheet behaviour',
  open: 'sheet behaviour',
  dismissible: 'sheet behaviour',
  onOpenChange: 'sheet behaviour',
  onOpenComplete: 'post-enter lifecycle',
  edge: 'dock placement',
  ySpace: 'separator spacing',
};

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

function pascal(name) {
  const c = camel(name);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function componentPropTypeName(name) {
  return `${pascal(name)}Props`;
}

function noteForProp(name, type, typeName, isPrimaryType, childrenNote, behaviourNotes = {}) {
  // The primary type's `children` note is DATA-derived (componentApiIrFromFile
  // reads the descriptor's api.slots): a declared `default: true` sink is a
  // 'default content slot'; children accepted only for typed slot/region
  // composition are 'composition children' — the docs never promise a bare-
  // children sink the engine does not have.
  if (name === 'children') return isPrimaryType ? (childrenNote ?? 'default content slot') : 'slot content';
  if (typeName === 'NuriRootProps' && name === 'mode') return 'theme selection; defaults to light';
  if (typeName === 'NuriRootProps' && name === 'accent') return 'theme selection; defaults to lilac';
  if (typeName === 'NuriRootProps' && name === 'safeArea') return 'consumer-resolved inset numbers';
  if (typeName === 'TextProps' && name === 'accessibilityLabel') return 'read-out override';
  if (!isPrimaryType && (name === 'variant' || name === 'accent')) return 'delegated component prop';
  if (isPrimaryType && behaviourNotes.inputProps?.includes(name)) return 'input behaviour';
  if (isPrimaryType && behaviourNotes.pressableProps?.includes(name)) return 'pressable behaviour';
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
  const marker = /(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/g;
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

function propTypeFromAlias(sourceType, propName, aliases) {
  const body = objectBody(aliases.get(sourceType) || '');
  if (body == null) return null;
  const memberSource = body
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
  for (const rawMember of splitTopLevel(memberSource, ';')) {
    const line = rawMember.trim();
    const prop = /^([A-Za-z_$][\w$]*)(\?)?:\s*([\s\S]+)$/.exec(line);
    if (prop && prop[1] === propName) return prop[3].trim();
  }
  return null;
}

function displayType(rawType, aliases) {
  let type = rawType.trim();
  type = type.replace(/NonNullable<\s*([A-Za-z_$][\w$]*)\[['"]([^'"]+)['"]\]\s*>/g, (match, sourceType, propName) => {
    const propType = propTypeFromAlias(sourceType, propName, aliases);
    return propType ? displayType(propType, aliases) : match;
  });
  type = type.replace(/([A-Za-z_$][\w$]*)\[['"]([^'"]+)['"]\]/g, (match, sourceType, propName) => {
    const propType = propTypeFromAlias(sourceType, propName, aliases);
    return propType ? displayType(propType, aliases) : match;
  });
  const alias = aliases.get(type);
  if (!alias || objectBody(alias)) return type;
  return alias;
}

function parsePickExpression(expr) {
  const match = /^Pick<\s*([A-Za-z_$][\w$]*)\s*,\s*([\s\S]+)\s*>$/.exec(expr.trim());
  if (!match) return null;
  const keys = splitTopLevel(match[2], '|').map((part) => {
    const raw = part.trim();
    const quoted = /^['"]([^'"]+)['"]$/.exec(raw);
    if (!quoted) throw new Error(`[docs] unsupported Pick key '${raw}'`);
    return quoted[1];
  });
  return { sourceType: match[1], keys };
}

function parseOmitExpression(expr) {
  const match = /^Omit<\s*([A-Za-z_$][\w$]*)\s*,\s*([\s\S]+)\s*>$/.exec(expr.trim());
  if (!match) return null;
  const keys = splitTopLevel(match[2], '|').map((part) => {
    const raw = part.trim();
    const quoted = /^['"]([^'"]+)['"]$/.exec(raw);
    if (!quoted) throw new Error(`[docs] unsupported Omit key '${raw}'`);
    return quoted[1];
  });
  return { sourceType: match[1], keys };
}

function parsePropObject(spec, typeName, body, isPrimaryType, aliases) {
  const props = [];
  const forbidden = [];
  const memberSource = body
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
  for (const rawMember of splitTopLevel(memberSource, ';')) {
    const line = rawMember.trim();
    if (!line || line.startsWith('//')) continue;
    const prop = /^([A-Za-z_$][\w$]*)(\?)?:\s*([\s\S]+)$/.exec(line);
    if (!prop) {
      throw new Error(`[docs] ${spec.name || spec.source}: unsupported ${typeName} member '${line}'`);
    }
    const [, name, optional, rawType] = prop;
    const type = displayType(rawType, aliases);
    const entry = {
      name,
      required: optional !== '?',
      type,
      note: noteForProp(name, type, typeName, isPrimaryType, spec.childrenNote, spec.behaviourNotes),
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
  const expr = aliases.get(typeName) ??
    (parsePickExpression(typeName) || parseOmitExpression(typeName) ? typeName : undefined);
  if (!expr) {
    throw new Error(`[docs] ${spec.source}: source does not export '${typeName}'`);
  }
  seen.add(typeName);
  try {
    const body = objectBody(expr);
    if (body != null) return parsePropObject(spec, typeName, body, typeName === spec.type, aliases);

    const parts = splitTopLevel(expr, '&');
    if (parts.length >= 2) {
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
    }

    const pick = parsePickExpression(expr);
    if (pick) {
      const parsed = propsFromType({ ...spec, type: pick.sourceType }, pick.sourceType, aliases, seen);
      const propsByName = new Map(parsed.props.map((prop) => [prop.name, prop]));
      const forbiddenByName = new Map((parsed.forbidden || []).map((prop) => [prop.name, prop]));
      const props = [];
      const forbidden = [];
      for (const key of pick.keys) {
        const prop = propsByName.get(key);
        const blocked = forbiddenByName.get(key);
        if (prop) props.push(prop);
        else if (blocked) forbidden.push(blocked);
        else throw new Error(`[docs] ${spec.source}: Pick<${pick.sourceType}> references unknown prop '${key}'`);
      }
      return { typeName, props, forbidden };
    }
    const omit = parseOmitExpression(expr);
    if (omit) {
      const parsed = propsFromType({ ...spec, type: omit.sourceType }, omit.sourceType, aliases, seen);
      const known = new Set([...parsed.props, ...(parsed.forbidden || [])].map((prop) => prop.name));
      for (const key of omit.keys) {
        if (!known.has(key)) throw new Error(`[docs] ${spec.source}: Omit<${omit.sourceType}> references unknown prop '${key}'`);
      }
      const omitted = new Set(omit.keys);
      return {
        typeName,
        props: parsed.props.filter((prop) => !omitted.has(prop.name)),
        forbidden: (parsed.forbidden || []).filter((prop) => !omitted.has(prop.name)),
      };
    }
    throw new Error(`[docs] ${spec.source}: '${typeName}' is not an object prop type or supported intersection`);
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
    lead: spec.lead,
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
    readFile(resolve(repoRoot, 'packages/rn/runtime/pressable-host.tsx'), 'utf8'),
  ]);
  // Descriptor-backed pages derive the primary `children` note from the api
  // DATA (the browser-ESM descriptor twin — the same read docs.js uses): a
  // `default: true` slot is a real bare-children sink; slots without one accept
  // children for typed composition only.
  let childrenNote;
  let behaviourNotes;
  if (spec.name) {
    const twin = pathToFileURL(resolve(repoRoot, `packages/prototype/generated/descriptors/${spec.name}.js`)).href;
    const descriptor = (await import(twin))[`${camel(spec.name)}Descriptor`];
    const slots = Object.values(descriptor?.api?.slots ?? {});
    if (slots.length) {
      childrenNote = slots.some((slot) => slot.default === true) ? 'default content slot' : 'composition children';
    }
    behaviourNotes = {
      inputProps: descriptor?.api?.behaviour?.input?.props ?? [],
      pressableProps: descriptor?.api?.behaviour?.pressable?.props ?? [],
    };
  }
  return componentApiIrFromSource({ ...spec, childrenNote, behaviourNotes }, source, extraSources);
}
