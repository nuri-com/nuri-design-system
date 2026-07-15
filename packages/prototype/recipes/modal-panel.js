/* NURI · MODAL PANEL · descriptor-backed blocking surface */
import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { modalPanelDescriptor } from '../generated/descriptors/modal-panel.js';
import '../primitives/view.js';

defineNuriComponent(modalPanelDescriptor, nuriNames('modal-panel').web);
