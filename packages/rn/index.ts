/* ──────────────────────────────────────────────────────────────
 * NURI · public barrel · the consumer-facing API surface.
 * Import Nuri from here: `import { Button, NuriThemeProvider } from './src/nuri'`.
 *
 * The clean factory example (R1.5): the contract seam + the theme runtime +
 * generated descriptor adapters (Button / IconAvatar / Topbar / ...) over a
 * shared normalized renderer. The hand-written migration mirrors are retired.
 *
 * PUBLIC SURFACE (SEED-4 · completion): the theming API (NuriThemeProvider · NuriScope ·
 * useNuriTheme · typeStyle · the ThemePayload type), the
 * components + renderer helpers (nuriNames · NuriSurfaceContext · the
 * Button/IconAvatar/Topbar/… instances), NuriIcon, and the
 * hand-authorable primitives (View/Stack/Text/Pressable/Screen/Scroll/Dock). The generic
 * descriptor ENGINE (resolveNS · flattenPart · flattenBakedPart · buildNuriTheme ·
 * the palette MAPPING · the baked geometry recipe + the resolver intermediate types)
 * is deliberately INTERNAL — intra-package module exports only (runtime/), not on
 * this barrel.
 *
 * ⚠ Arc 1 INTENTIONALLY RESHAPED THE RN API (Option B · resolve colour once at the
 * provider): the payload now lives in context and the engine left the public
 * surface. "No behaviour change" refers to the RENDER OUTPUT (byte-identical · the
 * snapshots + the colour-payload-identity guard), NOT the module surface. There is
 * no compat shim — @nuri/rn has no external consumer to break.
 * ────────────────────────────────────────────────────────────── */

export * from './contract';
export * from './theme';

// The theme PAYLOAD shape (typed) + the interaction baseline are public; the
// PAYLOAD BUILDER (`buildNuriTheme`) is an internal engine detail (SEED-4 · Arc 1)
// — the provider/scope drive it, consumers never call it — so it is NOT re-exported
// (still an intra-package export off ./runtime/theme-payload for the resolution
// tests + the provider).
export { INTERACTION_BASELINE } from './runtime/theme-payload';
export type { NuriTheme, SurfaceRole, ChromeRole } from './runtime/theme-payload';

// The generic descriptor ENGINE (resolveNS · flattenPart · flattenBakedPart ·
// assertNever + their intermediate types ResolvedNode/ResolvedPalette/PartFlat/
// BakedPartRecipe/BakedComponentRecipe) is INTERNAL (SEED-4 · Arc 1 · @nuri/rn has
// no external consumer). It stays a plain module export off ./runtime/resolve
// (imported directly by the renderer/primitives + the tests), NOT part of the
// public barrel. Only the anatomy walk + the Selection/State value types stay public.
export { resolveAnatomy } from './runtime/resolve';
export type { AnatomyNode, Selection, State } from './runtime/resolve';

export {
  NuriSurfaceContext,
  nuriNames,
  pascalCase,
  createNuriSlot,
  harvestNuriSlots,
  harvestNuriComposition,
  renderDescriptorInstance,
} from './runtime/renderer';
export type { NuriSlot, NuriCompositionEntry, NuriBehaviour, NuriDescriptorInstance } from './runtime/renderer';

// The DS-owned RN glyph renderer (the icon contract): resolves a typed `IconName`
// → the register glyph → react-native-svg. The renderer's icon part renders this;
// it is also the standalone RN twin of web's `<nuri-icon name>`.
export { NuriIcon } from './primitives';
export type { NuriIconProps } from './primitives';

// The hand-authorable OPEN primitive layer — the RN twins of the web
// `<nuri-stack/view/typography/pressable/screen/scroll/dock>` (primitives-contract §1.A ·
// the §2 parity gap · step ①). Thin wrappers forwarding namespace props through the
// SAME runtime/resolve.ts appliers (no second mapping · the drift rule). NOT descriptors.
export {
  View,
  Stack,
  Text,
  Pressable,
  Screen,
  Scroll,
  Dock,
  Separator,
  ListSeparator,
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
} from './primitives';
export type {
  ViewProps,
  StackProps,
  TextProps,
  PressableProps,
  ScreenProps,
  ScrollProps,
  DockProps,
  SeparatorProps,
  SeparatorYSpace,
  ListSeparatorProps,
  BottomSheetProps,
  BottomSheetDetent,
  BottomSheetScrim,
  BottomSheetPanelProps,
  BottomSheetScrollProps,
} from './primitives';

// Generated component adapters (Path C · Phase 3). Each descriptor's `api` emits
// an exact public `*Props` type and a runtime adapter that normalizes public props
// into selection, content, behaviour, and accent scope before calling the shared
// renderer. The renderer receives a descriptor instance; it no longer derives a
// consumer API from anatomy.
//   <Button variant="solid" size="md" accent="lilac" onPress={…}>Buy</Button>
//   <Button><ButtonText>Buy</ButtonText><ButtonIcon name="apple" /></Button>
//   <IconAvatar variant="soft" icon="apple" />
//   <IconButton variant="soft" icon="apple" accessibilityLabel="Buy" onPress={…} />
//   <List><ListAction><ListActionLeadingAvatar name="bank" />…</ListAction></List>
//   <Topbar><TopbarLeading>…</TopbarLeading><TopbarCenter>…</TopbarCenter>…</Topbar>
//   <TabBar><TabBarItem icon="card" label="Wallet" selected onPress={…} />…</TabBar>
export {
  Button,
  ButtonText,
  ButtonIcon,
  IconAvatar,
  Topbar,
  TopbarLeading,
  TopbarCenter,
  TopbarTrailing,
  IconButton,
  List,
  ListAction,
  ListActionContent,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailing,
  ListActionTrailingText,
  ListActionTrailingTextMuted,
  ListActionTrailIcon,
  TabBarItem,
  TabBar,
} from './generated/components';
export type {
  ButtonProps,
  ButtonTextProps,
  ButtonIconProps,
  IconAvatarProps,
  TopbarProps,
  IconButtonProps,
  ListProps,
  ListActionProps,
  ListActionLeadingAvatarProps,
  ListActionTextProps,
  ListActionTextMutedProps,
  ListActionTrailingTextProps,
  ListActionTrailingTextMutedProps,
  ListActionTrailIconProps,
  TabBarItemProps,
  TabBarProps,
} from './generated/components';
