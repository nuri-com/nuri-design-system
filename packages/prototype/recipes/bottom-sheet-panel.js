/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BOTTOM SHEET PANEL · CUSTOM ELEMENT
 *
 * <nuri-bottom-sheet-panel> is the descriptor-backed visual sheet surface.
 * It is static on web: no gestures, no dismissal, no engine. The surrounding
 * <nuri-bottom-sheet> structural element owns mock layering and detent height.
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { bottomSheetPanelDescriptor } from '../generated/descriptors/bottom-sheet-panel.js';
import '../primitives/view.js';

defineNuriComponent(bottomSheetPanelDescriptor, nuriNames('bottom-sheet-panel').web);
