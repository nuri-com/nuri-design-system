/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · createNuriComponent (the generic RN factory)
 * ──────────────────────────────────────────────────────────────────
 * ONE factory, schema-driven (decision 65 · 65.5 "X-wired" — the RN proof
 * lives HERE). Given a frozen descriptor it returns an RN component that
 * walks the anatomy and renders each part as its `el`, applying the resolved
 * namespace styles (resolve.ts). NO per-component code — the same function
 * builds Button, IconAvatar and Topbar (genericity).
 *
 * THE 1:1 CONSUMER API (R1.5 · "what Nuri IS #4"). The descriptor's typed
 * axes A become NAMED props, so the RN call site mirrors the web element:
 *     <Button variant="solid" size="md" accent="lilac" onPress={…}>Buy</Button>
 *         ≅  <nuri-button variant="solid" size="md" accent="lilac">Buy</nuri-button>
 * `children` routes to the descriptor's PRIMARY content part (the lone
 * non-root part · Button→label · IconAvatar→icon · Topbar→the content pivot);
 * `content={{}}` is the escape hatch for multi-part content. ALL of this is
 * DERIVED from `descriptor.variants` + the anatomy — zero per-component code.
 *
 * The data/behaviour split (decision 65):
 *   · DATA (descriptor)   → structure + the five-namespace composition.
 *   · BEHAVIOUR (factory) → Pressable + the `pressed` render-prop (F-PRESSED-1),
 *     disabled a11y state (F-DISABLED-1), the colour-by-scope pass-through
 *     (F-BOX-FG-1 · RN has no `currentColor`), accessibilityRole/Label. The
 *     `interactive` opt-in (65.4) says WHICH effects; this file does HOW.
 *
 * Foreground (§12): a `palette` node PROVIDES its resolved fg; descendant
 * text/icon parts INHERIT it (threaded down the render). Also published via
 * NuriSurfaceContext so a propless runtime child (a Topbar title) inherits it.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Accent, Descriptor, Axes, Part, IconName } from '../contract';
import { typeStyle, useNuriTheme, NuriScope } from '../theme';
import type { NuriTheme } from './theme';
import { resolveAnatomy, flattenPart, assertNever } from './resolve';
import type { AnatomyNode, Selection } from './resolve';
import { NuriIcon } from './NuriIcon';

// §12 surface context — the resolved foreground a surface provides to propless
// descendants (colour-from-scope · F-BOX-FG-1). A direct provided value, NOT a
// named-theme switch (resolver-model §12).
export const NuriSurfaceContext = React.createContext<{ foreground?: string }>({});

// The non-axis props every factory component shares.
export type NuriBaseProps = {
  // Tier-2 self-scope — wins over ambient accent (decision 27/62 · F-SCOPE-2).
  accent?: Accent;
  disabled?: boolean;
  onPress?: () => void;
  // routed to the PRIMARY content part (string label · icon element · pivot).
  children?: React.ReactNode;
  // escape hatch — explicit per-part content (multi-part / open host slot).
  content?: Partial<Record<Part, React.ReactNode>>;
  // ERGONOMIC per-part props for an anatomy with NO lone primary part (the
  // icon-anchored icon-button · P11): each routes to the same-named part. On RN
  // `icon` is a TYPED register key (`IconName` · the build-error gate) — the DS
  // resolves the name → the register glyph and renders it (the factory OWNS RN
  // glyph rendering now · NuriIcon), threading the scope fg + the per-part box
  // dimension in. The `prefix`/`suffix` flanks are strings. An absent flank stays
  // undefined → its leaf renders nothing (the bare-collapse · no empty text
  // inflating the gap). (Web stays loose — `<nuri-icon name>` is a runtime string.)
  prefix?: string;
  suffix?: string;
  icon?: IconName;
  // routed to a `label` text part (the tab-item's destination name · the same
  // ergonomic per-part routing as prefix/suffix · a string leaf).
  label?: string;
  // a11y accessible name for icon-only / interactive controls (F-ARIA-LABEL-1).
  accessibilityLabel?: string;
};

