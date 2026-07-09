/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR-ITEM · CUSTOM ELEMENT (factory-backed · the bottom-bar ITEM)
 *
 * <nuri-tab-bar-item> is the bottom-bar ITEM — icon-over-label, presentation only
 * (public name `tab-bar-item` · the descriptor source basename · name===public ·
 * 1:1 with RN `TabBarItem`). A single GENERIC registration over the web factory:
 * defineNuriComponent derives the element from the FROZEN tab-bar-item descriptor
 * (the authored SoT · decision 69), exactly like <nuri-button>. The DS is DUMB — it
 * renders an item that LOOKS selected or not and fires its native press; it knows
 * nothing about which destination is active.
 *
 * Public API (generated component slots + the appearance boolean):
 *   <nuri-tab-bar-item selected aria-label="Wallet">
 *     <nuri-tab-bar-item-icon name="card"></nuri-tab-bar-item-icon>
 *     <nuri-tab-bar-item-label>Wallet</nuri-tab-bar-item-label>
 *   </nuri-tab-bar-item>
 *   — `selected` drives the `state` appearance axis (present = the ghost/text-primary
 *     look · absent = the subtle/border-strong receded look · the factory's
 *     boolean→axis bridge). pressScale only (no bg change).
 *
 * The page MUST link the namespace CSS (box/stack/palette) the item's merged node
 * uses; the icon + typography primitives are self-imported below.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { tabBarItemDescriptor } from '../generated/descriptors/tab-bar-item.js';
// Self-import the leaf primitives (idempotent) — the item renders a <nuri-icon>
// glyph over a <nuri-typography> label.
import '../primitives/icon.js';
import '../primitives/typography.js';

// The public name is `tab-bar-item` (the descriptor source basename · name===public)
// — the tag DERIVES to `nuri-tab-bar-item` via nuriNames, never hand-authored.
// (1:1 with RN `TabBarItem`.)
defineNuriComponent(tabBarItemDescriptor, nuriNames('tab-bar-item').web);
