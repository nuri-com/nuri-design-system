/* ══════════════════════════════════════════════════════════════════
 * NURI · RUNTIME · normalized RN descriptor renderer
 * ──────────────────────────────────────────────────────────────────
 * The shared RN renderer consumes a normalized descriptor instance:
 * selection, routed content, and declared behaviour have already been computed
 * by the generated component adapter. This file walks anatomy, applies the baked
 * recipe, threads foreground scope, and renders RN hosts.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LEAF_ELS } from '@nuri/spec/descriptors/schema';
import type { Accent, Descriptor, Axes, IconName, PartId } from '../contract';
import { typeStyle, useNuriTheme, NuriScope } from '../theme';
import type { NuriTheme } from './theme-payload';
import { resolveAnatomy, flattenBakedPart, assertNever } from './resolve';
import type { AnatomyNode, Selection, BakedComponentRecipe } from './resolve';
import { NuriIcon } from '../primitives/NuriIcon';

// §12 surface context — the resolved foreground a surface provides to propless
// descendants (colour-from-scope · F-BOX-FG-1).
export const NuriSurfaceContext = React.createContext<{ foreground?: string }>({});

// A generated marker component (TopbarLeading/Center/Trailing regions and ordered
// leaves like ButtonText/ButtonIcon). Rendered alone it yields its children;
// generated parent adapters harvest the marker tag and normalize public props.
export type NuriSlot<P extends object = { children?: React.ReactNode }, PId extends PartId = PartId> = React.FC<P> & {
  __nuriSlot: PId;
  __nuriSlotContentProp: string;
};

export type NuriCompositionEntry<PId extends PartId = PartId> = { part: PId; content: React.ReactNode };

// part name → its PascalCase token (leading → Leading).
const pascalPart = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ── THE DETERMINISTIC NAMING RULE ──
// ONE public name (kebab-case) per component → web `nuri-{kebab}` · RN
// `Pascal({kebab})`.
export const pascalCase = (kebab: string): string => kebab.split('-').map(pascalPart).join('');
export const nuriNames = (kebab: string): { web: string; rn: string } => ({
  web: `nuri-${kebab}`,
  rn: pascalCase(kebab),
});

export function createNuriSlot<P extends object = { children?: React.ReactNode }, PId extends PartId = PartId>(
  part: PId,
  displayName: string,
  contentProp = 'children',
): NuriSlot<P, PId> {
  const Slot: NuriSlot<P, PId> = ((slotProps: P & { children?: React.ReactNode }) => (
    <React.Fragment>{slotProps.children}</React.Fragment>
  )) as NuriSlot<P, PId>;
  Slot.__nuriSlot = part;
  Slot.__nuriSlotContentProp = contentProp;
  Slot.displayName = displayName;
  return Slot;
}

function isRenderableChild(child: React.ReactNode): boolean {
  return child != null && child !== false && !(typeof child === 'string' && child.trim() === '');
}

export function harvestNuriSlots<PId extends PartId = PartId>(
  children: React.ReactNode,
  fallbackPart: PId | undefined,
): Partial<Record<PId, React.ReactNode[]>> {
  const harvested: Partial<Record<PId, React.ReactNode[]>> = {};
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      const slot = (child.type as Partial<NuriSlot<object, PId>>).__nuriSlot;
      if (slot) {
        (harvested[slot] ??= []).push((child.props as { children?: React.ReactNode }).children);
        return;
      }
    }
    if (isRenderableChild(child) && fallbackPart) (harvested[fallbackPart] ??= []).push(child);
  });
  return harvested;
}

export function harvestNuriComposition<PId extends PartId = PartId>(
  children: React.ReactNode,
  fallbackPart: PId | undefined,
): { hasSlots: boolean; items: NuriCompositionEntry<PId>[] } {
  const items: NuriCompositionEntry<PId>[] = [];
  let hasSlots = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      const slotType = child.type as Partial<NuriSlot<object, PId>>;
      if (slotType.__nuriSlot) {
        hasSlots = true;
        const props = child.props as Record<string, React.ReactNode>;
        const contentProp = slotType.__nuriSlotContentProp || 'children';
        items.push({ part: slotType.__nuriSlot, content: props[contentProp] });
        return;
      }
    }
    if (isRenderableChild(child) && fallbackPart) items.push({ part: fallbackPart, content: child });
  });
  return { hasSlots, items };
}

export type NuriBehaviour<PId extends PartId = PartId> = {
  pressable?: {
    target: PId;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };
};

export type NuriDescriptorInstance<A extends Axes, PId extends PartId = PartId> = {
  descriptor: Descriptor<A>;
  recipe: BakedComponentRecipe;
  displayName: string;
  selection: Selection;
  content: Partial<Record<PId, React.ReactNode>>;
  composition?: Partial<Record<PId, NuriCompositionEntry<PId>[]>>;
  behaviour: NuriBehaviour<PId>;
};

type RenderCtx<A extends Axes> = {
  descriptor: Descriptor<A>;
  recipe: BakedComponentRecipe;
  theme: NuriTheme;
  selection: Selection;
  content: Partial<Record<string, React.ReactNode>>;
  composition: Partial<Record<string, NuriCompositionEntry<string>[]>>;
  behaviour: NuriBehaviour<string>;
};

function findChildPart(node: AnatomyNode, part: PartId): AnatomyNode | undefined {
  for (const child of node.children) {
    if (child.name === part) return child;
    const nested = findChildPart(child, part);
    if (nested) return nested;
  }
  return undefined;
}

function renderPart<A extends Axes>(
  node: AnatomyNode,
  ctx: RenderCtx<A>,
  inheritedFg: string | undefined,
  isRoot: boolean,
): React.ReactElement | null {
  // A LEAF part (the schema's totality-pinned host/leaf partition · LEAF_ELS)
  // with no routed content renders nothing. A HOST always renders because it
  // may be a container or region.
  if (LEAF_ELS.includes(node.el) && ctx.content[node.name] == null) return null;

  const recipePart = ctx.recipe[node.name];
  if (!recipePart) throw new Error(`nuri-factory: no baked recipe for part '${node.name}'`);

  const pressable = ctx.behaviour.pressable?.target === node.name ? ctx.behaviour.pressable : undefined;
  const disabled = pressable?.disabled ?? false;
  const flat = flattenBakedPart(recipePart, ctx.descriptor, ctx.theme, node.name, ctx.selection, {
    pressed: false,
    disabled,
  });
  const fg = flat.node.fg ?? inheritedFg;

  // F-DECORATIVE-1 · a decorative descriptor hides the whole host subtree from
  // the a11y tree. Applied once on the root host.
  const a11yHide =
    isRoot && ctx.descriptor.decorative
      ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const }
      : null;

  // The shared host body (children + own routed content, fg scope threaded) —
  // identical for the static `view` and the `pressable` host; only the host
  // ELEMENT differs, and that is the switch's decision (el is structure data).
  const renderHostBody = (): React.ReactNode => {
    const kids: React.ReactNode[] = [];
    const composition = ctx.composition[node.name];
    if (composition) {
      composition.forEach((entry, index) => {
        const childNode = findChildPart(node, entry.part);
        if (!childNode) throw new Error(`nuri-factory: composition entry targets '${entry.part}', which is not under '${node.name}'`);
        const rendered = renderPart(
          childNode,
          { ...ctx, content: { ...ctx.content, [entry.part]: entry.content } },
          fg,
          false,
        );
        if (rendered) kids.push(React.cloneElement(rendered, { key: `${entry.part}:${index}` }));
      });
    } else {
      const childEls = node.children.map((child) => renderPart(child, ctx, fg, false));
      const ownContent = ctx.content[node.name];
      if (ownContent != null) kids.push(<React.Fragment key="__content">{ownContent}</React.Fragment>);
      kids.push(...childEls);
    }

    return flat.node.fg !== undefined ? (
      <NuriSurfaceContext.Provider value={{ foreground: flat.node.fg }}>{kids}</NuriSurfaceContext.Provider>
    ) : (
      kids
    );
  };

  switch (node.el) {
    case 'view': {
      return (
        <View key={node.name} style={flat.style} {...a11yHide}>
          {renderHostBody()}
        </View>
      );
    }

    case 'pressable': {
      // The host is structural (el:'pressable' · amendment 65.13); the behaviour
      // channel supplies only the runtime handlers. The coherence guard pins the
      // SPEC data (target ≡ el:'pressable'), but `renderDescriptorInstance` is a
      // PUBLIC surface and `ctx.behaviour` is caller input — a pressable part the
      // behaviour does not target would render an a11y-announced dead button
      // (accessibilityRole="button", no handler). That is a caller error, the
      // same class as the missing-baked-recipe throw above; fail named.
      if (!pressable) {
        throw new Error(`nuri-factory: part '${node.name}' is el:'pressable' but behaviour.pressable does not target it`);
      }
      return (
        <Pressable
          key={node.name}
          onPress={pressable.onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          accessibilityLabel={pressable.accessibilityLabel}
          {...a11yHide}
          style={({ pressed }) =>
            flattenBakedPart(recipePart, ctx.descriptor, ctx.theme, node.name, ctx.selection, {
              pressed,
              disabled,
            }).style
          }
        >
          {renderHostBody()}
        </Pressable>
      );
    }

    case 'text': {
      return (
        <Text
          key={node.name}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            flat.node.type ? typeStyle(flat.node.type.size, flat.node.type.emphasis) : null,
            fg ? { color: fg } : null,
            { flexShrink: 1, textAlign: 'center' },
            flat.style,
          ]}
        >
          {ctx.content[node.name]}
        </Text>
      );
    }

    case 'icon': {
      const name = ctx.content[node.name];
      if (typeof name === 'string') {
        const flatStyle = flat.style as { width?: unknown; height?: unknown };
        const dim = flatStyle.width ?? flatStyle.height;
        const dimension = typeof dim === 'number' ? dim : undefined;
        return (
          <NuriIcon
            key={node.name}
            name={name as IconName}
            color={fg}
            {...(dimension !== undefined ? { dimension } : null)}
          />
        );
      }
      return <React.Fragment key={node.name} />;
    }

    default:
      return assertNever(node.el, 'el');
  }
}

export function renderDescriptorInstance<A extends Axes, PId extends PartId = PartId>({
  descriptor,
  recipe,
  displayName,
  selection,
  content,
  composition = {},
  behaviour,
}: NuriDescriptorInstance<A, PId>): React.ReactElement {
  if (!recipe) throw new Error(`nuri-factory: renderDescriptorInstance('${displayName}') requires a baked recipe`);
  const anatomy = resolveAnatomy(descriptor);
  const theme = useNuriTheme();
  const ambient = React.useContext(NuriSurfaceContext);
  return renderPart(
    anatomy,
    {
      descriptor,
      recipe,
      theme,
      selection,
      content,
      composition,
      behaviour,
    } as RenderCtx<A>,
    ambient.foreground,
    true,
  ) as React.ReactElement;
}

export function renderWithNuriScope(accent: Accent | undefined, child: React.ReactElement): React.ReactElement {
  return accent !== undefined ? <NuriScope accent={accent}>{child}</NuriScope> : child;
}
