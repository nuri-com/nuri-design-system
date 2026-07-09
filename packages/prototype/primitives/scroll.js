/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SCROLL · CUSTOM ELEMENT
 * <nuri-scroll> mirrors the RN-side Scroll API shape (`as`, safe-area reserves, insets)
 * while delegating to a host element (default <div>; `as` overrides)
 * for the actual flex-fill + overflow scroll.
 *
 * The wrapper exists for API mapping in docs HTML; the RN equivalent
 * is a thin component over <ScrollView>. No component-token aliasing
 * per decision 37 — Scroll owns no tokens; the fill + overflow are
 * pure structural CSS in @layer rules.
 *
 * Defaults
 *   as → "div"
 *   inset-top → "none"
 *   inset-bottom → "none"
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['as', 'safe-area-top', 'safe-area-bottom', 'inset-top', 'inset-bottom'];

  class NuriScroll extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #inner = null;
    #innerTag = null;
    #content = null;

    connectedCallback() {
      if (this.#inner) return;

      const tag = (this.getAttribute('as') || 'div').toLowerCase();
      const inner = document.createElement(tag);
      const content = document.createElement('div');
      content.className = 'nuri-scroll__content';
      while (this.firstChild) content.appendChild(this.firstChild);
      inner.appendChild(content);
      this.appendChild(inner);
      this.#inner = inner;
      this.#innerTag = tag;
      this.#content = content;
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
      this.#inner.className = 'nuri-scroll';
      this.#toggleDataset('safeAreaTop', this.hasAttribute('safe-area-top'));
      this.#toggleDataset('safeAreaBottom', this.hasAttribute('safe-area-bottom'));
      this.#inner.dataset.insetTop = this.getAttribute('inset-top') || 'none';
      this.#inner.dataset.insetBottom = this.getAttribute('inset-bottom') || 'none';
      this.#content.className = 'nuri-scroll__content';
    }

    #toggleDataset(name, on) {
      if (on) {
        this.#inner.dataset[name] = '';
      } else {
        delete this.#inner.dataset[name];
      }
    }
  }

  customElements.define('nuri-scroll', NuriScroll);
})();
