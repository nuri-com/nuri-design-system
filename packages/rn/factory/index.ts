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

export { buildNuriTheme, INTERACTION_BASELINE } from './theme';
export type { NuriTheme, SurfaceRole, ChromeRole } from './theme';

export {
  resolveNS,
  resolveAnatomy,
  flattenPart,
  toUnistylesRecipe,
  recipeFor,
  assertNever,
} from './resolve';
export type {
  ResolvedNode,
  ResolvedPalette,
  AnatomyNode,
  PartFlat,
  Selection,
  State,
  CompoundVariant,
  PartRecipe,
  ComponentRecipe,
} from './resolve';

export { createNuriComponent, NuriSurfaceContext, nuriNames, pascalCase, compoundSlots } from './createNuriComponent';
export type { NuriComponentProps, NuriBaseProps, NuriSlot } from './createNuriComponent';

// The DS-owned RN glyph renderer (the icon contract): resolves a typed `IconName`
// → the register glyph → react-native-svg. The factory's icon part renders this;
// it is also the standalone RN twin of web's `<nuri-icon name>`.
export { NuriIcon } from './NuriIcon';
export type { NuriIconProps } from './NuriIcon';

import { createNuriComponent, nuriNames, compoundSlots } from './createNuriComponent';
import {
  compositionButtonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  iconButtonDescriptor,
  tabDescriptor,
  tabBarDescriptor,
} from '../contract';

// The frozen descriptors, each through the SAME factory — the ergonomic,
// 1:1-with-web components the RN team consumes (typed named props derived from
// each descriptor's axes; zero per-component code). These ARE the public Nuri
// RN components now (the hand-written migration mirrors are retired · R1.5).
//
// EVERY name is DERIVED from ONE public kebab name via `nuriNames` (the
// deterministic rule · web `nuri-{kebab}` · RN `Pascal({kebab})`) — no
// hand-authored displayName string. The public name is the registry's
// (DESCRIPTOR_COMPONENTS.public): `composition-button` → `button`, `tab` →
// `tab-bar-item`; the rest match the source. Mirrored by the web recipes' tags.
//   <Button variant="solid" size="md" accent="lilac" onPress={…}>Buy</Button>
//   <IconAvatar variant="soft" icon="apple" />
//   <Topbar><TopbarLeading>…</TopbarLeading><TopbarCenter>…</TopbarCenter>…</Topbar>
export const Button = createNuriComponent(compositionButtonDescriptor, nuriNames('button').rn);
export const IconAvatar = createNuriComponent(iconAvatarDescriptor, nuriNames('icon-avatar').rn);

// Topbar is the catalog's first COMPOUND component (the slot-based action bar):
// the factory attaches one typed region sub-component, FLAT-named (the runtime is
// generic · derived from the anatomy's `view` regions). `compoundSlots` surfaces
// each region as a STANDALONE component — `TopbarLeading/Center/Trailing` ↔ the web
// `nuri-topbar-leading/center/trailing` (no dot-notation, no hand-authored cast).
// Bare children of <Topbar> default to the trailing region (the "just actions" case).
export const Topbar = createNuriComponent(topbarDescriptor, nuriNames('topbar').rn);
const topbarSlots = compoundSlots(Topbar);
export const TopbarLeading = topbarSlots.TopbarLeading;
export const TopbarCenter = topbarSlots.TopbarCenter;
export const TopbarTrailing = topbarSlots.TopbarTrailing;

// The icon-anchored control (P11 · the first contract bump): bare = the round
// icon action; flanked = `<IconButton prefix="Buy Bitcoin" icon="apple"
// suffix="Pay" />` (the prefix/suffix text flanks · the new Part vocab).
export const IconButton = createNuriComponent(iconButtonDescriptor, nuriNames('icon-button').rn);

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
export const TabBarItem = createNuriComponent(tabDescriptor, nuriNames('tab-bar-item').rn);
export const TabBar = createNuriComponent(tabBarDescriptor, nuriNames('tab-bar').rn);
