/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · FOOTER · CUSTOM ELEMENT
 * <nuri-footer> mirrors RN <Footer>: an intrinsic structural bottom region that
 * resolves box/stack/palette attrs in the host's normal flex flow.
 * ────────────────────────────────────────────────────────────── */

import { mergeAttrs } from '../factory/factory.js';

const BOX_ATTRS = ['padding-x', 'padding-y', 'padding-top', 'padding-bottom'];
const STACK_ATTRS = ['direction', 'align', 'justify', 'gap'];
const PALETTE_ATTRS = ['chrome'];
const ATTRS = [
  'as',
  'safe-area-bottom',
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
const MANAGED_DATA = [
  ...BOX_ATTRS.map((a) => `data-${a}`),
  ...STACK_ATTRS.map((a) => `data-${a}`),
  'data-chrome',
];

function spaceVar(value) {
  return value ? `var(--nuri-space-${value})` : '0px';
}

class NuriFooter extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  #inner = null;
  #innerTag = null;

  connectedCallback() {
      // Screen scaffolding / gesture-owning elements are not valid <nuri-bleed>
      // band content (the hit-transparency contract · the Bleed doc) — fail
      // named, mirroring the RN useAssertNotBandContent guard.
      if (this.closest('nuri-bleed')) {
        throw new Error('[nuri] <nuri-footer> is not valid <nuri-bleed> band content (the hit-transparency contract).');
      }
    if (!this.#inner) {
      this.#replaceInner((this.getAttribute('as') || 'div').toLowerCase());
    }
    this.#sync();
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this.#inner) return;
    if (name === 'as') {
      const desired = (newValue || 'div').toLowerCase();
      if (desired !== this.#innerTag) this.#replaceInner(desired);
    }
    this.#sync();
  }

  #replaceInner(tag) {
    const next = document.createElement(tag);
    if (this.#inner) {
      while (this.#inner.firstChild) next.appendChild(this.#inner.firstChild);
      this.#inner.replaceWith(next);
    } else {
      while (this.firstChild) next.appendChild(this.firstChild);
      this.appendChild(next);
    }
    this.#inner = next;
    this.#innerTag = tag;
  }

  #sync() {
    const { classes, data } = mergeAttrs(this.#readNS());
    this.#inner.className = ['nuri-footer', ...classes].join(' ');
    this.#inner.toggleAttribute('data-safe-area-bottom', this.hasAttribute('safe-area-bottom'));
    for (const key of MANAGED_DATA) {
      if (key in data) this.#inner.setAttribute(key, data[key]);
      else this.#inner.removeAttribute(key);
    }

    if (this.hasAttribute('safe-area-bottom')) {
      const authored = this.getAttribute('padding-bottom') ?? this.getAttribute('padding-y');
      this.#inner.style.paddingBlockEnd = `calc(${spaceVar(authored)} + var(--nuri-device-safe-area-bottom, 0px))`;
    } else {
      this.#inner.style.removeProperty('padding-block-end');
    }
  }

  #readNS() {
    const ns = {};
    const box = {};
    for (const attr of BOX_ATTRS) if (this.hasAttribute(attr)) box[attr] = this.getAttribute(attr);
    if (Object.keys(box).length) ns.box = box;

    const stack = {};
    for (const attr of STACK_ATTRS) if (this.hasAttribute(attr)) stack[attr] = this.getAttribute(attr);
    if (Object.keys(stack).length) ns.stack = stack;

    const palette = {};
    for (const attr of PALETTE_ATTRS) if (this.hasAttribute(attr)) palette[attr] = this.getAttribute(attr);
    if (Object.keys(palette).length) ns.palette = palette;

    return ns;
  }
}

if (!customElements.get('nuri-footer')) customElements.define('nuri-footer', NuriFooter);
