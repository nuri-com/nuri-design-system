/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · BOX · CUSTOM ELEMENT
 * <nuri-box> mirrors the RN-side Box API shape (padding/center/as)
 * while delegating to a host element (default <div>; `as` attr
 * overrides) for the actual block layout.
 *
 * No component-token aliasing per decision 37 · N+6.2 — the prop
 * values pass straight through to `data-*` attrs that the CSS
 * dispatches on via attribute selectors in @layer rules.
 *
 * Markup
 *   <nuri-box padding="md">…</nuri-box>
 *   <nuri-box padding-x="lg" padding-y="sm">…</nuri-box>
 *   <nuri-box padding-start="md">…</nuri-box>                       RTL-aware
 *   <nuri-box padding="md" center>…</nuri-box>                      inline-centered
 *   <nuri-box padding="lg" fill>…</nuri-box>                        fills a flex parent
 *   <nuri-box width="lg" height="lg">…</nuri-box>                   sized box (geometry)
 *   <nuri-box as="article" padding="lg">…</nuri-box>
 *
 * Defaults
 *   all padding props → unset (no padding)
 *   width/height/min-height → unset (host-natural size)
 *   center            → false
 *   fill              → false  (decision 60 · grow to fill a flex parent's
 *                               main axis as a flex column · e.g. a Scroll body)
 *   as                → "div"
 * ────────────────────────────────────────────────────────────── */

(() => {
  // Web custom-element attribute names use kebab-case; mapped 1:1
  // to data-* attrs on the inner host (no camelCase rewrite needed —
  // padding-x stays padding-x).
  const ATTRS = [
    'padding',
    'padding-x',
    'padding-y',
    'padding-start',
    'padding-end',
    'padding-top',
    'padding-bottom',
    'background',
    'radius',
    'width',
    'height',
    'min-height',
    'center',
    'fill',
    'as',
  ];

  // Enum membership for the visual props (decision 42 · N+6.5). Unlike
  // padding (which silently no-ops on a bad leaf because the CSS just
  // fails to match), background/radius warn loudly — they're a small
  // closed set and a typo there is almost always a mistake worth
  // surfacing. The value is still mirrored to data-* either way; an
  // unmatched value simply produces no rule.
  const BACKGROUNDS = ['canvas', 'subtle', 'strong', 'accent-solid', 'accent-subtle'];
  const RADII = ['sm', 'md', 'lg', 'full'];
  // Sizing vocab · the FULL semantic size scale (decision 36 · 65.3 §6
  // box = geometry, no colour). Shared by width/height/min-height; the
  // whole xs..3xl scale is exposed (like RADII exposes its whole scale),
  // not the 5-leaf subset padding uses.
  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

  class NuriBox extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #inner = null;
    #innerTag = null;

    connectedCallback() {
      if (this.#inner) return;

      const tag = (this.getAttribute('as') || 'div').toLowerCase();
      const inner = document.createElement(tag);
      while (this.firstChild) inner.appendChild(this.firstChild);
      this.appendChild(inner);
      this.#inner = inner;
      this.#innerTag = tag;
      this.#sync();
    }

    attributeChangedCallback(name, _oldValue, newValue) {
      if (!this.#inner) return;
      if (name === 'as') {
        const desired = (newValue || 'div').toLowerCase();
        if (desired !== this.#innerTag) {
          const next = document.createElement(desired);
          while (this.#inner.firstChild) next.appendChild(this.#inner.firstChild);
          this.#inner.replaceWith(next);
          this.#inner = next;
          this.#innerTag = desired;
        }
      }
      this.#sync();
    }

    #sync() {
      this.#inner.className = 'nuri-box';

      const bg = this.getAttribute('background');
      if (bg != null && !BACKGROUNDS.includes(bg)) {
        console.warn(`[NuriBox] unknown background value "${bg}"`);
      }
      const radius = this.getAttribute('radius');
      if (radius != null && !RADII.includes(radius)) {
        console.warn(`[NuriBox] unknown radius value "${radius}"`);
      }
      // width/height/min-height share one enum (the size scale); warn
      // loudly on a bad leaf like background/radius. Value still mirrors
      // to data-*; an unmatched leaf simply produces no rule.
      for (const dim of ['width', 'height', 'min-height']) {
        const v = this.getAttribute(dim);
        if (v != null && !SIZES.includes(v)) {
          console.warn(`[NuriBox] unknown ${dim} value "${v}"`);
        }
      }

      // Mirror every padding-* attribute as data-padding-* on the
      // inner. CSS dispatches via attribute selectors that match the
      // exact value — invalid leaves quietly no-op.
      for (const attr of ATTRS) {
        if (attr === 'as') continue;
        if (attr === 'center') {
          this.#setData('center', this.hasAttribute('center') ? 'true' : null);
          continue;
        }
        if (attr === 'fill') {
          this.#setData('fill', this.hasAttribute('fill') ? 'true' : null);
          continue;
        }
        const value = this.getAttribute(attr);
        // data-padding-x etc. — the inner.dataset auto-camelCases,
        // but the CSS selectors below match the kebab form. Use
        // setAttribute directly to keep the kebab on the DOM.
        if (value == null) {
          this.#inner.removeAttribute(`data-${attr}`);
        } else {
          this.#inner.setAttribute(`data-${attr}`, value);
        }
      }
    }

    #setData(key, value) {
      if (value == null) {
        delete this.#inner.dataset[key];
      } else {
        this.#inner.dataset[key] = value;
      }
    }
  }

  customElements.define('nuri-box', NuriBox);
})();
