/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BOTTOM SHEET · STATIC WEB STRUCTURAL ELEMENTS
 *
 * The web/prototype sheet is a static mock surface. It mirrors the authored
 * composition shape expected by RN, but intentionally has no gestures,
 * dismissal, snap runtime, or engine-specific API.
 * ────────────────────────────────────────────────────────────── */

import { bottomSheetChrome } from '../generated/bottom-sheet-chrome.js';
import '../primitives/view.js';
import '../primitives/header.js';
import '../primitives/scroll.js';
import '../primitives/footer.js';
import './bottom-sheet-panel.js';
import './topbar.js';

const WEB_SCRIM = {
  transparent: 'transparent',
  'blackAlpha.7': 'var(--nuri-color-black-alpha-7)',
};

class NuriBottomSheet extends HTMLElement {
  connectedCallback() {
    this.style.setProperty('--nuri-bottom-sheet-scrim-none', WEB_SCRIM[bottomSheetChrome.scrim.none]);
    this.style.setProperty('--nuri-bottom-sheet-scrim-dim', WEB_SCRIM[bottomSheetChrome.scrim.dim]);
  }
}

function defineOnce(tagName, element) {
  if (!customElements.get(tagName)) customElements.define(tagName, element);
}

defineOnce('nuri-bottom-sheet', NuriBottomSheet);
