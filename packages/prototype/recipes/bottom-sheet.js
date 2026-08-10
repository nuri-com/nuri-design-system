/* @deprecated Use <nuri-modal mode="sheet|full">. Kept for one compatibility cycle. */
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
  static get observedAttributes() {
    return ['detent'];
  }

  connectedCallback() {
    this.style.setProperty('--nuri-modal-scrim-none', WEB_SCRIM[bottomSheetChrome.scrim.none]);
    this.style.setProperty('--nuri-modal-scrim-dim', WEB_SCRIM[bottomSheetChrome.scrim.dim]);
    queueMicrotask(() => this.syncLegacyMode());
  }

  attributeChangedCallback() {
    this.syncLegacyMode();
  }

  syncLegacyMode() {
    const mode = this.getAttribute('detent') === 'full' ? 'full' : 'sheet';
    this.setAttribute('mode', mode);
    const panel = this.querySelector(':scope > nuri-bottom-sheet-panel');
    panel?.setAttribute('mode', mode);
  }
}

if (!customElements.get('nuri-bottom-sheet')) customElements.define('nuri-bottom-sheet', NuriBottomSheet);
