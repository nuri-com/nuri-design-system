/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SCREEN · CUSTOM ELEMENT
 * <nuri-screen> mirrors the RN-side Screen API shape (just `as`)
 * while delegating to a host element (default <div>; `as` overrides)
 * for the actual flex-column fill.
 *
 * The wrapper exists for API mapping in docs HTML; the RN equivalent
 * is a thin component over <View> (flex:1). No component-token
 * aliasing per decision 37 — Screen owns no tokens; the fill is pure
 * structural CSS in @layer rules.
 *
 * Defaults
 *   as → "div"
 * ────────────────────────────────────────────────────────────── */

(() => {
  class NuriScreen extends HTMLElement {
    static get observedAttributes() {
      return ['as'];
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
      this.#inner.className = 'nuri-screen';
    }
  }

  customElements.define('nuri-screen', NuriScreen);
})();
