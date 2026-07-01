/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-BUTTON · CUSTOM ELEMENT (factory-backed · decision 65/74 · P11)
 *
 * <nuri-icon-button> is a single GENERIC registration over the web factory — the
 * conventional icon-ONLY glyph circle: a lone `icon` part, so defineNuriComponent
 * routes the ergonomic `icon` attribute (the same-name shorthand · a scalar
 * icon-name) into it, on top of the usual axes (variant · size · accent ·
 * disabled) and the aria-label a11y name — all from the FROZEN icon-button
 * descriptor (generated/descriptors/icon-button.js · the authored SoT · decision
 * 69). Zero hand code. (The anchored mid-text lockup relocated to composable
 * Button · Path C Phase 4 · docs/component-api-target.md.)
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades
 * into — pressable.js (the interactive host) + icon.js (the glyph) — and link the
 * namespace CSS (box/stack/palette/interactive). factory.js + the descriptor twin
 * arrive via this module's imports.
 *
 * Public API — <nuri-icon-button icon="x" variant size accent aria-label>:
 *   icon    → the glyph NAME (the whole control · required)
 *   variant → "soft" (default) | "solid" | "ghost"   · size → "md" (default) | "sm" | "lg"
 *   accent  → Tier-2 self-scope (threaded as a prop · data-accent on the merged node)
 *   aria-label → the accessible name (icon-only · there is no visible text to name it).
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { iconButtonDescriptor } from '../generated/descriptors/icon-button.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent ·
// each primitive guards its own define): the interactive host + the glyph.
import '../primitives/pressable.js';
import '../primitives/icon.js';

// Public name == source (`icon-button`) — the tag is DERIVED, never hand-authored.
defineNuriComponent(iconButtonDescriptor, nuriNames('icon-button').web);
