/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB · CUSTOM ELEMENT (factory-backed · the bottom-bar ITEM)
 *
 * <nuri-tab> is the bottom-bar ITEM (TabBar.Item) — icon-over-label, presentation
 * only. A single GENERIC registration over the web factory: defineNuriComponent
 * derives the element from the FROZEN tab descriptor (the authored SoT · decision
 * 69), exactly like <nuri-button>. The DS is DUMB — it renders an item that LOOKS
 * selected or not and fires its native press; it knows nothing about which
 * destination is active.
 *
 * Public API (the ergonomic per-part attrs + the appearance boolean):
 *   <nuri-tab icon="card" label="Wallet" selected></nuri-tab>
 *   — `icon` routes the register glyph · `label` the destination name · the
 *     `selected` boolean ATTR drives the `state` appearance axis (present = the
 *     ghost/text-primary look · absent = the subtle/border-strong receded look ·
 *     the factory's boolean→axis bridge). pressScale only (no bg change).
 *
 * The page MUST link the namespace CSS (box/stack/palette) the item's merged node
 * uses; the icon + typography primitives are self-imported below.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent } from '../factory/factory.js';
import { tabDescriptor } from '../generated/descriptors/tab.js';
// Self-import the leaf primitives (idempotent) — the item renders a <nuri-icon>
// glyph over a <nuri-typography> label.
import '../primitives/icon.js';
import '../primitives/typography.js';

defineNuriComponent(tabDescriptor, 'nuri-tab');
