/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BUTTON · CUSTOM ELEMENT (factory-backed · decision 65/74 · N+50)
 *
 * <nuri-button> is a single GENERIC registration over the web factory: every-
 * thing — observedAttributes (variant · size · accent · disabled), the attr →
 * selection read, the label capture, the public defaults (variant=soft · size=md
 * · from the descriptor · R1.5), the de-collapsed `nuri-*` mount — is DERIVED
 * by defineNuriComponent from the FROZEN button descriptor (generated/
 * descriptors/button.js · the authored SoT · decision 69). The hand
 * `HTMLElement` wrapper class RETIRED at N+50 (the web twin of RN's
 * descriptor renderer · "adding a component = adding data in spec").
 *
 * The page MUST also load the primitive element scripts the factory tree upgrades
 * into (pressable.js + typography.js · self-imported below · idempotent define-
 * guards) and link factory/reset.css (the native-<button> UA normalization).
 * factory.js + the descriptor twin arrive via this module's imports.
 *
 * Public API UNCHANGED — <nuri-button variant size accent disabled>Label</nuri-button>:
 *   variant → "soft" (default) | "solid" | "ghost"     · size → "md" (default) | "sm" | "lg"
 *   accent  → inherited from the cascade unless set (Tier-2 self-scope · threaded as a prop)
 *   disabled → reflected to the factory's interactive host (interactive.css dims + de-presses)
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { buttonDescriptor } from '../generated/descriptors/button.js';
// Self-import the primitive element defs the factory tree upgrades into (idempotent ·
// each primitive guards its own define · a page's classic <script> tag coexists). So a
// page only needs to load THIS module + link the namespace CSS — no separate primitive
// <script> tags.
import '../primitives/pressable.js';
import '../primitives/typography.js';
import '../primitives/icon.js';

// The public name is `button` (the descriptor source basename · name===public) —
// the tag is DERIVED via nuriNames, never hand-authored.
defineNuriComponent(buttonDescriptor, nuriNames('button').web);
