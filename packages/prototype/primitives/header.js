/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · HEADER · CUSTOM ELEMENT
 * <nuri-header> mirrors RN <Header>: an intrinsic structural top region that
 * resolves box/stack/palette attrs in the host's normal flex flow.
 * ────────────────────────────────────────────────────────────── */

import { mergeAttrs } from '../factory/factory.js';

const BOX_ATTRS = ['padding-x', 'padding-y', 'padding-top', 'padding-bottom'];
const STACK_ATTRS = ['direction', 'align', 'justify', 'gap'];
const PALETTE_ATTRS = ['chrome'];
const ATTRS = [
  'as',
  'safe-area-top',
  'safe-area-chrome',
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

class NuriHeader extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  #inner = null;
  #innerTag = null;
  #safeAreaChrome = null;

  connectedCallback() {
      // Screen scaffolding / gesture-owning elements are not valid <nuri-bleed>
      // band content (the hit-transparency contract · the Bleed doc) — fail
      // named, mirroring the RN useAssertNotBandContent guard.
      if (this.closest('nuri-bleed')) {
        throw new Error('[nuri] <nuri-header> is not valid <nuri-bleed> band content (the hit-transparency contract).');
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
    this.#inner.className = ['nuri-header', ...classes].join(' ');
    this.#inner.toggleAttribute('data-safe-area-top', this.hasAttribute('safe-area-top'));
    for (const key of MANAGED_DATA) {
      if (key in data) this.#inner.setAttribute(key, data[key]);
      else this.#inner.removeAttribute(key);
    }

    const safeAreaChrome = this.getAttribute('safe-area-chrome');
    if (safeAreaChrome && this.hasAttribute('safe-area-top')) {
      if (!this.#safeAreaChrome) {
        this.#safeAreaChrome = document.createElement('span');
        this.#safeAreaChrome.setAttribute('aria-hidden', 'true');
        this.#inner.prepend(this.#safeAreaChrome);
      }
      const safeAreaSurface = mergeAttrs({ palette: { chrome: safeAreaChrome } });
      this.#safeAreaChrome.className = ['nuri-header__safe-area-chrome', ...safeAreaSurface.classes].join(' ');
      for (const attr of ['data-variant', 'data-accent', 'data-muted', 'data-chrome']) {
        if (attr in safeAreaSurface.data) this.#safeAreaChrome.setAttribute(attr, safeAreaSurface.data[attr]);
        else this.#safeAreaChrome.removeAttribute(attr);
      }
    } else if (this.#safeAreaChrome) {
      this.#safeAreaChrome.remove();
      this.#safeAreaChrome = null;
    }

    if (this.hasAttribute('safe-area-top')) {
      const authored = this.getAttribute('padding-top') ?? this.getAttribute('padding-y');
      this.#inner.style.paddingBlockStart = `calc(${spaceVar(authored)} + var(--nuri-device-safe-area-top, 0px))`;
    } else {
      this.#inner.style.removeProperty('padding-block-start');
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

if (!customElements.get('nuri-header')) customElements.define('nuri-header', NuriHeader);
