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
// `__nuriSlotOwner` names the owning component (its displayName): part ids are
// descriptor-LOCAL strings, so an owner check is what keeps another component's
// marker from being interpreted against the wrong anatomy (the harvest fails
// named on a mismatch — the web mirror keys the same policy off its global
// registered-slot-tag registry).
export type NuriSlot<P extends object = { children?: React.ReactNode }, PId extends PartId = PartId> = React.FC<P> & {
  __nuriSlot: PId;
  __nuriSlotContentProp: string;
  __nuriSlotOwner?: string;
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
  owner?: string,
): NuriSlot<P, PId> {
  const Slot: NuriSlot<P, PId> = ((slotProps: P & { children?: React.ReactNode }) => (
    <React.Fragment>{slotProps.children}</React.Fragment>
  )) as NuriSlot<P, PId>;
  Slot.__nuriSlot = part;
  Slot.__nuriSlotContentProp = contentProp;
  Slot.__nuriSlotOwner = owner;
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

// Harvest one composition scope (the component root, or a region's own content
// at render time). The mixed-content contract (decision 83 · identical on web):
// typed slot markers become entries; bare meaningful children route to
// `fallbackPart` (the declared default sink at root scope · the region itself
// inside a region); a bare child with NO fallback is unroutable and fails
// named — never a silently dropped child or an empty skeleton render. A marker
// owned by ANOTHER component (`__nuriSlotOwner` ≠ `owner`) fails named.
export function harvestNuriComposition<PId extends PartId = PartId>(
  children: React.ReactNode,
  fallbackPart: PId | undefined,
  owner?: string,
): { hasSlots: boolean; items: NuriCompositionEntry<PId>[] } {
  const items: NuriCompositionEntry<PId>[] = [];
  let hasSlots = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      const slotType = child.type as Partial<NuriSlot<object, PId>>;
      if (slotType.__nuriSlot) {
        if (owner !== undefined && slotType.__nuriSlotOwner !== owner) {
          const markerName = (child.type as { displayName?: string }).displayName ?? String(slotType.__nuriSlot);
          throw new Error(`nuri-factory: foreign slot marker '${markerName}' — not a '${owner}' slot`);
        }
        hasSlots = true;
        const props = child.props as Record<string, React.ReactNode>;
        const contentProp = slotType.__nuriSlotContentProp || 'children';
        items.push({ part: slotType.__nuriSlot, content: props[contentProp] });
        return;
      }
    }
    if (isRenderableChild(child)) {
      if (fallbackPart) {
        items.push({ part: fallbackPart, content: child });
      } else {
        throw new Error(
          `nuri-factory: '${owner ?? 'this component'}' has no default content slot — bare children must use its typed slot components`,
        );
      }
    }
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
  // STATIC api facts, computed once per instance render: `slotted` = the
  // descriptor declares component slots at all (the render-time nested-harvest
  // gate — an unslotted component never pays a per-host children walk);
  // `owner` = the component displayName the slot markers carry.
  slotted: boolean;
  owner: string;
};

function findChildPath(node: AnatomyNode, part: PartId): AnatomyNode[] | undefined {
  for (const child of node.children) {
    if (child.name === part) return [child];
    const nested = findChildPath(child, part);
    if (nested) return [child, ...nested];
  }
  return undefined;
}

