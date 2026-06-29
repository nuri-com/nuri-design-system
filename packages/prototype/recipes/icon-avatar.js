/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-AVATAR · CUSTOM ELEMENT (factory-backed · decision 65/74 · N+50)
 *
 * <nuri-icon-avatar> is a single GENERIC registration over the web factory:
 * observedAttributes (name · variant · accent), the attr → selection read, the
 * routed glyph `name`, the public default (variant=soft · from the descriptor ·
 * R1.5), the DECORATIVE aria-hidden (decision 50 · from descriptor.decorative,
 * not a hand attr), and the de-collapsed mount — all DERIVED by defineNuriComponent
 * from the FROZEN icon-avatar descriptor (build/descriptors/icon-avatar.js · the
 * authored SoT · decision 69). The hand `HTMLElement` wrapper class RETIRED at
 * N+50 (the web twin of RN's createNuriComponent).
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades
 * into — view.js (the static <nuri-view> host) + icon.js (the glyph) — and link
 * the namespace CSS (box/stack/palette). factory.js + the descriptor twin arrive
 * via this module's imports.
 *
 * Public API UNCHANGED — <nuri-icon-avatar name variant accent></nuri-icon-avatar>:
 *   variant → "soft" (default) | "solid" | "ghost" | "subtle"   · size LOCKED (lg circle / md glyph)
 *   accent  → Tier-2 self-scope (threaded as a prop · data-accent on the merged node)
 *   the host is aria-hidden (decorative · decision 50), not focusable, carries no role.
 *
 * KNOWN GAP (the post-A3 icon arc · NOT fixed here · first-bump backlog): the recipe's
 * `fill` attribute (the filled glyph weight) is NOT threaded — the factory's renderIcon
 * emits only the routed glyph NAME. No active page (button.html) uses `fill`.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent } from '../factory/factory.js';
import { iconAvatarDescriptor } from '../generated/descriptors/icon-avatar.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent).
import '../primitives/view.js';
import '../primitives/icon.js';

defineNuriComponent(iconAvatarDescriptor, 'nuri-icon-avatar');
