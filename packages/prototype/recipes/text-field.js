/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TEXT-FIELD · CUSTOM ELEMENTS
 *
 * <nuri-text-field> is the generic web factory registration over the frozen
 * descriptor. The field input is a native <input> via <nuri-input>; the trailing
 * control slots delegate to the real <nuri-button> / <nuri-icon-button>.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { textFieldDescriptor } from '../generated/descriptors/text-field.js';
import './button.js';
import './icon-button.js';
import '../primitives/view.js';
import '../primitives/typography.js';
import '../primitives/input.js';

defineNuriComponent(textFieldDescriptor, nuriNames('text-field').web);
