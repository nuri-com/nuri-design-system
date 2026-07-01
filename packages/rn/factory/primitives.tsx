/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · THE HAND-AUTHORABLE PRIMITIVE LAYER (RN)
 * ──────────────────────────────────────────────────────────────────
 * The OPEN primitives a consumer composes screens with — the RN twins of
 * the web `<nuri-stack>` / `<nuri-view>` / `<nuri-typography>` /
 * `<nuri-pressable>` / `<nuri-screen>` / `<nuri-scroll>` custom elements
 * (docs/primitives-contract.md §1.A · the §2 web↔RN parity gap · step ①).
 *
 * They are NOT descriptors — they do NOT route through createNuriComponent
 * (which resolves CLOSED frozen descriptors). A primitive is the OPEN raw-axis
 * passthrough: typed flat props = the schema namespaces (schema.ts), forwarded
 * through the EXISTING resolve.ts appliers → an RN host. The merged View carries
 * box ⊕ stack ⊕ palette; Stack the stack slice; Text typography (+ palette
 * colour); Pressable adds the interactive opt-in; Screen/Scroll are structural.
 *
 * ⚠ THE DRIFT RULE (the named risk · contract §4 ①). Every prop→style path
 * here goes through `resolveNS` (which itself drives `applyFields` over the
 * SHARED STACK_FIELDS/BOX_FIELDS resolve-map the web CSS is generated from) and
 * `flattenInteractive` (the SAME interactive opt-in applier the descriptor
 * factory uses). There is NO second hand-written prop→style mapping — that is
 * exactly the drift the single-SoT contract forbids. The ONE bit of routing this
 * file owns is BUCKETING flat props into their namespace by membership in the
 * runtime key tables (Object.keys(STACK_FIELDS) etc.) — a key-set classification,
 * not a style mapping.
 *
 * NAME COLLISION: the DS exports are View/Stack/Text/Pressable/Screen/Scroll
 * (the Pascal of the public names · the deterministic-naming convention). The
 * react-native hosts are aliased (View as RNView, …) so the DS `View` wraps the
 * RN `RNView`.
 *
 * COLOUR BY SCOPE (§12 · F-BOX-FG-1): a View/Pressable carrying a palette
 * PROVIDES its resolved fg via NuriSurfaceContext; a descendant Text reads it
 * (own palette > inherited surface fg), exactly as the factory threads it — the
 * primitives reuse the factory's context, not a parallel mechanism.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import type { StackNS, BoxNS, TypographyNS, PaletteNS, InteractiveNS, NS } from '../contract';
import { useNuriTheme, typeStyle } from '../theme';
import type { NuriTheme } from './theme';
import { resolveNS, flattenInteractive } from './resolve';
import type { ResolvedNode } from './resolve';
import { NuriSurfaceContext } from './createNuriComponent';
import { STACK_FIELDS, BOX_FIELDS } from '@nuri/spec/resolve-map';
import { opts as INTERACTIVE_OPTS } from '@nuri/spec/interactive-effects';
import { PALETTE_KEYS, TYPOGRAPHY_KEYS } from '@nuri/spec/descriptors/schema';

// ── the per-namespace RUNTIME key tables (the schema-derived SoT · ONE per ns) ──
// box/stack/interactive come STRAIGHT from the shared mapping tables (the same
// the appliers walk); palette/typography from the schema's own runtime key lists
// (PALETTE_KEYS/TYPOGRAPHY_KEYS · totality-pinned at the source · @nuri/spec). No
// key set is hand-listed here. ⚠ The grab order below matches NS_ORDER (stack →
// box → typography → palette → interactive) so a merged node's style key order is
// identical to the factory's.
const STACK_KEYS = Object.keys(STACK_FIELDS);
const BOX_KEYS = Object.keys(BOX_FIELDS);
const INTERACTIVE_KEYS = Object.keys(INTERACTIVE_OPTS);

// pickNS · bucket flat props into the merged NS by key membership. A
// classification (which namespace owns a key), NOT a style mapping — the style
// resolution stays entirely in resolveNS. The namespace input keys are disjoint
// across the five (schema §6 · verified), so a flat prop lands in exactly one
// bucket. Insertion order = NS_ORDER (the factory's merge order).
function pickNS(props: Record<string, unknown>): NS {
  const ns: NS = {};
  const grab = (keys: string[], slot: keyof NS): void => {
    let obj: Record<string, unknown> | undefined;
    for (const k of keys) if (props[k] !== undefined) (obj ??= {})[k] = props[k];
    if (obj) (ns as Record<string, unknown>)[slot] = obj;
  };
  grab(STACK_KEYS, 'stack');
  grab(BOX_KEYS, 'box');
  grab(TYPOGRAPHY_KEYS, 'typography');
  grab(PALETTE_KEYS, 'palette');
  grab(INTERACTIVE_KEYS, 'interactive');
  return ns;
}

// useResolvedNode · the one resolution path every painting primitive shares.
// Reads the RESOLVED payload from context (Option B · SEED-4 · no per-primitive
// `buildNuriTheme` rebuild) + the ambient surface fg, and resolves the bucketed
// namespaces through resolveNS. A per-scope accent override rides the SAME
// NuriScope path (the payload is already the scoped theme).
function useResolvedNode(nsProps: Record<string, unknown>): {
  node: ResolvedNode;
  fg: string | undefined;
  theme: NuriTheme;
} {
  const theme = useNuriTheme();
  const ambient = React.useContext(NuriSurfaceContext);
  const node = resolveNS(pickNS(nsProps), theme);
  return { node, fg: node.fg ?? ambient.foreground, theme };
}

