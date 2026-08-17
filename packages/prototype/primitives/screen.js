/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SCREEN · CUSTOM ELEMENT
 * <nuri-screen> mirrors the RN-side Screen API shape (`as` plus explicit
 * safe-area sources)
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
 *   safe-area / safe-area-top / safe-area-bottom → absent
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['as', 'safe-area', 'safe-area-top', 'safe-area-bottom'];

  class NuriScreen extends HTMLElement {
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
        throw new Error('[nuri] <nuri-screen> is not valid <nuri-bleed> band content (the hit-transparency contract).');
      }
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
      this.#toggleDataset('safeArea', this.hasAttribute('safe-area'));
      this.#toggleDataset('safeAreaTop', this.hasAttribute('safe-area-top'));
      this.#toggleDataset('safeAreaBottom', this.hasAttribute('safe-area-bottom'));
    }

    #toggleDataset(name, on) {
      if (on) {
        this.#inner.dataset[name] = '';
      } else {
        delete this.#inner.dataset[name];
      }
    }
  }

  customElements.define('nuri-screen', NuriScreen);
})();
