/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON · CUSTOM ELEMENT
 * <nuri-icon name size> renders an inline SVG glyph from the
 * generated registry (icons.js · the SoT folder icons/*.svg ·
 * decision 38 · N+51). The element is a thin Nuri facade over the
 * registry — the first registry-based JS dispatch in Nuri
 * (decision 38 · N+6.3), a complement to the attribute-dispatch
 * pattern Stack/Box use for the `size` prop (decision 37 · N+6.2).
 *
 * Props (observed attributes)
 *   name   (required)  registry key · kebab-case · warns if unknown
 *   size   "md" | "sm"  default "md"
 *
 * One drawing per glyph · NO weights (the regular/bold/fill coupling
 * RETIRED at N+51). The model is now "one .svg = one glyph"; SIZE rides
 * the SHARED box axis (N+51 · the icon-arc close · NOT a bespoke
 * .nuri-icon[data-size] rule): the element maps its public `size` to a
 * `size`-scale leaf and applies `nuri-box` + `data-width`/`data-height`,
 * so box.css sizes it (inline-size/block-size). NAMING OFFSET — the
 * icon's `md` ↔ the `sm` size leaf (24px) · `sm` ↔ the `xs` leaf (18px):
 *   md → box width/height "sm" (--nuri-size-sm · 24)   default
 *   sm → box width/height "xs" (--nuri-size-xs · 18)
 * A HOST (the web factory · icon-avatar) may pin the box itself by
 * pre-setting data-width/data-height from the descriptor; the element
 * RESPECTS that and only self-derives when it carries its own `size`
 * prop or no host box has been applied.
 *
 * Colour is currentColor only — the icon inherits its parent's text
 * colour. No tone/accent/color prop (decision 38).
 *
 * Loaded as an ES module (`<script type="module">`), so it imports
 * the registry and is deferred by default — connectedCallback fires
 * after children parse (AGENTS.md custom-element rule).
 * ────────────────────────────────────────────────────────────── */

// icons.js (the glyph registry · the Slice-6 data) STAYS in @nuri/spec — the pipeline
// GENERATES it from the icons/*.svg folder and the same data feeds build/icons.ts (one
// registry, two readers · decision 48). The web icon registry is this prototype
// projection's OWN generated output now (N+62 · decision 80 · was @nuri/spec's).
import {
  ICONS,
  ICON_MOTION,
  ICON_MOTION_DURATION_MS,
} from '../generated/icons.js';

const ATTRS = ['name', 'size'];

const MOTION_MARKUP = {
  ring: '<span class="nuri-spinner nuri-spinner--ring" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
  ripple: '<span class="nuri-spinner nuri-spinner--ripple" aria-hidden="true"><i></i><i></i></span>',
  quarter: '<span class="nuri-spinner nuri-spinner--ripple nuri-spinner--quarter" aria-hidden="true"><i></i><i></i><i></i></span>',
};

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

    this.classList.add('nuri-icon');

    // Size via the SHARED box axis (N+51): map the public `size` to a size-scale
    // leaf (offset · md→sm · sm→xs) and apply nuri-box + data-width/data-height so
    // box.css sizes the glyph. RESPECT a host-pinned box (the factory's icon-avatar
    // path sets data-width/data-height from the descriptor with NO `size` attr) —
    // only self-derive when this element carries its own `size` prop or no box is
    // present yet (the standalone path · the md default is stable so the no-attr
    // re-render keeps the same leaf).
    if (this.hasAttribute('size') || !this.dataset.width) {
      const leaf = size === 'sm' ? 'xs' : 'sm';
      this.classList.add('nuri-box');
      this.dataset.width = leaf;
      this.dataset.height = leaf;
    }

    const markup = name && ICONS[name];
    if (!markup) {
      console.warn(`[NuriIcon] unknown name "${name}"`);
      delete this.dataset.motion;
      this.style.removeProperty('--spinner-duration');
      this.innerHTML = '';
      return;
    }

    const motion = ICON_MOTION[name];
    if (motion) {
      this.dataset.motion = motion;
      this.style.setProperty('--spinner-duration', `${ICON_MOTION_DURATION_MS[motion]}ms`);
    } else {
      delete this.dataset.motion;
      this.style.removeProperty('--spinner-duration');
    }

    const staticGlyph =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" ` +
      `fill="currentColor" aria-hidden="true" focusable="false">${markup}</svg>`;
    this.innerHTML = motion
      ? `${MOTION_MARKUP[motion]}<span class="nuri-spinner-static">${staticGlyph}</span>`
      : staticGlyph;
  }
}

customElements.define('nuri-icon', NuriIcon);
