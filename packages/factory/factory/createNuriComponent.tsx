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
import type { Accent, Descriptor, Axes, Part } from '../contract';
import { typeStyle, useNuriTheme } from '../theme';
import { buildNuriTheme } from './theme';
import type { NuriTheme } from './theme';
import { resolveAnatomy, flattenPart, assertNever } from './resolve';
import type { AnatomyNode, Selection } from './resolve';

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
  // a11y accessible name for icon-only / interactive controls (F-ARIA-LABEL-1).
  accessibilityLabel?: string;
};

// The descriptor's axes A, spread as typed optional NAMED props.
export type NuriComponentProps<A extends Axes> = { [K in keyof A]?: A[K] } & NuriBaseProps;

type RenderCtx<A extends Axes> = {
  descriptor: Descriptor<A>;
  theme: NuriTheme;
  mode: 'light' | 'dark';
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
): React.ReactElement {
  const flat = flattenPart(ctx.descriptor, ctx.theme, ctx.mode, node.name, ctx.selection, {
    pressed: false,
    disabled: ctx.disabled,
  });
  const fg = flat.node.fg ?? inheritedFg;

  switch (node.el) {
    case 'view': {
      const childEls = node.children.map((child) => renderPart(child, ctx, fg));
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
            style={({ pressed }) =>
              flattenPart(ctx.descriptor, ctx.theme, ctx.mode, node.name, ctx.selection, {
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
        <View key={node.name} style={flat.style}>
          {body}
        </View>
      );
    }

    case 'text': {
      // The descriptor names a type STEP; the factory expands it (54/55). The
      // colour comes from scope (own palette > inherited surface fg · §12).
      return (
        <Text
          key={node.name}
          style={[flat.node.typeKey ? typeStyle(flat.node.typeKey) : null, fg ? { color: fg } : null, flat.style]}
        >
          {ctx.content[node.name]}
        </Text>
      );
    }

    case 'icon': {
      // A glyph leaf — the factory is glyph-AGNOSTIC: it renders the provided
      // icon element and injects the scope foreground as `color` (the Icon
      // `color`/currentColor channel). What renders the glyph is the consumer's.
      const el = ctx.content[node.name];
      if (React.isValidElement(el)) {
        return React.cloneElement(el as React.ReactElement<{ color?: string }>, { key: node.name, color: fg });
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

  // Per-axis fallback = the descriptor's FIRST value for that axis. The frozen
  // descriptor carries NO default (the web binding-level default — Button=soft
  // — is not in the contract · surfaced as a finding), so the factory falls
  // back generically rather than inventing per-component knowledge.
  const defaultByAxis: Record<string, string> = {};
  if (descriptor.variants) {
    const variants = descriptor.variants as Record<string, Record<string, unknown>>;
    for (const axis of axisNames) defaultByAxis[axis] = Object.keys(variants[axis])[0];
  }

  // The lone non-root part receives `children`. Ambiguous (≠1 child) → the
  // consumer must use `content` (none of the three frozen descriptors are).
  const primaryPart: Part | undefined =
    anatomy.children.length === 1 ? anatomy.children[0].name : undefined;

  const Component: React.FC<NuriComponentProps<A>> = (props) => {
    const base = props as NuriBaseProps;
    const axisBag = props as Record<string, unknown>;
    const { mode, accent: ambientAccent } = useNuriTheme();
    const accent: Accent = base.accent ?? ambientAccent; // Tier-2 self-scope
    const theme = React.useMemo(() => buildNuriTheme(accent, mode), [accent, mode]);
    const ambient = React.useContext(NuriSurfaceContext);

    // named axis props → the engine selection (first-value fallback when unset).
    const selection: Selection = {};
    for (const axis of axisNames) {
      const provided = axisBag[axis];
      selection[axis] = typeof provided === 'string' ? provided : defaultByAxis[axis];
    }

    // `children` → the primary content part (unless `content` set it).
    const content: Partial<Record<Part, React.ReactNode>> = { ...base.content };
    if (base.children !== undefined && primaryPart && content[primaryPart] === undefined) {
      content[primaryPart] = base.children;
    }

    return renderPart(
      anatomy,
      {
        descriptor,
        theme,
        mode,
        selection,
        disabled: base.disabled ?? false,
        onPress: base.onPress,
        content,
        accessibilityLabel: base.accessibilityLabel,
      },
      ambient.foreground,
    );
  };

  Component.displayName = displayName;
  return Component;
}
