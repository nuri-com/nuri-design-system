/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · public surface
 * ──────────────────────────────────────────────────────────────────
 * The RN projection surface: generated component adapters, the shared normalized
 * descriptor renderer, primitives, theme types, and the DS-owned icon renderer.
 * ══════════════════════════════════════════════════════════════════ */

// The theme PAYLOAD shape (typed) + the interaction baseline are public; the
// PAYLOAD BUILDER (`buildNuriTheme`) is an internal engine detail (SEED-4 · Arc 1)
// — the provider/scope drive it, consumers never call it — so it is NOT re-exported
// (still an intra-package export off ./theme for the resolution tests + the provider).
export { INTERACTION_BASELINE } from './theme';
export type { NuriTheme, SurfaceRole, ChromeRole } from './theme';

// The generic descriptor ENGINE (resolveNS · flattenPart · flattenBakedPart ·
// assertNever + their intermediate types ResolvedNode/ResolvedPalette/PartFlat/
// BakedPartRecipe/BakedComponentRecipe) is INTERNAL (SEED-4 · Arc 1 · @nuri/rn has
// no external consumer). It stays a plain module export off ./resolve (imported
// directly by the factory/primitives + the tests), NOT part of the public barrel.
// Only the anatomy walk + the Selection/State value types stay public.
export { resolveAnatomy } from './resolve';
export type { AnatomyNode, Selection, State } from './resolve';

export {
  NuriSurfaceContext,
  nuriNames,
  pascalCase,
  createNuriSlot,
  harvestNuriSlots,
  harvestNuriComposition,
  renderDescriptorInstance,
} from './createNuriComponent';
export type { NuriSlot, NuriCompositionEntry, NuriBehaviour, NuriDescriptorInstance } from './createNuriComponent';

// The DS-owned RN glyph renderer (the icon contract): resolves a typed `IconName`
// → the register glyph → react-native-svg. The factory's icon part renders this;
// it is also the standalone RN twin of web's `<nuri-icon name>`.
export { NuriIcon } from './NuriIcon';
export type { NuriIconProps } from './NuriIcon';

// The hand-authorable OPEN primitive layer — the RN twins of the web
// `<nuri-stack/view/typography/pressable/screen/scroll>` (primitives-contract §1.A ·
// the §2 parity gap · step ①). Thin wrappers forwarding namespace props through the
// SAME resolve.ts appliers (no second mapping · the drift rule). NOT descriptors.
export { View, Stack, Text, Pressable, Screen, Scroll } from './primitives';
export type {
  ViewProps,
  StackProps,
  TextProps,
  PressableProps,
  ScreenProps,
  ScrollProps,
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
  TabBarItem,
  TabBar,
} from '../generated/components';
export type {
  ButtonProps,
  ButtonTextProps,
  ButtonIconProps,
  IconAvatarProps,
  TopbarProps,
  IconButtonProps,
  TabBarItemProps,
  TabBarProps,
} from '../generated/components';
