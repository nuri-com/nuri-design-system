/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TOPBAR · CUSTOM ELEMENTS (factory-backed · the COMPOUND capability)
 *
 * <nuri-topbar> is the slot-based ACTION BAR — the catalog's first COMPOUND component.
 * A single GENERIC registration over the web factory: the container + the three typed
 * region sub-elements (<nuri-topbar-leading/center/trailing>) are DERIVED by
 * defineNuriComponent from the FROZEN topbar descriptor (the authored SoT · decision
 * 69), exactly like <nuri-button>. The factory's compound-component capability
 * (a sub-element per `view` region + the bare-children-→-trailing default slot)
 * generalizes the retired <nuri-topbar-content> — descriptor-driven, not hardcoded.
 *
 * The HAND RECIPE RETIRED here: the apply-NS-to-host class + the `center` attribute +
 * the lone <nuri-topbar-content> pivot are GONE. True centring is structural now —
 * the leading/trailing regions carry `stack:{fill:'even'}` (flex 1 1 0), the centre is
 * `flex:none`, so it lands dead-centre with asymmetric edges (no `center` boolean).
 *
 * Public API — composition via the region sub-elements (NEVER JSX-in-attrs):
 *   <nuri-topbar>
 *     <nuri-topbar-leading><nuri-icon-button …></nuri-topbar-leading>
 *     <nuri-topbar-center>Title</nuri-topbar-center>
 *     <nuri-topbar-trailing><nuri-button …></nuri-button></nuri-topbar-trailing>
 *   </nuri-topbar>
 *   — bare children of <nuri-topbar> (no region wrapper) default to the trailing region.
 *
 * The page MUST link the namespace CSS (box/stack/palette) the region merged-nodes use;
 * the typography primitive is self-imported (a region may hold a <nuri-typography>).
 * factory.js + the descriptor twin arrive via this module's imports.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { topbarDescriptor } from '../generated/descriptors/topbar.js';
// Self-import the typography primitive (idempotent) — a region's title is a
// <nuri-typography>; the positional buttons self-import pressable themselves.
import '../primitives/typography.js';

// Public name == source (`topbar`) — the tag is DERIVED; the factory derives the
// region slot tags (`nuri-topbar-leading/center/trailing`) from it in turn.
defineNuriComponent(topbarDescriptor, nuriNames('topbar').web);