// The descriptor's axes A, spread as typed optional NAMED props, plus the shared
// non-axis base. `selected` is GATED on the descriptor actually having a `state`
// axis (today TabBarItem alone · `tab.ts`): the appearance flag for a 2-state
// `state` axis (the tab-item's selected vs unselected · the muted treatment). A
// CLEAN consumer boolean — the factory bridges it onto the `state` axis
// (true→'selected' · false→'unselected'), so the call site never touches a
// stringly axis value. The DS stays dumb: `selected` is JUST appearance; the
// consumer owns `active === value` + what a tap does. A descriptor with no `state`
// axis (Button · IconAvatar · IconButton) does NOT accept `selected` — passing it
// is a type error, not a silent no-op (type-surface honesty · SEED-3).
export type NuriComponentProps<A extends Axes> = { [K in keyof A]?: A[K] } &
  NuriBaseProps &
  ('state' extends keyof A ? { selected?: boolean } : {});

// ── the COMPOUND-COMPONENT capability (the topbar-slots slice) ──
// A region slot sub-component (TopbarLeading/Center/Trailing · FLAT-named, no
// dot-notation). A MARKER: the container harvests its children into the region's
// content map by the `__nuriSlot` tag (the typed `content` escape-hatch made
// ergonomic · "no JSX-in-props for the regions" · composition via sub-components).
// Rendered standalone it just yields its children. DESCRIPTOR-DRIVEN — the factory
// generates one per fillable `view` region.
export type NuriSlot = React.FC<{ children?: React.ReactNode }> & { __nuriSlot: Part };

// part name → its PascalCase token (leading → Leading). Single-token only — the
// region names are single words; the multi-word kebab→Pascal lives in nuriNames.
const pascalPart = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ── THE DETERMINISTIC NAMING RULE (deterministic-naming · the SINGLE source) ──
// ONE public name (kebab-case) per component → web `nuri-{kebab}` · RN `Pascal({kebab})`.
// Mechanically DERIVED here, so a binding never hand-authors a platform name string
// and the web↔RN pair is always a pure kebab↔Pascal conversion (no lookup table).
// pascalCase handles the multi-word kebab (`tab-bar-item` → `TabBarItem`); nuriNames
// is the helper the bindings call (`createNuriComponent(d, nuriNames('button').rn)`).
// The web factory carries the SAME rule (factory.js nuriNames · the mirror).
export const pascalCase = (kebab: string): string => kebab.split('-').map(pascalPart).join('');
export const nuriNames = (kebab: string): { web: string; rn: string } => ({
  web: `nuri-${kebab}`,
  rn: pascalCase(kebab),
});

// Surface the factory-attached compound slots (FLAT-named · one per `view` region).
// Generic — reads the runtime attachment with NO per-component slot-name map, so a
// binding can re-export each region as a STANDALONE component (`TopbarLeading`) with
// no dot-accessor and no hand-authored `{ Leading; Center; Trailing }` cast.
export function compoundSlots(component: unknown): Record<string, NuriSlot> {
  return component as Record<string, NuriSlot>;
}

type RenderCtx<A extends Axes> = {
  descriptor: Descriptor<A>;
  theme: NuriTheme;
  selection: Selection;
  disabled: boolean;
  onPress?: () => void;
  content: Partial<Record<Part, React.ReactNode>>;
  accessibilityLabel?: string;
};

