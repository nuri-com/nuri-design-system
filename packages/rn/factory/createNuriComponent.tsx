/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · normalized RN descriptor renderer
 * ──────────────────────────────────────────────────────────────────
 * The shared RN renderer consumes a normalized descriptor instance:
 * selection, routed content, and declared behaviour have already been computed
 * by the generated component adapter. This file walks anatomy, applies the baked
 * recipe, threads foreground scope, and renders RN hosts.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Accent, Descriptor, Axes, Part, IconName } from '../contract';
import { typeStyle, useNuriTheme, NuriScope } from '../theme';
import type { NuriTheme } from './theme';
import { resolveAnatomy, flattenBakedPart, assertNever } from './resolve';
import type { AnatomyNode, Selection, BakedComponentRecipe } from './resolve';
import { NuriIcon } from './NuriIcon';

// §12 surface context — the resolved foreground a surface provides to propless
// descendants (colour-from-scope · F-BOX-FG-1).
export const NuriSurfaceContext = React.createContext<{ foreground?: string }>({});

// A generated marker component (TopbarLeading/Center/Trailing regions and ordered
// leaves like ButtonText/ButtonIcon). Rendered alone it yields its children;
// generated parent adapters harvest the marker tag and normalize public props.
export type NuriSlot<P extends object = { children?: React.ReactNode }> = React.FC<P> & {
  __nuriSlot: Part;
  __nuriSlotContentProp: string;
};

export type NuriCompositionEntry = { part: Part; content: React.ReactNode };

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

export function createNuriSlot<P extends object = { children?: React.ReactNode }>(
  part: Part,
  displayName: string,
  contentProp = 'children',
): NuriSlot<P> {
  const Slot: NuriSlot<P> = ((slotProps: P & { children?: React.ReactNode }) => (
    <React.Fragment>{slotProps.children}</React.Fragment>
  )) as NuriSlot<P>;
  Slot.__nuriSlot = part;
  Slot.__nuriSlotContentProp = contentProp;
  Slot.displayName = displayName;
  return Slot;
}

function isRenderableChild(child: React.ReactNode): boolean {
  return child != null && child !== false && !(typeof child === 'string' && child.trim() === '');
}

export function harvestNuriSlots(
  children: React.ReactNode,
  fallbackPart: Part | undefined,
): Partial<Record<Part, React.ReactNode[]>> {
  const harvested: Partial<Record<Part, React.ReactNode[]>> = {};
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      const slot = (child.type as Partial<NuriSlot>).__nuriSlot;
      if (slot) {
        (harvested[slot] ??= []).push((child.props as { children?: React.ReactNode }).children);
        return;
      }
    }
    if (isRenderableChild(child) && fallbackPart) (harvested[fallbackPart] ??= []).push(child);
  });
  return harvested;
}

export function harvestNuriComposition(
  children: React.ReactNode,
  fallbackPart: Part | undefined,
): { hasSlots: boolean; items: NuriCompositionEntry[] } {
  const items: NuriCompositionEntry[] = [];
  let hasSlots = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      const slotType = child.type as Partial<NuriSlot>;
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

export type NuriBehaviour = {
  pressable?: {
    target: Part;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };
};

export type NuriDescriptorInstance<A extends Axes> = {
  descriptor: Descriptor<A>;
  recipe: BakedComponentRecipe;
  displayName: string;
  selection: Selection;
  content: Partial<Record<Part, React.ReactNode>>;
  composition?: Partial<Record<Part, NuriCompositionEntry[]>>;
  behaviour: NuriBehaviour;
};

type RenderCtx<A extends Axes> = {
  descriptor: Descriptor<A>;
  recipe: BakedComponentRecipe;
  theme: NuriTheme;
  selection: Selection;
  content: Partial<Record<Part, React.ReactNode>>;
  composition: Partial<Record<Part, NuriCompositionEntry[]>>;
  behaviour: NuriBehaviour;
};

function findChildPart(node: AnatomyNode, part: Part): AnatomyNode | undefined {
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
  // A leaf part (text / icon) with no routed content renders nothing. A `view`
  // always renders because it may be a container or region.
  if (node.el !== 'view' && ctx.content[node.name] == null) return null;

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

  switch (node.el) {
    case 'view': {
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

      const body =
        flat.node.fg !== undefined ? (
          <NuriSurfaceContext.Provider value={{ foreground: flat.node.fg }}>{kids}</NuriSurfaceContext.Provider>
        ) : (
          kids
        );

      if (pressable) {
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
            {body}
          </Pressable>
        );
      }
      return (
        <View key={node.name} style={flat.style} {...a11yHide}>
          {body}
        </View>
      );
    }

    case 'text': {
      return (
        <Text
          key={node.name}
          style={[flat.node.type ? typeStyle(flat.node.type.size, flat.node.type.emphasis) : null, fg ? { color: fg } : null, flat.style]}
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

export function renderDescriptorInstance<A extends Axes>({
  descriptor,
  recipe,
  displayName,
  selection,
  content,
  composition = {},
  behaviour,
}: NuriDescriptorInstance<A>): React.ReactElement {
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
    },
    ambient.foreground,
    true,
  ) as React.ReactElement;
}

export function renderWithNuriScope(accent: Accent | undefined, child: React.ReactElement): React.ReactElement {
  return accent !== undefined ? <NuriScope accent={accent}>{child}</NuriScope> : child;
}
