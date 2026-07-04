/* ══════════════════════════════════════════════════════════════════
 * NURI · PRIMITIVES · THE HAND-AUTHORABLE PRIMITIVE LAYER (RN)
 * ──────────────────────────────────────────────────────────────────
 * The OPEN primitives a consumer composes screens with — the RN twins of
 * the web `<nuri-stack>` / `<nuri-view>` / `<nuri-typography>` /
 * `<nuri-pressable>` / `<nuri-screen>` / `<nuri-scroll>` custom elements
 * (docs/primitives-contract.md §1.A · the §2 web↔RN parity gap · step ①).
 *
 * They are NOT descriptors — they do NOT route through the descriptor
 * renderer (runtime/renderer.tsx · which renders CLOSED frozen descriptors).
 * A primitive is the OPEN raw-axis passthrough: typed flat props = the schema
 * namespaces (schema.ts), forwarded through the EXISTING runtime/resolve.ts
 * appliers → an RN host. The merged View carries box ⊕ stack ⊕ palette;
 * Stack the stack slice; Text typography (+ palette colour); Pressable adds
 * the interactive opt-in; Screen/Scroll are structural.
 *
 * ⚠ THE DRIFT RULE (the named risk · contract §4 ①). Every prop→style path
 * here goes through `resolveNS` (which itself drives `applyFields` over the
 * SHARED STACK_FIELDS/BOX_FIELDS resolve-map the web CSS is generated from) and
 * `flattenInteractive` (the SAME interactive opt-in applier the descriptor
 * factory uses). There is NO second hand-written prop→style mapping — that is
 * exactly the drift the single-SoT contract forbids. The ONE bit of routing this
 * layer owns is BUCKETING flat props into their namespace by membership in the
 * runtime key tables (Object.keys(STACK_FIELDS) etc. · shared.tsx) — a key-set
 * classification, not a style mapping.
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

export { View } from './View';
export type { ViewProps } from './View';
export { Stack } from './Stack';
export type { StackProps } from './Stack';
export { Text } from './Text';
export type { TextProps } from './Text';
export { Pressable } from './Pressable';
export type { PressableProps } from './Pressable';
export { Screen } from './Screen';
export type { ScreenProps } from './Screen';
export { Scroll } from './Scroll';
export type { ScrollProps, ScrollInsetBottom } from './Scroll';
export { Dock } from './Dock';
export type { DockProps, DockEdge } from './Dock';
export { NuriIcon } from './NuriIcon';
export type { NuriIconProps } from './NuriIcon';
export { Separator } from './Separator';
export type { SeparatorProps, SeparatorYSpace } from './Separator';
export { ListSeparator } from './ListSeparator';
export type { ListSeparatorProps } from './ListSeparator';
export { BottomSheet, BottomSheetPanel, BottomSheetScroll } from './BottomSheet';
export type {
  BottomSheetProps,
  BottomSheetDetent,
  BottomSheetScrim,
  BottomSheetPanelProps,
  BottomSheetScrollProps,
} from './BottomSheet';
