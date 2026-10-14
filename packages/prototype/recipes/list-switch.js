/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-SWITCH · CUSTOM ELEMENT
 *
 * <nuri-list-switch> is the list row whose WHOLE row is one switch: a pressable
 * root (role="switch" · aria-checked from the `checked` attribute) with generated
 * composition slots for the content text and muted line, and a STATIC trailing
 * track + thumb that copies the <nuri-switch> look (never a nested control).
 * Separators and grouping are sibling composition, not row anatomy.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { listSwitchDescriptor } from '../generated/descriptors/list-switch.js';
import '../primitives/pressable.js';
import '../primitives/view.js';
import '../primitives/typography.js';

defineNuriComponent(listSwitchDescriptor, nuriNames('list-switch').web);
