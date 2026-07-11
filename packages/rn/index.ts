/* ──────────────────────────────────────────────────────────────
 * NURI · public barrel · the consumer-facing API surface.
 * Import Nuri from here: `import { Button, NuriThemeProvider } from './src/nuri'`.
 *
 * The clean factory example (R1.5): the contract seam + the theme runtime +
 * generated descriptor adapters (Button / IconAvatar / Topbar / ...) over an
 * internal shared renderer.
 *
 * PUBLIC SURFACE: theme/safe-area/overlay runtimes, generated components and
 * slot markers, hand-authorable primitives, NuriIcon, their Props types, and
 * the semantic leaf types those Props expose. Descriptor data, scale tables,
 * renderer helpers, contexts, resolution functions, and intermediate engine
 * types are intra-package imports only.
 *
 * ⚠ Arc 1 INTENTIONALLY RESHAPED THE RN API (Option B · resolve colour once at the
 * provider): the payload now lives in context and the engine left the public
 * surface. "No behaviour change" refers to the RENDER OUTPUT (byte-identical · the
 * snapshots + the colour-payload-identity guard), NOT the module surface. There is
 * no compat shim — @nuri/rn has no external consumer to break.
 * ────────────────────────────────────────────────────────────── */

export { NuriRoot } from './root';
export type { NuriRootProps } from './root';
export { NuriThemeProvider, NuriScope, useNuriTheme, typeStyle } from './theme';
export type { ThemePayload, SpaceLeaf, TypeKey, NuriThemeValue } from './theme';
export type {
  Accent,
  Theme,
  TypeSize,
  TypeWeight,
  TypeStep,
  IconName,
  SizeLeaf,
  RadiusLeaf,
  RatioLeaf,
  PaletteVariant,
  PaletteChrome,
  Elevation,
} from './contract';
export { NuriSafeAreaProvider, useNuriSafeAreaInsets } from './safe-area';
export type { NuriSafeAreaInsets, NuriSafeAreaProviderProps } from './safe-area';

// The overlay runtime — the DS overlay layer (route B · docs/bottom-sheet-
// improvements.md). OverlayProvider is a root provider (like NuriThemeProvider)
// the consumer mounts once, ABOVE their safe-area padding; <BottomSheet>
// registers its subtree into it via useOverlay. RN-only runtime behaviour (no
// web equivalent — web is a static device-frame layer).
export { OverlayProvider, useOverlay } from './overlay';
export type { OverlayApi, OverlayLayerOptions } from './overlay';

// Resolved theme shapes are public because useNuriTheme returns them. The
// payload builder and interaction baseline remain internal engine details.
export type { NuriTheme, SurfaceRole, ChromeRole } from './runtime/theme-payload';

// The DS-owned RN glyph renderer (the icon contract): resolves a typed `IconName`
// → the register glyph → react-native-svg. The renderer's icon part renders this;
// it is also the standalone RN twin of web's `<nuri-icon name>`.
export { NuriIcon } from './primitives';
export type { NuriIconProps } from './primitives';

// The hand-authorable OPEN primitive layer — the RN twins of the web
// `<nuri-view/typography/pressable/screen/scroll/dock>` (primitives-contract §1 ·
// the §2 parity gap · step ①). Thin wrappers forwarding namespace props through the
// SAME runtime/resolve.ts appliers (no second mapping · the drift rule). NOT descriptors.
export {
  View,
  Text,
  Pressable,
  Screen,
  Header,
  Scroll,
  Footer,
  Dock,
  Separator,
  ListSeparator,
  BottomSheet,
  BottomSheetPanel,
} from './primitives';
export type {
  ViewProps,
  TextProps,
  PressableProps,
  ScreenProps,
  HeaderProps,
  ScrollProps,
  ScrollInsetTop,
  ScrollInsetBottom,
  FooterProps,
  DockProps,
  DockEdge,
  SeparatorProps,
  SeparatorYSpace,
  ListSeparatorProps,
  BottomSheetProps,
  BottomSheetDetent,
  BottomSheetScrim,
  BottomSheetPanelProps,
} from './primitives';

// Generated component adapters (Path C · Phase 3). Each descriptor's `api` emits
// an exact public `*Props` type and a runtime adapter that normalizes public props
// into selection, content, behaviour, and accent scope before calling the shared
// renderer. The renderer receives a descriptor instance; it no longer derives a
// consumer API from anatomy.
//   <Button variant="solid" size="lg" accent="lilac" onPress={…}>Buy</Button>
//   <Button><ButtonText>Buy</ButtonText><ButtonIcon name="apple" /></Button>
//   <IconAvatar variant="soft" icon="apple" />
//   <IconButton variant="soft" icon="apple" accessibilityLabel="Buy" onPress={…} />
//   <List><ListAction><ListActionLeadingAvatar name="bank" />…</ListAction></List>
//   <Topbar><TopbarLeading>…</TopbarLeading><TopbarCenter>…</TopbarCenter>…</Topbar>
//   <TabBar><TabBarItem selected><TabBarItemIcon name="card" /><TabBarItemLabel>Wallet</TabBarItemLabel></TabBarItem>…</TabBar>
export {
  Button,
  ButtonText,
  ButtonIcon,
  Alert,
  AlertIcon,
  AlertButton,
  IconAvatar,
  Topbar,
  TopbarLeading,
  TopbarCenter,
  TopbarTrailing,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailingText,
  ListActionTrailingTextMuted,
  ListActionTrailIcon,
  TextField,
  TextFieldLabel,
  TextFieldButton,
  TextFieldIconButton,
  TabBarItem,
  TabBarItemIcon,
  TabBarItemLabel,
  TabBar,
} from './generated/components';
export type {
  ButtonProps,
  ButtonTextProps,
  ButtonIconProps,
  AlertProps,
  AlertIconProps,
  AlertButtonProps,
  IconAvatarProps,
  TopbarProps,
  TopbarLeadingProps,
  TopbarCenterProps,
  TopbarTrailingProps,
  IconButtonProps,
  ListProps,
  ListActionProps,
  ListActionLeadingAvatarProps,
  ListActionTextProps,
  ListActionTextMutedProps,
  ListActionTrailingTextProps,
  ListActionTrailingTextMutedProps,
  ListActionTrailIconProps,
  TextFieldProps,
  TextFieldHandle,
  TextFieldLabelProps,
  TextFieldButtonProps,
  TextFieldIconButtonProps,
  TabBarItemProps,
  TabBarItemIconProps,
  TabBarItemLabelProps,
  TabBarProps,
} from './generated/components';
