/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SWITCH · WEB TWIN
 *
 * <nuri-switch> is the binary setting toggle: a stateless generic-factory
 * registration over the authored descriptor. The `checked` boolean attribute
 * drives the internal on/off axis (present = on); the consumer owns the value
 * and flips the attribute on click. One role="switch" button, no nested control.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { switchDescriptor } from '../generated/descriptors/switch.js';
import '../primitives/pressable.js';
import '../primitives/view.js';

defineNuriComponent(switchDescriptor, nuriNames('switch').web);
