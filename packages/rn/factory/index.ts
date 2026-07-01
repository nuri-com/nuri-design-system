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

import { createNuriComponent, nuriNames, compoundSlots } from './createNuriComponent';
import {
  buttonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  iconButtonDescriptor,
  tabBarItemDescriptor,
  tabBarDescriptor,
} from '../contract';
// The BAKED GEOMETRY SLICE (Arc 2 · D11 + D5 · generated/recipes.ts) — box/stack/
// typography/interactive resolved at build, keyed by the component's public kebab.
// Each binding hands its recipe to createNuriComponent, which LOADS it instead of
// re-resolving geometry every render. Internal engine detail (like generated/palette),
// imported straight from generated/ — never on the public barrel.
import { recipes } from '../generated/recipes';

// The frozen descriptors, each through the SAME factory — the ergonomic,
// 1:1-with-web components the RN team consumes (typed named props derived from
// each descriptor's axes; zero per-component code). These ARE the public Nuri
// RN components now (the hand-written migration mirrors are retired · R1.5).
//
// EVERY name is DERIVED from ONE public kebab name via `nuriNames` (the
// deterministic rule · web `nuri-{kebab}` · RN `Pascal({kebab})`) — no
// hand-authored displayName string. The public name IS the descriptor name now
// (deterministic-naming · SEED-2 · DESCRIPTOR_COMPONENTS, name===public): the
// `nuriNames('…')` string equals each descriptor's source-file basename. Mirrored
// by the web recipes' tags; the naming guard pins each string ∈ the one roster.
//   <Button variant="solid" size="md" accent="lilac" onPress={…}>Buy</Button>
//   <IconAvatar variant="soft" icon="apple" />
//   <Topbar><TopbarLeading>…</TopbarLeading><TopbarCenter>…</TopbarCenter>…</Topbar>
export const Button = createNuriComponent(buttonDescriptor, nuriNames('button').rn, recipes['button']);
export const IconAvatar = createNuriComponent(iconAvatarDescriptor, nuriNames('icon-avatar').rn, recipes['icon-avatar']);

// Topbar is the catalog's first COMPOUND component (the slot-based action bar):
// the factory attaches one typed region sub-component, FLAT-named (the runtime is
// generic · derived from the anatomy's `view` regions). `compoundSlots` surfaces
// each region as a STANDALONE component — `TopbarLeading/Center/Trailing` ↔ the web
// `nuri-topbar-leading/center/trailing` (no dot-notation, no hand-authored cast).
// Bare children of <Topbar> default to the trailing region (the "just actions" case).
export const Topbar = createNuriComponent(topbarDescriptor, nuriNames('topbar').rn, recipes['topbar']);
const topbarSlots = compoundSlots(Topbar);
export const TopbarLeading = topbarSlots.TopbarLeading;
export const TopbarCenter = topbarSlots.TopbarCenter;
export const TopbarTrailing = topbarSlots.TopbarTrailing;

// The icon-anchored control (P11 · the first contract bump): bare = the round
// icon action; flanked = `<IconButton prefix="Buy Bitcoin" icon="apple"
// suffix="Pay" />` (the prefix/suffix text flanks · the new Part vocab).
export const IconButton = createNuriComponent(iconButtonDescriptor, nuriNames('icon-button').rn, recipes['icon-button']);

// The bottom navigation bar (presentation only) — TabBar is a DUMB layout
// container that renders its positional TabBarItem children as EQUAL columns (the
// open-positional-children capability · NOT a compound: an item is repeated, not a
// named slot). The item is a SEPARATE descriptor with its own public name
// (`tab-bar-item` → `TabBarItem` · web `nuri-tab-bar-item`), exported standalone —
// no `TabBar.Item` dot-accessor, no cast:
//   const [active, setActive] = useState('wallet');
//   <TabBar>
//     <TabBarItem icon="card" label="Wallet" selected={active === 'wallet'}
//                 onPress={() => setActive('wallet')} />
//     …
//   </TabBar>
// The DS never sees `active`/`value`; `selected` is a consumer-computed boolean
// (bridged onto the item's `state` appearance axis · the muted treatment),
// `onPress` is passthrough.
export const TabBarItem = createNuriComponent(tabBarItemDescriptor, nuriNames('tab-bar-item').rn, recipes['tab-bar-item']);
export const TabBar = createNuriComponent(tabBarDescriptor, nuriNames('tab-bar').rn, recipes['tab-bar']);
