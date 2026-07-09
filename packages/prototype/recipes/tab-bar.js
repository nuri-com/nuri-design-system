/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR · CUSTOM ELEMENT (factory-backed · the OPEN container)
 *
 * <nuri-tab-bar> is the bottom navigation BAR — a DUMB layout container. A single
 * GENERIC registration over the web factory: defineNuriComponent derives the
 * element from the FROZEN tab-bar descriptor (the authored SoT · decision 69). The
 * bar is an OPEN root (NOT compound): it renders its POSITIONAL <nuri-tab-bar-item>
 * children directly as EQUAL columns (each item's `fill:'even'` equalizes them). NO
 * `value`, NO state, NO derivation — the consumer holds `active` and passes
 * `selected` + the press handler down to each item.
 *
 * Public API — composition via positional <nuri-tab-bar-item> children:
 *   <nuri-tab-bar>
 *     <nuri-tab-bar-item selected aria-label="Wallet">
 *       <nuri-tab-bar-item-icon name="card"></nuri-tab-bar-item-icon>
 *       <nuri-tab-bar-item-label>Wallet</nuri-tab-bar-item-label>
 *     </nuri-tab-bar-item>
 *   </nuri-tab-bar>
 *
 * The page MUST link the namespace CSS (box/stack/palette) the bar's merged node +
 * the items use; <nuri-tab-bar-item> arrives via its own recipe (self-imported below).
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { tabBarDescriptor } from '../generated/descriptors/tab-bar.js';

// Public name == source (`tab-bar`) — the tag is DERIVED, never hand-authored.
defineNuriComponent(tabBarDescriptor, nuriNames('tab-bar').web);

// The OPEN parent must upgrade before its item children. Otherwise existing
// markup lets <nuri-tab-bar-item> render first, then the parent captures the
// already-rendered tree as positional content and cloned items render again.
await import('./tab-bar-item.js');
