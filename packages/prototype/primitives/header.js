/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · HEADER · CUSTOM ELEMENT
 * <nuri-header> mirrors RN <Header>: a fixed top region that resolves
 * box/stack/palette attrs and reports its measured block size to the local
 * screen or sheet scope for sibling <nuri-scroll> content padding.
 * ────────────────────────────────────────────────────────────── */

import { mergeAttrs } from '../factory/factory.js';

const BOX_ATTRS = ['padding-x', 'padding-y', 'padding-top', 'padding-bottom'];
const STACK_ATTRS = ['direction', 'align', 'justify', 'gap'];
const PALETTE_ATTRS = ['chrome'];
const ATTRS = [
  'as',
  'safe-area-top',
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
  #resizeObserver = null;
  #scope = null;

  connectedCallback() {
    if (!this.#inner) {
      this.#replaceInner((this.getAttribute('as') || 'div').toLowerCase());
    }
    if (typeof ResizeObserver === 'function') {
      this.#resizeObserver = new ResizeObserver(() => this.#measure());
      this.#resizeObserver.observe(this.#inner);
    }
    this.#sync();
    queueMicrotask(() => this.#measure());
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#setScopeVar(this.#scope, 0);
    this.#scope = null;
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this.#inner) return;
    if (name === 'as') {
      const desired = (newValue || 'div').toLowerCase();
      if (desired !== this.#innerTag) this.#replaceInner(desired);
    }
    this.#sync();
    this.#measure();
  }

  refreshRegionLayout() {
    this.#measure();
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

  #nearestScope() {
    return this.closest('.nuri-screen, nuri-modal-panel, nuri-bottom-sheet-panel');
  }

  #setScopeVar(scope, px) {
    scope?.style.setProperty('--nuri-fixed-header-block', `${px}px`);
  }

  #measure() {
    const nextScope = this.#nearestScope();
    if (this.#scope && this.#scope !== nextScope) this.#setScopeVar(this.#scope, 0);
    this.#scope = nextScope;
    this.#setScopeVar(nextScope, Math.round(this.#inner?.getBoundingClientRect().height ?? 0));
  }
}

if (!customElements.get('nuri-header')) customElements.define('nuri-header', NuriHeader);
