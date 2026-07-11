/* ══════════════════════════════════════════════════════════════════
 * NURI · RUNTIME · normalized RN descriptor renderer
 * ──────────────────────────────────────────────────────────────────
 * The shared RN renderer consumes a normalized descriptor instance:
 * selection, routed content, and declared behaviour have already been computed
 * by the generated component adapter. This file walks anatomy, applies the baked
 * recipe, threads foreground scope, and renders RN hosts.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { classifyComposition } from '@nuri/spec/composition-classify';
import { LEAF_ELS } from '@nuri/spec/descriptors/schema';
import type { Descriptor, Axes, IconName, PartId } from '../contract';
import { typeStyle, useNuriTheme } from '../theme';
import type { NuriTheme } from './theme-payload';
import { resolveAnatomy, flattenBakedPart, assertNever } from './resolve';
import type { AnatomyNode, Selection, BakedComponentRecipe } from './resolve';
import { NuriIcon } from '../primitives/NuriIcon';
import { useFocusable } from './focus-scroll';
import { PressableHost } from './pressable-host';

// §12 surface context — the resolved foreground a surface provides to propless
// descendants (colour-from-scope · F-BOX-FG-1).
export const NuriSurfaceContext = React.createContext<{ foreground?: string }>({});

// ── FOCUS RING · parity with web (packages/prototype/primitives/input.css ·
// `[data-nuri-focus-target][data-nuri-input-focused] { outline: 2px solid
// var(--nuri-focus-ring); outline-offset: 2px }`). Web draws a 2px ring standing
// 2px OFF the focus target's border box, in the focusRing token colour, WITHOUT
// recolouring the target's own border. RN has no `outline`/`outline-offset`, so we
// overlay an absolutely-positioned bordered view inset OUTSIDE the target's border
// box — same look, and (like `outline`) zero layout impact so the field never
// shifts on focus. The 2px width/offset is the web design constant (not a token);
// mirror it literally for exact parity.
const FOCUS_RING_WIDTH = 2;
const FOCUS_RING_OFFSET = 2;

// react-native-web renders the input to a DOM <input> that carries the browser's
// default :focus outline — a SECOND ring on top of the DS focus ring (the expo-web
// "double ring"). Suppress it on web only; native TextInput has no outline concept.
// `outlineStyle` is a react-native-web style key absent from RN's TextStyle, hence
// the cast (the value is inert on native and never reached there anyway).
const WEB_INPUT_OUTLINE_RESET: TextStyle | null =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

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

export type NuriCompositionEntry<PId extends PartId = PartId> = {
  part: PId;
  content?: React.ReactNode;
  props?: Record<string, unknown>;
};

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

// React fragments are composition-transparent: markers inside them belong to
// the same harvest scope as adjacent children. Recurse so nested/keyed fragments
// reach the existing slot, fallback, and foreign-owner rules unchanged.
function forEachNuriCompositionChild(
  children: React.ReactNode,
  visit: (child: React.ReactNode) => void,
): void {
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      forEachNuriCompositionChild((child.props as { children?: React.ReactNode }).children, visit);
      return;
    }
    visit(child);
  });
}

export function harvestNuriSlots<PId extends PartId = PartId>(
  children: React.ReactNode,
  fallbackPart: PId | undefined,
): Partial<Record<PId, React.ReactNode[]>> {
  const harvested: Partial<Record<PId, React.ReactNode[]>> = {};
  forEachNuriCompositionChild(children, (child) => {
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
  forEachNuriCompositionChild(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      const slotType = child.type as Partial<NuriSlot<object, PId>>;
      if (slotType.__nuriSlot) {
        if (owner !== undefined && slotType.__nuriSlotOwner !== owner) {
          const markerName = (child.type as { displayName?: string }).displayName ?? String(slotType.__nuriSlot);
          throw new Error(`nuri-factory: foreign slot marker '${markerName}' — not a '${owner}' slot`);
        }
        hasSlots = true;
        const props = child.props as Record<string, unknown>;
        const contentProp = slotType.__nuriSlotContentProp || 'children';
        items.push({ part: slotType.__nuriSlot, content: props[contentProp] as React.ReactNode, props });
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
    role?: 'button' | 'tab';
    selected?: boolean;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };
  input?: {
    target: PId;
    focusTarget?: PId;
    labelPart?: PId;
    props: {
      value?: string;
      onChangeText?: (text: string) => void;
      placeholder?: string;
      inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search';
      secureTextEntry?: boolean;
      disabled?: boolean;
      onFocus?: () => void;
      onBlur?: () => void;
      accessibilityLabel?: string;
    };
  };
};

export type NuriDescriptorInstance<A extends Axes, PId extends PartId = PartId> = {
  descriptor: Descriptor<A>;
  recipe: BakedComponentRecipe;
  displayName: string;
  selection: Selection;
  content: Partial<Record<PId, React.ReactNode>>;
  composition?: Partial<Record<PId, NuriCompositionEntry<PId>[]>>;
  components?: Record<string, React.ComponentType<Record<string, unknown>>>;
  behaviour: NuriBehaviour<PId>;
  inputHandle?: React.Ref<{ focus(): void; blur(): void }>;
};

type RenderCtx<A extends Axes> = {
  descriptor: Descriptor<A>;
  recipe: BakedComponentRecipe;
  theme: NuriTheme;
  selection: Selection;
  content: Partial<Record<string, React.ReactNode>>;
  composition: Partial<Record<string, NuriCompositionEntry<string>[]>>;
  slotProps: Partial<Record<string, Record<string, unknown>>>;
  components: Record<string, React.ComponentType<Record<string, unknown>>>;
  behaviour: NuriBehaviour<string>;
  focusedInput: boolean;
  inputRef: React.RefObject<TextInput | null>;
  inputFocusHandlers: {
    onFocus: () => void;
    onBlur: () => void;
  };
  // STATIC api facts, computed once per instance render: `slotted` = the
  // descriptor declares component slots at all (the render-time nested-harvest
  // gate — an unslotted component never pays a per-host children walk);
  // `owner` = the component displayName the slot markers carry.
  slotted: boolean;
  owner: string;
};

type DescriptorTextInputProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search';
  secureTextEntry?: boolean;
  inputDisabled: boolean;
  accessibilityLabel?: string;
  derivedLabel?: string;
  placeholderTextColor: string;
  flowProps: { numberOfLines?: number };
  typeStyleValue: ReturnType<typeof typeStyle> | null;
  foregroundStyle: { color: string } | null;
  disabledStyle: { opacity: number } | null;
  flatStyle: StyleProp<TextStyle>;
  inputRef: React.RefObject<TextInput | null>;
  inputFocusHandlers: {
    onFocus: () => void;
    onBlur: () => void;
  };
};

function DescriptorTextInput({
  value,
  onChangeText,
  placeholder,
  inputMode,
  secureTextEntry,
  inputDisabled,
  accessibilityLabel,
  derivedLabel,
  placeholderTextColor,
  flowProps,
  typeStyleValue,
  foregroundStyle,
  disabledStyle,
  flatStyle,
  inputRef,
  inputFocusHandlers,
}: DescriptorTextInputProps): React.ReactElement {
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      inputMode={inputMode}
      secureTextEntry={secureTextEntry}
      editable={!inputDisabled}
      accessibilityLabel={accessibilityLabel ?? derivedLabel}
      accessibilityState={{ disabled: inputDisabled }}
      placeholderTextColor={placeholderTextColor}
      onFocus={inputFocusHandlers.onFocus}
      onBlur={inputFocusHandlers.onBlur}
      {...flowProps}
      style={[
        typeStyleValue,
        foregroundStyle,
        { flexShrink: 1, padding: 0 },
        disabledStyle,
        flatStyle,
        // Suppress the browser :focus outline on react-native-web so only the
        // DS focus ring shows (no-op on native · see WEB_INPUT_OUTLINE_RESET).
        WEB_INPUT_OUTLINE_RESET,
      ]}
    />
  );
}

function parseSlotBinding(value: string): { prop: string; fallback?: string } {
  const body = value.slice('$slot.'.length);
  const [prop, ...fallbackParts] = body.split('|');
  return { prop, fallback: fallbackParts.length ? fallbackParts.join('|') : undefined };
}

function renderPart<A extends Axes>(
  node: AnatomyNode,
  ctx: RenderCtx<A>,
  inheritedFg: string | undefined,
  isRoot: boolean,
): React.ReactElement | null {
  if (node.component) {
    const Component = ctx.components[node.component];
    if (!Component) throw new Error(`nuri-factory: component part '${node.name}' references unregistered component '${node.component}'`);
    const slotProps = ctx.slotProps[node.name] ?? {};
    const content = ctx.content[node.name];
    const slotBound = Object.values(node.props ?? {}).some((value) => typeof value === 'string' && value.startsWith('$slot.'));
    if (slotBound && content == null && Object.keys(slotProps).length === 0) return null;
    const mapped: Record<string, unknown> = {};
    for (const [prop, value] of Object.entries(node.props ?? {})) {
      if (typeof value === 'string' && value.startsWith('$axis.')) {
        const axis = value.slice('$axis.'.length);
        mapped[prop] = ctx.selection[axis];
      } else if (typeof value === 'string' && value.startsWith('$slot.')) {
        const slotBinding = parseSlotBinding(value);
        mapped[prop] = slotBinding.prop === 'children'
          ? (slotProps.children ?? content)
          : (slotProps[slotBinding.prop] ?? (slotBinding.prop === 'name' ? content : undefined) ?? slotBinding.fallback);
      } else {
        mapped[prop] = value;
      }
    }
    for (const key of Object.keys(mapped)) {
      if (mapped[key] === undefined) delete mapped[key];
    }
    return <Component key={node.name} {...mapped} />;
  }

  // A LEAF part (the schema's totality-pinned host/leaf partition · LEAF_ELS)
  // with no routed content renders nothing. A HOST always renders because it
  // may be a container or region.
  if (node.el && LEAF_ELS.includes(node.el) && ctx.content[node.name] == null) return null;

  const recipePart = ctx.recipe[node.name];
  if (!recipePart) throw new Error(`nuri-factory: no baked recipe for part '${node.name}'`);

  const pressable = ctx.behaviour.pressable?.target === node.name ? ctx.behaviour.pressable : undefined;
  const input = ctx.behaviour.input?.target === node.name ? ctx.behaviour.input : undefined;
  const focusedByInput = ctx.focusedInput && ctx.behaviour.input?.focusTarget === node.name;
  const disabled = pressable?.disabled ?? false;
  const flat = flattenBakedPart(recipePart, ctx.descriptor, ctx.theme, node.name, ctx.selection, {
    pressed: false,
    disabled,
  });
  // The offset focus ring (see FOCUS_RING_* above) overlays the focus target
  // WITHOUT recolouring its own border — matching web, where `outline` is drawn
  // separately from the box border. Rendered in the `view` case below.
  const focusRing = focusedByInput ? (
    <View
      key="__nuri-focus-ring"
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -(FOCUS_RING_OFFSET + FOCUS_RING_WIDTH),
        left: -(FOCUS_RING_OFFSET + FOCUS_RING_WIDTH),
        right: -(FOCUS_RING_OFFSET + FOCUS_RING_WIDTH),
        bottom: -(FOCUS_RING_OFFSET + FOCUS_RING_WIDTH),
        borderWidth: FOCUS_RING_WIDTH,
        borderColor: ctx.theme.focusRing,
        // Concentric with the target's rounded corners: outer radius = the
        // target's radius pushed out by the offset + ring width.
        borderRadius:
          (typeof flat.style.borderRadius === 'number' ? flat.style.borderRadius : 0) +
          FOCUS_RING_OFFSET +
          FOCUS_RING_WIDTH,
      }}
    />
  ) : null;
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
  // through unchanged. This is a RENDERING concern, not schema — the STYLE and
  // text flow are descriptor data on the donor part, rendered by the shared
  // `text` leaf rather than by an Alert-specific branch.
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
    // Classification = @nuri/spec/composition-classify; only the render tail is engine-local.
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
      const { ordered, grouped, ambientContent } = classifyComposition(node, composition, {
        ambientContent: ctx.content,
        isHostEl: (el) => Boolean(el && !LEAF_ELS.includes(el as typeof LEAF_ELS[number])),
        isMultiPart: (part) => Object.values(ctx.descriptor.api?.slots ?? {})
          .some((slot) => slot.part === part && slot.multiple === true),
        inputTarget: ctx.behaviour.input?.target,
        labelPart: ctx.behaviour.input?.labelPart,
        errorPrefix: 'nuri-factory:',
      });
      const ambientCtx = { ...ctx, content: ambientContent };
      for (const item of ordered) {
        if (item.kind === 'own') {
          kids.push(<React.Fragment key={`own:${item.index}`}>{wrapProse(item.entry.content)}</React.Fragment>);
          continue;
        }
        const group = item.kind === 'group' ? grouped.get(item.part) : undefined;
        const rendered = item.kind === 'static'
          ? renderPart(item.child, ambientCtx, fg, false)
          : item.kind === 'group' && group
          ? renderPart(
            group.child,
            { ...ambientCtx, composition: { ...ctx.composition, [item.part]: group.entries } },
            fg,
            false,
          )
          : item.kind === 'direct'
            ? renderPart(
              item.child,
              {
                ...ambientCtx,
                content: { ...ambientCtx.content, [item.entry.part]: item.entry.content },
                slotProps: item.entry.props ? { ...ctx.slotProps, [item.entry.part]: item.entry.props } : ctx.slotProps,
              },
              fg,
              false,
            )
            : null;
        if (rendered) {
          const key = item.kind === 'group'
            ? item.part
            : item.kind === 'static'
              ? item.child.name
              : `${item.entry.part}:${item.index}`;
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

  if (!node.el) throw new Error(`nuri-factory: part '${node.name}' declares neither el nor component`);

  switch (node.el) {
    case 'view': {
      return (
        <View
          key={node.name}
          style={flat.style}
          accessibilityRole={isRoot ? ctx.descriptor.api.role : undefined}
          {...a11yHide}
        >
          {focusRing}
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
        <PressableHost
          key={node.name}
          onPress={pressable.onPress}
          disabled={disabled}
          role={pressable.role}
          selected={pressable.selected}
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
        </PressableHost>
      );
    }

    case 'text': {
      const flowProps =
        flat.node.textFlow?.flow === 'truncate'
          ? { numberOfLines: flat.node.textFlow.lines, ellipsizeMode: 'tail' as const }
          : {};
      return (
        <Text
          key={node.name}
          {...flowProps}
          style={[
            flat.node.type ? typeStyle(flat.node.type.size, flat.node.type.emphasis, flat.node.type.mono) : null,
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

    case 'input': {
      if (!input) {
        throw new Error(`nuri-factory: part '${node.name}' is el:'input' but behaviour.input does not target it`);
      }
      const labelContent = input.labelPart ? ctx.content[input.labelPart] : undefined;
      const derivedLabel = typeof labelContent === 'string' ? labelContent : undefined;
      const inputProps = input.props;
      const inputDisabled = inputProps.disabled ?? false;
      const flowProps =
        flat.node.textFlow?.flow === 'truncate'
          ? { numberOfLines: flat.node.textFlow.lines }
          : {};
      return (
        <DescriptorTextInput
          key={node.name}
          value={inputProps.value}
          onChangeText={inputProps.onChangeText}
          placeholder={inputProps.placeholder}
          inputMode={inputProps.inputMode}
          secureTextEntry={inputProps.secureTextEntry}
          inputDisabled={inputDisabled}
          accessibilityLabel={inputProps.accessibilityLabel ?? derivedLabel}
          derivedLabel={derivedLabel}
          placeholderTextColor={ctx.theme.text.muted}
          flowProps={flowProps}
          typeStyleValue={flat.node.type ? typeStyle(flat.node.type.size, flat.node.type.emphasis, flat.node.type.mono) : null}
          foregroundStyle={fg ? { color: fg } : null}
          disabledStyle={inputDisabled ? { opacity: ctx.theme.interaction.disabledOpacity } : null}
          flatStyle={flat.style as StyleProp<TextStyle>}
          inputRef={ctx.inputRef}
          inputFocusHandlers={ctx.inputFocusHandlers}
        />
      );
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
  components = {},
  behaviour,
  inputHandle,
}: NuriDescriptorInstance<A, PId>): React.ReactElement {
  if (!recipe) throw new Error(`nuri-factory: renderDescriptorInstance('${displayName}') requires a baked recipe`);
  const anatomy = resolveAnatomy(descriptor);
  const theme = useNuriTheme();
  const ambient = React.useContext(NuriSurfaceContext);
  const inputRef = React.useRef<TextInput>(null);
  React.useImperativeHandle(inputHandle, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }), []);
  const inputFocus = useFocusable(inputRef, {
    onFocus: behaviour.input?.props.onFocus,
    onBlur: behaviour.input?.props.onBlur,
  });
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
      slotProps: {},
      components,
      behaviour,
      focusedInput: inputFocus.focused,
      inputRef,
      inputFocusHandlers: inputFocus,
      slotted,
      owner: displayName,
    } as RenderCtx<A>,
    ambient.foreground,
    true,
  ) as React.ReactElement;
}
