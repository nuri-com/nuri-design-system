/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST · CUSTOM ELEMENT
 *
 * <nuri-list> is the list family's open host. It renders positional children
 * directly, so list-action, list-switch and list-item rows and list-separator
 * dividers stay siblings.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { listDescriptor } from '../generated/descriptors/list.js';
import '../primitives/view.js';
import './list-action.js';
import './list-item.js';
import '../primitives/list-separator.js';

defineNuriComponent(listDescriptor, nuriNames('list').web);
