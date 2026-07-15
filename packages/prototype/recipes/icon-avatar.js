/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-AVATAR · CUSTOM ELEMENT (factory-backed · decision 65/74 · N+50)
 *
 * <nuri-icon-avatar> is a single GENERIC registration over the web factory:
 * observedAttributes (icon · variant · accent), the attr → selection read, the
 * routed glyph via the `icon` part name (the component prop · the primitive
 * <nuri-icon> leaf carries `name`), the public default (variant=soft · from the descriptor ·
 * R1.5), the DECORATIVE aria-hidden (decision 50 · from descriptor.decorative,
 * not a hand attr), and the de-collapsed mount — all DERIVED by defineNuriComponent
 * from the FROZEN icon-avatar descriptor (build/descriptors/icon-avatar.js · the
 * authored SoT · decision 69). The hand `HTMLElement` wrapper class RETIRED at
 * N+50 (the web twin of RN's descriptor renderer).
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades
 * into — view.js (the static <nuri-view> host) + icon.js (the glyph) — and link
 * the namespace CSS (box/stack/palette). factory.js + the descriptor twin arrive
 * via this module's imports.
 *
 * Public API — <nuri-icon-avatar icon|source variant accent></nuri-icon-avatar>:
 *   icon    → the glyph NAME routed into the `icon` part (the component prop · the
 *             primitive <nuri-icon> leaf carries `name` · aligned across RN + web)
 *   source  → a consumer-owned image URI routed into the `image` part; fills the
 *             circle and carries its own hairline ring. Exactly one of icon/source
 *             is expected; source wins when both are present.
 *   variant → "soft" (default) | "solid" | "ghost" | "subtle" | "outline"   · size LOCKED (lg circle / md glyph)
 *   accent  → Tier-2 self-scope (threaded as a prop · data-accent on the merged node)
 *   the host is aria-hidden (decorative · decision 50), not focusable, carries no role.
 *
 * KNOWN GAP (the post-A3 icon arc · NOT fixed here · first-bump backlog): the recipe's
 * `fill` attribute (the filled glyph weight) is NOT threaded — the factory's renderIcon
 * emits only the routed glyph NAME. No active page (button.html) uses `fill`.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { iconAvatarDescriptor } from '../generated/descriptors/icon-avatar.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent).
import '../primitives/view.js';
import '../primitives/icon.js';

// Public name == source (`icon-avatar`) — the tag is DERIVED, never hand-authored.
const tagName = nuriNames('icon-avatar').web;
let warnedContentMode = false;
defineNuriComponent(iconAvatarDescriptor, tagName, {
  transformProps(props, host) {
    const hasIcon = host.hasAttribute('icon');
    const hasSource = host.hasAttribute('source');
    if (!warnedContentMode && hasIcon === hasSource) {
      warnedContentMode = true;
      console.warn(`[nuri] <${tagName}> expects exactly one of \`icon\` or \`source\`; image source wins when both are provided.`);
    }
    if (hasSource) delete props.icon;
  },
});
