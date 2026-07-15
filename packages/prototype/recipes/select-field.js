/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SELECT-FIELD · CUSTOM ELEMENT
 *
 * <nuri-select-field> is the generic web factory registration over the
 * disclosure-button descriptor. The descriptor owns its dialog-popup semantic;
 * the shared pressable binding composes label + dynamic accessibility value.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { selectFieldDescriptor } from '../generated/descriptors/select-field.js';
import './icon-avatar.js';
import '../primitives/view.js';
import '../primitives/typography.js';
import '../primitives/icon.js';

defineNuriComponent(selectFieldDescriptor, nuriNames('select-field').web);
