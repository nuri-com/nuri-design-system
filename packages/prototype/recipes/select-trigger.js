/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SELECT-TRIGGER · WEB TWIN
 *
 * A stateless generic-factory registration over the authored descriptor. The
 * root remains the only press target; consumers own dialog/open/selection state.
 * ────────────────────────────────────────────────────────────── */

import { selectTriggerDescriptor } from '../generated/descriptors/select-trigger.js';
import { defineNuriComponent, nuriNames } from '../factory/factory.js';

defineNuriComponent(selectTriggerDescriptor, nuriNames('select-trigger').web);
