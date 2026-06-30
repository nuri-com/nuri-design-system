/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR · CUSTOM ELEMENT (factory-backed · the OPEN container)
 *
 * <nuri-tab-bar> is the bottom navigation BAR — a DUMB layout container. A single
 * GENERIC registration over the web factory: defineNuriComponent derives the
 * element from the FROZEN tab-bar descriptor (the authored SoT · decision 69). The
 * bar is an OPEN root (NOT compound): it renders its POSITIONAL <nuri-tab> children
 * directly as EQUAL columns (each Tab's `fill:'even'` equalizes them). NO `value`,
 * NO state, NO derivation — the consumer holds `active` and passes `selected` +
 * the press handler down to each item.
 *
 * Public API — composition via positional <nuri-tab> children:
 *   <nuri-tab-bar>
 *     <nuri-tab icon="card"    label="Wallet" selected></nuri-tab>
 *     <nuri-tab icon="bitcoin" label="Coin"></nuri-tab>
 *     <nuri-tab icon="euro"    label="Cash"></nuri-tab>
 *   </nuri-tab-bar>
 *
 * The page MUST link the namespace CSS (box/stack/palette) the bar's merged node +
 * the items use; <nuri-tab> arrives via its own recipe (self-imported below).
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent } from '../factory/factory.js';
import { tabBarDescriptor } from '../generated/descriptors/tab-bar.js';
// The bar renders its <nuri-tab> children — pull in the item recipe (idempotent
// define-guard) so a page that links only tab-bar.js still gets the item element.
import './tab.js';

defineNuriComponent(tabBarDescriptor, 'nuri-tab-bar');