// A primitive carries its NAMESPACE prop-key list as a runtime array — the
// parity gate (contract §3.3a) reads it to assert web-ATTRS ≡ RN-props ≡
// schema-NS-keys without trusting a hand list.
type Primitive<P> = React.FC<P> & { propKeys: readonly string[] };

const withKeys = <P,>(component: React.FC<P>, propKeys: readonly string[]): Primitive<P> => {
  const c = component as Primitive<P>;
  c.propKeys = propKeys;
  return c;
};

// §12 — wrap children in the surface-fg provider when this node resolves an fg,
// so descendant Text/Icon inherit it (the factory's colour-by-scope · reused).
function withSurface(fg: string | undefined, children: React.ReactNode): React.ReactNode {
  return fg !== undefined ? (
    <NuriSurfaceContext.Provider value={{ foreground: fg }}>{children}</NuriSurfaceContext.Provider>
  ) : (
    children
  );
}

// ════════════════════════════════════════════════════════════════
// View — the merged painting node (box ⊕ stack ⊕ palette) · RN <View>
// ════════════════════════════════════════════════════════════════
export type ViewProps = BoxNS & StackNS & PaletteNS & { children?: React.ReactNode };

const ViewImpl: React.FC<ViewProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  return <RNView style={node.view}>{withSurface(node.fg, children)}</RNView>;
};
ViewImpl.displayName = 'View';
export const View = withKeys(ViewImpl, [...BOX_KEYS, ...STACK_KEYS, ...PALETTE_KEYS]);

// ════════════════════════════════════════════════════════════════
// Stack — the flex-layout slice (stack namespace) · RN <View>
// ════════════════════════════════════════════════════════════════
export type StackProps = StackNS & { children?: React.ReactNode };

const StackImpl: React.FC<StackProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node } = useResolvedNode(nsProps);
  return <RNView style={node.view}>{children}</RNView>;
};
StackImpl.displayName = 'Stack';
export const Stack = withKeys(StackImpl, STACK_KEYS);

// ════════════════════════════════════════════════════════════════
// Text — typography (+ palette colour) · RN <Text>
// ────────────────────────────────────────────────────────────────
// Mirrors the factory's `text` render (createNuriComponent §case 'text'): the
// type ref expands via typeStyle(size, emphasis); the colour is own-palette fg
// or the inherited surface fg (§12); any palette bg lands via node.view.
// ════════════════════════════════════════════════════════════════
export type TextProps = TypographyNS & PaletteNS & { children?: React.ReactNode };

const TextImpl: React.FC<TextProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node, fg } = useResolvedNode(nsProps);
  return (
    <RNText
      style={[
        node.type ? typeStyle(node.type.size, node.type.emphasis) : null,
        fg ? { color: fg } : null,
        node.view as TextStyle,
      ]}
    >
      {children}
    </RNText>
  );
};
TextImpl.displayName = 'Text';
export const Text = withKeys(TextImpl, [...TYPOGRAPHY_KEYS, ...PALETTE_KEYS]);

// ════════════════════════════════════════════════════════════════
// Pressable — View + the interactive opt-in (+ onPress) · RN <Pressable>
// ────────────────────────────────────────────────────────────────
// Mirrors the factory's interactive-view branch (createNuriComponent:165): the
// pressed render-prop re-applies the interactive transients via the SHARED
// flattenInteractive (F-PRESSED-1); disabled drives the a11y state + the
// disabledOpacity opt-in. behaviour (onPress/disabled/a11y) is the wrapper's;
// the style is 100% resolve.ts.
// ════════════════════════════════════════════════════════════════
export type PressableProps = BoxNS &
  StackNS &
  PaletteNS &
  InteractiveNS & {
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };

const PressableImpl: React.FC<PressableProps> = (props) => {
  const { children, onPress, disabled, accessibilityLabel, ...nsProps } = props;
  const { node, theme } = useResolvedNode(nsProps);
  const isDisabled = !!disabled;
  return (
    <RNPressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => flattenInteractive(node, theme, { pressed, disabled: isDisabled })}
    >
      {withSurface(node.fg, children)}
    </RNPressable>
  );
};
PressableImpl.displayName = 'Pressable';
export const Pressable = withKeys(PressableImpl, [
  ...BOX_KEYS,
  ...STACK_KEYS,
  ...PALETTE_KEYS,
  ...INTERACTIVE_KEYS,
]);

// ════════════════════════════════════════════════════════════════
// Screen — the structural flex-column fill · RN <View style={{flex:1}}>
// (screen.js:9 · "a thin component over <View> · flex:1") · no namespace.
// ════════════════════════════════════════════════════════════════
export type ScreenProps = { children?: React.ReactNode };

const ScreenImpl: React.FC<ScreenProps> = ({ children }) => (
  <RNView style={SCREEN_STYLE}>{children}</RNView>
);
ScreenImpl.displayName = 'Screen';
export const Screen = withKeys(ScreenImpl, []);
const SCREEN_STYLE: ViewStyle = { flex: 1 };

// ════════════════════════════════════════════════════════════════
// Scroll — the structural flex-fill + overflow · RN <ScrollView>
// (scroll.js:8 · "a thin component over <ScrollView>") · no namespace.
// ════════════════════════════════════════════════════════════════
export type ScrollProps = { children?: React.ReactNode };

const ScrollImpl: React.FC<ScrollProps> = ({ children }) => (
  <RNScrollView style={SCREEN_STYLE}>{children}</RNScrollView>
);
ScrollImpl.displayName = 'Scroll';
export const Scroll = withKeys(ScrollImpl, []);
