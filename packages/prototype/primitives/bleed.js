/* ──────────────────────────────────────────────────────────────
 * NURI · LAYOUT ELEMENT · BLEED · CUSTOM ELEMENT
 *
 * Controlled negative space, mechanically paired with RN <Bleed>. The four
 * public attrs are bucketed through the factory's mergeAttrs path; the
 * generated bleed namespace CSS resolves their values from the space scale.
 * Lift and containment are structural rules in styles/bleed.css, not attrs.
 * ────────────────────────────────────────────────────────────── */

import { mergeAttrs } from '../factory/factory.js';

const ATTRS = ['top', 'bottom', 'x', 'y'];
const MANAGED_DATA = ATTRS.map((attr) => `data-${attr}`);

export function assertBleedChildren(host) {
  const meaningful = [...host.childNodes].filter(
    (node) => node.nodeType !== Node.COMMENT_NODE &&
      !(node.nodeType === Node.TEXT_NODE && !node.textContent.trim()),
  );
  if (meaningful.length !== 1 || meaningful[0].nodeType !== Node.ELEMENT_NODE) {
    throw new Error(`<nuri-bleed> expects exactly one child; received ${meaningful.length}.`);
  }
}

class NuriBleed extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  #observer = null;

  connectedCallback() {
    this.#sync();
    this.#assertOneChild();
    this.#observer = new MutationObserver(() => this.#assertOneChild());
    this.#observer.observe(this, { childList: true });
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#sync();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #sync() {
    const bleed = {};
    for (const attr of ATTRS) {
      if (this.hasAttribute(attr)) bleed[attr] = this.getAttribute(attr);
    }
    const { classes, data } = mergeAttrs({ bleed });
    this.classList.add(...classes);
    for (const key of MANAGED_DATA) {
      if (key in data) this.setAttribute(key, data[key]);
      else this.removeAttribute(key);
    }
  }

  #assertOneChild() {
    assertBleedChildren(this);
  }
}

if (!customElements.get('nuri-bleed')) customElements.define('nuri-bleed', NuriBleed);
