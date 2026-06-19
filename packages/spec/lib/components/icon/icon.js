/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON · CUSTOM ELEMENT
 * <nuri-icon name size fill> renders an inline SVG from the
 * hand-curated phosphor registry (icons.js). The element is a thin
 * Nuri facade over the registry — the first registry-based JS
 * dispatch in Nuri (decision 38 · N+6.3), a complement to the
 * attribute-dispatch pattern Stack/Box use for the `size` prop
 * (decision 37 · N+6.2).
 *
 * Props (observed attributes)
 *   name   (required)  registry key · kebab-case · warns if unknown
 *   size   "md" | "sm"  default "md" — mirrored to data-size for CSS
 *   fill   boolean       presence forces the fill weight
 *
 * Weight coupling (decision 38) — NOT a per-call prop:
 *   md  + no fill  → regular
 *   sm  + no fill  → bold
 *   any + fill     → fill
 *
 * Colour is currentColor only — the icon inherits its parent's
 * text colour. No tone/accent/color prop (decision 38).
 *
 * Loaded as an ES module (`<script type="module">`), so it imports
 * the registry and is deferred by default — connectedCallback fires
 * after children parse (AGENTS.md custom-element rule).
 * ────────────────────────────────────────────────────────────── */

import { ICONS } from './icons.js';

const ATTRS = ['name', 'size', 'fill'];

class NuriIcon extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const name = this.getAttribute('name');
    const size = this.getAttribute('size') === 'sm' ? 'sm' : 'md';
    const fill = this.hasAttribute('fill');

    // Mirror size to data-size on the host so icon.css dispatches the
    // box dimensions via attribute selector (decision 37 co-pattern).
    this.dataset.size = size;
    this.classList.add('nuri-icon');

    const entry = name && ICONS[name];
    if (!entry) {
      console.warn(`[NuriIcon] unknown name "${name}"`);
      this.innerHTML = '';
      return;
    }

    // Weight coupling per decision 38.
    const weight = fill ? 'fill' : size === 'sm' ? 'bold' : 'regular';
    const path = entry[weight];

    this.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" ` +
      `fill="currentColor" aria-hidden="true" focusable="false">${path}</svg>`;
  }
}

customElements.define('nuri-icon', NuriIcon);
