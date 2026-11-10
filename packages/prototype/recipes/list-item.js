/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-ITEM · CUSTOM ELEMENT
 *
 * <nuri-list-item> is the list family's read-only row (#240): a static view
 * root with generated composition slots for the muted label, the value and the
 * muted suffix on the value's line, rendered in authored order. It is not a
 * control: no button, role, focus or press wash. Separators and grouping are
 * sibling composition, not row anatomy.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { listItemDescriptor } from '../generated/descriptors/list-item.js';
import '../primitives/view.js';
import '../primitives/typography.js';

defineNuriComponent(listItemDescriptor, nuriNames('list-item').web);