// A part accepts REPEATED composition entries only where the descriptor's api
// declares a slot targeting it `multiple: true` (the sequence contract —
// repeats render as a sequence of instances, never a concatenated leaf).
function isMultiPart<A extends Axes>(descriptor: Descriptor<A>, part: PartId): boolean {
  return Object.values(descriptor.api?.slots ?? {}).some((slot) => slot.part === part && slot.multiple === true);
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

  // ── THE PROSE-CHILDREN RULE (form-kit-spec §1.3 · GENERIC, not alert-specific) ──
  // A host with a PROSE-DONOR part — an `el:'text'` child that NO api slot targets
  // (e.g. Alert's `message`) — routes its BARE STRING children THROUGH that donor
  // part, so each string renders as the donor's normal `text` leaf carrying the
  // donor's authored style (typography · muted palette · the grow/shrink fill),
  // while sibling parts (a leading icon, a trailing action) HUG their content. RN
  // crashes on a bare string inside a <View> ("Text strings must be rendered within
  // a <Text>"); the web mirror routes the same way (factory.js#wrapProseNodes). A
  // host with NO donor leaves bare children RAW — the mixed-content contract
  // (decision 83 · a region's loose text stays a raw child · the composition-
  // envelope 'before'/'after' cell). Element children (an AlertButton) always pass
  // through unchanged. This is a RENDERING concern, not schema — the STYLE is
  // descriptor data on the donor part. (Line count / truncation is whatever the
  // shared `text` leaf does per platform today — NOT a prose-rule or Alert feature.)
  const slotTargetParts = new Set(Object.values(ctx.descriptor.api?.slots ?? {}).map((s) => s.part));
  const donorNode = node.children.find((c) => c.el === 'text' && !slotTargetParts.has(c.name));
  const wrapProse = (content: React.ReactNode): React.ReactNode => {
    if (!donorNode) return content;
    return React.Children.map(content, (child) =>
      typeof child === 'string' || typeof child === 'number'
        ? renderPart(donorNode, { ...ctx, content: { ...ctx.content, [donorNode.name]: child } }, fg, false)
        : child,
    );
  };

  // The shared host body (children + own routed content, fg scope threaded) —
  // identical for the static `view` and the `pressable` host; only the host
  // ELEMENT differs, and that is the switch's decision (el is structure data).
  const renderHostBody = (): React.ReactNode => {
    const kids: React.ReactNode[] = [];
    // ── THE GROUPING WALKER · mirrored across engines — edit in LOCKSTEP with
    // packages/prototype/factory/factory.js#appendComposition (full dedup is a
    // named follow-up). The shared contract is pinned per-cell by the
    // composition-envelope suites (packages/rn/__tests__/composition-envelope
    // .test.tsx · packages/prototype/factory/composition-envelope.test.js).
    // Entry classification against THIS host:
    //   · own    — entry.part === this host: bare content of a region scope,
    //     rendered in place (bare children inside a region stay that region's
    //     own content · the mixed-content contract);
    //   · direct — a direct child part: ONE rendered instance per entry, in
    //     authored order (repeated entries = a SEQUENCE of instances);
    //   · group  — a part nested deeper: routed through its ancestor container
    //     ONCE, the entries re-scoped to that ancestor via ctx.composition (the
    //     ancestor's own walker re-classifies them one level down).
    // Repetition policy: a part may be targeted more than once only where a
    // declared slot marks it `multiple: true`; a singular part targeted twice
    // (including a region marker mixed with loose slots for the same region)
    // fails named — never silent concatenation, never last-wins.
    const appendCompositionEntries = (composition: NuriCompositionEntry<string>[]): void => {
      const grouped = new Map<string, { child: AnatomyNode; entries: NuriCompositionEntry<string>[] }>();
      const targets = new Map<string, number>();
      const ordered: Array<
        | { kind: 'own'; entry: NuriCompositionEntry<string>; index: number }
        | { kind: 'direct'; child: AnatomyNode; entry: NuriCompositionEntry<string>; index: number }
        | { kind: 'group'; part: string }
      > = [];
      composition.forEach((entry, index) => {
        if (entry.part === node.name) {
          ordered.push({ kind: 'own', entry, index });
          return;
        }
        const path = findChildPath(node, entry.part);
        if (!path) throw new Error(`nuri-factory: composition entry targets '${entry.part}', which is not under '${node.name}'`);
        const childNode = path[0];
        if (path.length > 1 && !LEAF_ELS.includes(childNode.el)) {
          let group = grouped.get(childNode.name);
          if (!group) {
            group = { child: childNode, entries: [] };
            grouped.set(childNode.name, group);
            ordered.push({ kind: 'group', part: childNode.name });
            targets.set(childNode.name, (targets.get(childNode.name) ?? 0) + 1);
          }
          group.entries.push(entry);
          return;
        }
        ordered.push({ kind: 'direct', child: childNode, entry, index });
        targets.set(entry.part, (targets.get(entry.part) ?? 0) + 1);
      });
      for (const [part, count] of targets) {
        if (count > 1 && !isMultiPart(ctx.descriptor, part)) {
          throw new Error(`nuri-factory: slot targeting part '${part}' is singular — it appears ${count} times under '${node.name}'`);
        }
      }
      for (const item of ordered) {
        if (item.kind === 'own') {
          kids.push(<React.Fragment key={`own:${item.index}`}>{wrapProse(item.entry.content)}</React.Fragment>);
          continue;
        }
        const group = item.kind === 'group' ? grouped.get(item.part) : undefined;
        const rendered = item.kind === 'group' && group
          ? renderPart(
            group.child,
            { ...ctx, composition: { ...ctx.composition, [item.part]: group.entries } },
            fg,
            false,
          )
          : item.kind === 'direct'
            ? renderPart(
              item.child,
              { ...ctx, content: { ...ctx.content, [item.entry.part]: item.entry.content } },
              fg,
              false,
            )
            : null;
        if (rendered) {
          const key = item.kind === 'group' ? item.part : `${item.entry.part}:${item.index}`;
          kids.push(React.cloneElement(rendered, { key }));
        }
      }
    };

    const composition = ctx.composition[node.name];
    if (composition) {
      appendCompositionEntries(composition);
    } else {
      const ownContent = ctx.content[node.name];
      // The render-time nested harvest is GATED twice: `ownContent != null`
      // (cheap per-host check) AND the STATIC api fact that this descriptor
      // declares component slots at all (ctx.slotted) — so an unslotted
      // component never pays a children walk for a feature only slotted
      // components use. Bare children harvested here keep THIS host as their
      // own content (fallback = node.name · the region mixed-content contract).
      const nestedComposition =
        ownContent != null && ctx.slotted ? harvestNuriComposition<string>(ownContent, node.name, ctx.owner) : null;
      if (nestedComposition && nestedComposition.hasSlots) {
        appendCompositionEntries(nestedComposition.items);
      } else {
        const childEls = node.children.map((child) => renderPart(child, ctx, fg, false));
        if (ownContent != null) kids.push(<React.Fragment key="__content">{wrapProse(ownContent)}</React.Fragment>);
        kids.push(...childEls);
      }
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
  // The static api fact gating the render-time nested harvest — only a
  // descriptor that declares component slots can carry nested composition.
  const slotted = Object.values(descriptor.api?.slots ?? {}).some((slot) => slot.component === true);
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
      slotted,
      owner: displayName,
    } as RenderCtx<A>,
    ambient.foreground,
    true,
  ) as React.ReactElement;
}

export function renderWithNuriScope(accent: Accent | undefined, child: React.ReactElement): React.ReactElement {
  return accent !== undefined ? <NuriScope accent={accent}>{child}</NuriScope> : child;
}
