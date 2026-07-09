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
  #resizeObserver;
  #mutationObserver;

  connectedCallback() {
    this.style.setProperty('--nuri-bottom-sheet-scrim-none', WEB_SCRIM[bottomSheetChrome.scrim.none]);
    this.style.setProperty('--nuri-bottom-sheet-scrim-dim', WEB_SCRIM[bottomSheetChrome.scrim.dim]);
    this.#mutationObserver = new MutationObserver(() => this.#observeRegions());
    this.#mutationObserver.observe(this, { childList: true, subtree: true });
    this.#observeRegions();
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();
  }

  #observeRegions() {
    this.#resizeObserver?.disconnect();
    if (typeof ResizeObserver === 'function') {
      this.#resizeObserver = new ResizeObserver(() => this.#syncRegionVars());
      for (const region of [
        this.querySelector('nuri-bottom-sheet-panel > nuri-bottom-sheet-topbar'),
        this.querySelector('nuri-bottom-sheet-panel > nuri-bottom-sheet-footer'),
      ]) {
        if (region) this.#resizeObserver.observe(region);
      }
    }
    this.#syncRegionVars();
  }

  #syncRegionVars() {
    const topbar = this.querySelector('nuri-bottom-sheet-panel > nuri-bottom-sheet-topbar');
    const footer = this.querySelector('nuri-bottom-sheet-panel > nuri-bottom-sheet-footer');
    this.style.setProperty('--nuri-bottom-sheet-topbar-block', `${Math.round(topbar?.getBoundingClientRect().height ?? 0)}px`);
    this.style.setProperty('--nuri-bottom-sheet-footer-block', `${Math.round(footer?.getBoundingClientRect().height ?? 0)}px`);
  }
}

class NuriBottomSheetTopbar extends HTMLElement {
  static get observedAttributes() {
    return ['accent', 'surface'];
  }

  connectedCallback() {
    this.#ensureTopbar();
    this.#syncTopbarAttrs();
  }

  attributeChangedCallback() {
    this.#syncTopbarAttrs();
  }

  #ensureTopbar() {
    if (this.firstElementChild?.tagName.toLowerCase() === 'nuri-topbar') return;
    const topbar = document.createElement('nuri-topbar');
    while (this.firstChild) topbar.append(this.firstChild);
    this.append(topbar);
  }

  #syncTopbarAttrs() {
    const topbar = this.firstElementChild?.tagName.toLowerCase() === 'nuri-topbar'
      ? this.firstElementChild
      : null;
    if (!topbar) return;
    for (const attr of NuriBottomSheetTopbar.observedAttributes) {
      const value = this.getAttribute(attr);
      if (value == null) topbar.removeAttribute(attr);
      else topbar.setAttribute(attr, value);
    }
  }
}

const FOOTER_VIEW_ATTRS = [
  'chrome',
  'direction',
  'align',
  'justify',
  'gap',
  'padding-x',
  'padding-y',
  'padding-top',
  'padding-bottom',
];

class NuriBottomSheetFooter extends HTMLElement {
  static get observedAttributes() {
    return [...FOOTER_VIEW_ATTRS, 'safe-area-bottom'];
  }

  connectedCallback() {
    this.#ensureView();
    this.#syncViewAttrs();
  }

  attributeChangedCallback() {
    this.#syncViewAttrs();
  }

  #ensureView() {
    if (this.firstElementChild?.classList.contains('nuri-bottom-sheet-footer__view')) return;
    const view = document.createElement('nuri-view');
    view.className = 'nuri-bottom-sheet-footer__view';
    while (this.firstChild) view.append(this.firstChild);
    this.append(view);
  }

  #syncViewAttrs() {
    const view = this.firstElementChild?.classList.contains('nuri-bottom-sheet-footer__view')
      ? this.firstElementChild
      : null;
    if (!view) return;
    for (const attr of FOOTER_VIEW_ATTRS) {
      const value = this.getAttribute(attr);
      if (value == null) view.removeAttribute(attr);
      else view.setAttribute(attr, value);
    }
    view.toggleAttribute('data-safe-area-bottom', this.hasAttribute('safe-area-bottom'));
    if (this.hasAttribute('safe-area-bottom')) {
      const bottom = this.getAttribute('padding-bottom') ?? this.getAttribute('padding-y');
      view.style.setProperty(
        '--nuri-bottom-sheet-footer-padding-bottom',
        bottom ? `var(--nuri-space-${bottom})` : '0px',
      );
    } else {
      view.style.removeProperty('--nuri-bottom-sheet-footer-padding-bottom');
    }
  }
}

function defineOnce(tagName, element = class extends HTMLElement {}) {
  if (!customElements.get(tagName)) customElements.define(tagName, element);
}

defineOnce('nuri-bottom-sheet', NuriBottomSheet);
defineOnce('nuri-bottom-sheet-topbar', NuriBottomSheetTopbar);
defineOnce('nuri-bottom-sheet-scroll');
defineOnce('nuri-bottom-sheet-footer', NuriBottomSheetFooter);
