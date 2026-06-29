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

export { createNuriComponent, NuriSurfaceContext } from './createNuriComponent';
export type { NuriComponentProps, NuriBaseProps, NuriSlot } from './createNuriComponent';

// The DS-owned RN glyph renderer (the icon contract): resolves a typed `IconName`
// → the register glyph → react-native-svg. The factory's icon part renders this;
// it is also the standalone RN twin of web's `<nuri-icon name>`.
export { NuriIcon } from './NuriIcon';
export type { NuriIconProps } from './NuriIcon';

import { createNuriComponent } from './createNuriComponent';
import type { NuriSlot } from './createNuriComponent';
import {
  compositionButtonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  iconButtonDescriptor,
} from '../contract';

// The frozen descriptors, each through the SAME factory — the ergonomic,
// 1:1-with-web components the RN team consumes (typed named props derived from
// each descriptor's axes; zero per-component code). These ARE the public Nuri
// RN components now (the hand-written migration mirrors are retired · R1.5).
//   <Button variant="solid" size="md" accent="lilac" onPress={…}>Buy</Button>
//   <IconAvatar variant="soft"><Glyph/></IconAvatar>
//   <Topbar><Topbar.Leading>…</Topbar.Leading><Topbar.Center>…</Topbar.Center>…</Topbar>
export const Button = createNuriComponent(compositionButtonDescriptor, 'Button');
export const IconAvatar = createNuriComponent(iconAvatarDescriptor, 'IconAvatar');

// Topbar is the catalog's first COMPOUND component (the slot-based action bar):
// the factory attaches one typed region sub-component (the runtime is generic ·
// derived from the anatomy's `view` regions). The cast is the typed VIEW of that
// generic attachment — `Topbar.Leading/Center/Trailing` ↔ the web sub-elements.
// Bare children of <Topbar> default to the trailing region (the "just actions" case).
type TopbarSlots = { Leading: NuriSlot; Center: NuriSlot; Trailing: NuriSlot };
const TopbarBase = createNuriComponent(topbarDescriptor, 'Topbar');
export const Topbar = TopbarBase as typeof TopbarBase & TopbarSlots;
// The icon-anchored control (P11 · the first contract bump): bare = the round
// icon action; flanked = `<IconButton prefix="Buy Bitcoin" icon={<Glyph/>}
// suffix="Pay" />` (the prefix/suffix text flanks · the new Part vocab).
export const IconButton = createNuriComponent(iconButtonDescriptor, 'IconButton');
