/* NURI · MODAL · static web structural element */
import { bottomSheetChrome } from '../generated/bottom-sheet-chrome.js';
import '../primitives/view.js';
import '../primitives/header.js';
import '../primitives/scroll.js';
import '../primitives/footer.js';
import './modal-panel.js';
import './topbar.js';

const WEB_SCRIM = {
  transparent: 'transparent',
  'blackAlpha.7': 'var(--nuri-color-black-alpha-7)',
};

export class NuriModal extends HTMLElement {
  static get observedAttributes() {
    return ['mode'];
  }

  connectedCallback() {
    this.style.setProperty('--nuri-modal-scrim-none', WEB_SCRIM[bottomSheetChrome.scrim.none]);
    this.style.setProperty('--nuri-modal-scrim-dim', WEB_SCRIM[bottomSheetChrome.scrim.dim]);
    queueMicrotask(() => this.syncPanelMode());
  }

  attributeChangedCallback() {
    this.syncPanelMode();
  }

  syncPanelMode() {
    const mode = this.getAttribute('mode') === 'full' ? 'full' : 'sheet';
    const panel = this.querySelector(':scope > nuri-modal-panel');
    panel?.setAttribute('mode', mode);
  }
}

if (!customElements.get('nuri-modal')) customElements.define('nuri-modal', NuriModal);
