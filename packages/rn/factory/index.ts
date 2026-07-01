/* ══════════════════════════════════════════════════════════════════
 * NURI · FACTORY · public surface
 * ──────────────────────────────────────────────────────────────────
 * The generic descriptor → RN factory (decision 65 · 65.5 X-wired). ALONGSIDE
 * the hand-written src/nuri/components/* (the golden reference) — proves the
 * frozen contract is consumable end-to-end, it does NOT replace them (R3 ·
 * clean-slate retirement is LAST · 65.5).
 *
 * GENERICITY, demonstrated: the three pre-built components below are the SAME
 * createNuriComponent applied to the three frozen descriptors — zero
 * per-component code.
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

export { createNuriComponent, NuriSurfaceContext, nuriNames, pascalCase, compoundSlots } from './createNuriComponent';
export type { NuriComponentProps, NuriBaseProps, NuriSlot } from './createNuriComponent';

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

// The frozen descriptors, each through the SAME factory — the ergonomic,
// 1:1-with-web components the RN team consumes. These ARE the public Nuri RN
// components (the hand-written migration mirrors are retired · R1.5).
//
// EXACT-TYPED per component (Path C · Phase 2 · docs/component-api-target.md): the
// `createNuriComponent` bindings + the per-component `*Props` types now live in the
// GENERATED codegen output (packages/rn/generated/components/* · emitted from each
// descriptor's `api` · committed + drift-gated). This barrel RE-EXPORTS them so the
// public surface is one path. Each export is the EXISTING factory instance NARROWED
// to its real surface (`FC<Wide>`→`FC<Narrow>` · props contravariant · same instance,
// same recipe, render byte-identical) — so `<Button icon="x"/>` is now a TYPE error
// (ButtonProps has no `icon`) and `<IconButton>child</IconButton>` is one too
// (`children?: never`), while the RUNTIME is unchanged. The compound Topbar's flat
// region sub-components (TopbarLeading/Center/Trailing) are re-exported from the
// generated module too (the `compoundSlots` attachment is preserved on the generated
// instance). The renderer heuristics (primaryPart · same-name routing · the selected
// bridge) stay UNTOUCHED until Phase 3 — this phase only tightens the TYPE surface.
//   <Button variant="solid" size="md" accent="lilac" onPress={…}>Buy</Button>
//   <IconAvatar variant="soft" icon="apple" />
//   <IconButton variant="soft" icon="apple" accessibilityLabel="Buy" onPress={…} />
//   <Topbar><TopbarLeading>…</TopbarLeading><TopbarCenter>…</TopbarCenter>…</Topbar>
//   <TabBar><TabBarItem icon="card" label="Wallet" selected onPress={…} />…</TabBar>
export {
  Button,
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
  IconAvatarProps,
  TopbarProps,
  IconButtonProps,
  TabBarItemProps,
  TabBarProps,
} from '../generated/components';