function renderPart<A extends Axes>(
  node: AnatomyNode,
  ctx: RenderCtx<A>,
  inheritedFg: string | undefined,
  isRoot: boolean,
): React.ReactElement | null {
  // A leaf part (text / icon) with no routed content renders NOTHING — the
  // optional-flank collapse (an icon-button with no prefix/suffix is just the
  // icon · no empty text node taking a stack-gap slot). A `view` always renders
  // (it may be an open host / pivot with no own content · Topbar).
  if (node.el !== 'view' && ctx.content[node.name] == null) return null;

  const flat = flattenPart(ctx.descriptor, ctx.theme, node.name, ctx.selection, {
    pressed: false,
    disabled: ctx.disabled,
  });
  const fg = flat.node.fg ?? inheritedFg;

  // F-DECORATIVE-1 · a decorative descriptor (IconAvatar · `decorative: true`)
  // hides the WHOLE host subtree from the a11y tree. RN has no single `aria-hidden`
  // (web's idiom · factory.js:536) — the platform-split needs BOTH props together:
  // `accessibilityElementsHidden` (iOS) + `importantForAccessibility` (Android).
  // Applied ONCE on the ROOT host only (not per recursed part — the subtree hides as
  // one), on BOTH the View and Pressable arms (correct regardless of interactivity).
  const a11yHide =
    isRoot && ctx.descriptor.decorative
      ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const }
      : null;

  switch (node.el) {
    case 'view': {
      const childEls = node.children.map((child) => renderPart(child, ctx, fg, false));
      // Keyed children: part elements are keyed by name; the part's own content
      // (its escape-hatch / pivot children) gets a stable key too.
      const ownContent = ctx.content[node.name];
      const kids: React.ReactNode[] = [];
      if (ownContent != null) kids.push(<React.Fragment key="__content">{ownContent}</React.Fragment>);
      kids.push(...childEls);

      // §12 — publish the surface fg to propless runtime descendants.
      const body =
        flat.node.fg !== undefined ? (
          <NuriSurfaceContext.Provider value={{ foreground: flat.node.fg }}>{kids}</NuriSurfaceContext.Provider>
        ) : (
          kids
        );

      // Interactive node → Pressable; behaviour is the factory's (65). The
      // `pressed` render-prop re-flattens the state cell (F-PRESSED-1).
      if (flat.node.interactive) {
        return (
          <Pressable
            key={node.name}
            onPress={ctx.onPress}
            disabled={ctx.disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: ctx.disabled }}
            accessibilityLabel={ctx.accessibilityLabel}
            {...a11yHide}
            style={({ pressed }) =>
              flattenPart(ctx.descriptor, ctx.theme, node.name, ctx.selection, {
                pressed,
                disabled: ctx.disabled,
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
      // The descriptor names two orthogonal type inputs (size + emphasis · 54/55
      // · de-fused 77); the factory expands them via typeStyle(size, emphasis).
      // The colour comes from scope (own palette > inherited surface fg · §12).
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
      // A glyph leaf — the DS OWNS the rendering (the icon contract): the routed
      // content is a TYPED `IconName`, and the factory resolves it → the register
      // glyph → NuriIcon (no longer a consumer-passed element). `color` = the scope
      // foreground (the currentColor channel · §12). `dimension` = the icon part's
      // resolved box width (N+51 · the icon-arc size close · the SHARED box axis,
      // not a bespoke icon size): the descriptor's icon `box.width` → size leaf → px,
      // applied on BOTH targets (web sets data-width/height; here NuriIcon reads
      // `dimension`). Absent a box, dimension is undefined → NuriIcon's own default.
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

// createNuriComponent · descriptor → a generic, ERGONOMICALLY-TYPED RN
// component. The SAME function for all three frozen descriptors (no
// per-component branching); the typed named-prop surface is derived from A.
export function createNuriComponent<A extends Axes>(
  descriptor: Descriptor<A>,
  displayName = 'NuriComponent',
): React.FC<NuriComponentProps<A>> {
  const anatomy = resolveAnatomy(descriptor);
  const axisNames: string[] = descriptor.variants ? Object.keys(descriptor.variants) : [];

  // Per-axis default = the descriptor's `defaults[axis]` (R1.5 · N+50 · now IN
  // the contract — Button=soft), else the axis's FIRST value (the generic
  // fallback). Reading it from DATA corrects the latent web↔RN parity bug
  // (RN Button defaulted to the order-first `solid`/`sm`) without per-component
  // knowledge here — the SAME default the web buildComponent fallback reads.
  const defaultByAxis: Record<string, string> = {};
  if (descriptor.variants) {
    const variants = descriptor.variants as Record<string, Record<string, unknown>>;
    for (const axis of axisNames) defaultByAxis[axis] = descriptor.defaults?.[axis] ?? Object.keys(variants[axis])[0];
  }

  // The lone non-root part receives `children`. Ambiguous (≠1 child) → the
  // consumer must use `content` (none of the leaf descriptors are).
  const primaryPart: Part | undefined =
    anatomy.children.length === 1 ? anatomy.children[0].name : undefined;

  // COMPOUND capability (descriptor-driven · NOT topbar-hardcoded): a non-root
  // `view` part is a fillable REGION (a slot). A multi-region anatomy makes this a
  // COMPOUND component — the factory attaches one typed sub-component per region
  // (below) and routes bare children to the DEFAULT slot (the last region · the
  // trailing-most · the "just actions" case). A leaf-only anatomy (Button →
  // label · IconAvatar → icon · IconButton → prefix/icon/suffix) has no region
  // → not compound (the prior single-primary / ergonomic-prop routing stands).
  const slotParts: Part[] = anatomy.children.filter((c) => c.el === 'view').map((c) => c.name);
  const isCompound = slotParts.length > 0;
  const defaultSlot: Part | undefined = slotParts[slotParts.length - 1];

  // Inner · the actual render. Reads the RESOLVED payload straight from context
  // (Option B · SEED-4) — NO per-component `buildNuriTheme` rebuild. The Tier-2
  // prop-accent is handled OUTSIDE, as a nested scope (Component, below), so the
  // payload here is already the correctly-scoped theme.
  const Inner: React.FC<NuriComponentProps<A>> = (props) => {
    const base = props as NuriBaseProps;
    const axisBag = props as Record<string, unknown>;
    const theme = useNuriTheme(); // the scoped ThemePayload (root · scope · prop-accent)
    const ambient = React.useContext(NuriSurfaceContext);

    // named axis props → the engine selection (first-value fallback when unset).
    const selection: Selection = {};
    for (const axis of axisNames) {
      const provided = axisBag[axis];
      selection[axis] = typeof provided === 'string' ? provided : defaultByAxis[axis];
    }
    // THE `selected` BOOLEAN BRIDGE (the tab-item's appearance · descriptor-driven):
    // a clean consumer boolean drives the 2-value `state` appearance axis, so the
    // DS exposes `selected={active === value}` (NOT a stringly axis prop). General
    // by construction — any descriptor with a `state` axis gets it; absent the axis
    // it is a no-op (the leaf descriptors are unaffected).
    const selected = (props as { selected?: boolean }).selected;
    if (typeof selected === 'boolean' && axisNames.includes('state')) {
      selection.state = selected ? 'selected' : 'unselected';
    }

    const content: Partial<Record<Part, React.ReactNode>> = { ...base.content };
    if (isCompound) {
      // COMPOUND routing (the topbar-slots slice): harvest `children` by region.
      // A child whose type is one of THIS component's slot markers (`__nuriSlot`)
      // routes its OWN children into that region; any BARE child (no slot wrapper)
      // collects into the default slot (trailing). `content[part]` (the explicit
      // escape-hatch) wins if already set. Composition via sub-components / bare
      // children — never JSX-in-props for the regions.
      const harvested: Partial<Record<Part, React.ReactNode[]>> = {};
      React.Children.forEach(base.children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          const slot = (child.type as Partial<NuriSlot>).__nuriSlot;
          if (slot) {
            (harvested[slot] ??= []).push((child.props as { children?: React.ReactNode }).children);
            return;
          }
        }
        if (child != null && child !== false && defaultSlot) (harvested[defaultSlot] ??= []).push(child);
      });
      for (const part of Object.keys(harvested) as Part[]) {
        if (content[part] === undefined) content[part] = harvested[part];
      }
    } else {
      // `children` → the primary content part (unless `content` set it).
      if (base.children !== undefined && primaryPart && content[primaryPart] === undefined) {
        content[primaryPart] = base.children;
      }
      // OPEN-POSITIONAL-CHILDREN (the one capability this slice adds · descriptor-
      // driven, NOT tab-bar-hardcoded): an `open` root with NO named regions and no
      // lone primary part (the TabBar · §7 open-primitive layer) renders its
      // POSITIONAL children directly inside itself — route them to the root's own
      // content (renderPart appends `content[root]` as the view's own children).
      // Reusable by any open container (List / Tabs).
      else if (base.children !== undefined && anatomy.open && content.root === undefined) {
        content.root = base.children;
      }
      // Ergonomic per-part props (prefix/suffix/icon) → the content map BY PART
      // NAME. Drives the multi-part anatomy where `primaryPart` is undefined (the
      // icon-button · the `content` escape-hatch made ergonomic); a single-primary
      // component is unaffected (its lone part took `children` above). An unset
      // prop leaves the part absent → the leaf renders nothing (the bare-collapse).
      for (const child of anatomy.children) {
        const provided = (props as Record<string, unknown>)[child.name];
        if (provided !== undefined && content[child.name] === undefined) {
          content[child.name] = provided as React.ReactNode;
        }
      }
    }

    return renderPart(
      anatomy,
      {
        descriptor,
        theme,
        selection,
        disabled: base.disabled ?? false,
        onPress: base.onPress,
        content,
        accessibilityLabel: base.accessibilityLabel,
      },
      ambient.foreground,
      true,
    );
  };
  Inner.displayName = displayName;

  // Component · the public shell. PROP-ACCENT = A NESTED SCOPE (SEED-4): a
  // `<Button accent="orange">` is exactly `<NuriScope accent="orange"><Button/>
  // </NuriScope>` — the outer establishes the scoped payload, the Inner reads it
  // (+ publishes the scoped surface fg by §12). ONE override mechanism for root ·
  // scope · prop — no bespoke `if (props.accent) buildNuriTheme(...)` mini-path
  // ("SEED-4 in miniature"). No accent prop → no wrapper (the Inner reads ambient).
  const Component: React.FC<NuriComponentProps<A>> = (props) => {
    const { accent } = props as NuriBaseProps;
    return accent !== undefined ? (
      <NuriScope accent={accent}>
        <Inner {...props} />
      </NuriScope>
    ) : (
      <Inner {...props} />
    );
  };

  Component.displayName = displayName;

  // COMPOUND: attach one typed slot sub-component per region (TopbarLeading /
  // TopbarCenter / TopbarTrailing). Generic — derived from the anatomy's `view`
  // regions, no per-component code. Each is a `__nuriSlot`-tagged marker the
  // Component harvests. The slot's name is FLAT (the deterministic rule · no
  // dot-notation): `${displayName}${Region}` — `TopbarLeading`, which converts 1:1
  // to the web `nuri-topbar-leading`. The parent displayName is already
  // Pascal(publicKebab); the region is a single token. The binding re-exports each
  // attached slot as a standalone component via `compoundSlots`.
  if (isCompound) {
    const compound = Component as React.FC<NuriComponentProps<A>> & Record<string, NuriSlot>;
    for (const part of slotParts) {
      const Slot: NuriSlot = ((slotProps: { children?: React.ReactNode }) => (
        <React.Fragment>{slotProps.children}</React.Fragment>
      )) as NuriSlot;
      Slot.__nuriSlot = part;
      const slotName = `${displayName}${pascalPart(part)}`;
      Slot.displayName = slotName;
      compound[slotName] = Slot;
    }
  }

  return Component;
}
