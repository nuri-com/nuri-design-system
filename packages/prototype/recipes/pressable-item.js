/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · PRESSABLE-ITEM · CUSTOM ELEMENT
 *
 * <nuri-pressable-item> is the row-action foundation: a pressable root with
 * generated composition slots for a leading glyph avatar, content text, optional
 * trailing value stack, and a trailing icon. Separators and grouping are owned by
 * the page/list composition, not this row.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { pressableItemDescriptor } from '../generated/descriptors/pressable-item.js';
import '../primitives/pressable.js';
import '../primitives/view.js';
import '../primitives/typography.js';
import '../primitives/icon.js';

defineNuriComponent(pressableItemDescriptor, nuriNames('pressable-item').web);
