/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-BUTTON · CUSTOM ELEMENT (factory-backed · decision 65/74 · P11)
 *
 * <nuri-icon-button> is a single GENERIC registration over the web factory —
 * the FIRST descriptor with a three-part anatomy (prefix · icon · suffix), so
 * there is no lone primary part: defineNuriComponent derives the ergonomic
 * per-part attributes (prefix/icon/suffix → the content map · the icon-anchored
 * routing) on top of the usual axes (variant · size · accent · disabled) and the
 * aria-label a11y name — all from the FROZEN icon-button descriptor (generated/
 * descriptors/icon-button.js · the authored SoT · decision 69). Zero hand code.
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades
 * into — pressable.js (the interactive host) + typography.js (the flanks) +
 * icon.js (the glyph) — and link the namespace CSS (box/stack/palette/interactive).
 * factory.js + the descriptor twin arrive via this module's imports.
 *
 * Public API — <nuri-icon-button icon="x" [prefix="…"] [suffix="…"] variant size accent>:
 *   icon    → the glyph NAME (the structural centre · required)
 *   prefix  → optional leading text flank (`Buy Bitcoin 🍎`)
 *   suffix  → optional trailing text flank (`🍎 Pay`)
 *   variant → "soft" (default) | "solid" | "ghost"   · size → "md" (default) | "sm" | "lg"
 *   accent  → Tier-2 self-scope (threaded as a prop · data-accent on the merged node)
 *   aria-label → the accessible name when BARE (icon-only); flanked, the text IS the name.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { iconButtonDescriptor } from '../generated/descriptors/icon-button.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent ·
// each primitive guards its own define): the interactive host, the text flanks, the glyph.
import '../primitives/pressable.js';
import '../primitives/typography.js';
import '../primitives/icon.js';

// Public name == source (`icon-button`) — the tag is DERIVED, never hand-authored.
defineNuriComponent(iconButtonDescriptor, nuriNames('icon-button').web);
