/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · STACK · CUSTOM ELEMENT
 * <nuri-stack> mirrors the RN-side Stack API shape (direction/gap/
 * align/justify/wrap/as) while delegating to a host element
 * (default <div>; `as` attr overrides) for the actual flex layout.
 *
 * The wrapper exists for API mapping in docs HTML; the RN
 * equivalent is a thin component over <View> sharing the prop
 * names. No component-token aliasing per decision 37 · N+6.2:
 * the prop value passes straight through to a `data-*` attr that
 * the CSS dispatches on via attribute selectors in @layer rules.
 *
 * Markup
 *   <nuri-stack gap="md">…</nuri-stack>                             column gap md
 *   <nuri-stack direction="row" gap="sm" align="center">…</nuri-stack>
 *   <nuri-stack direction="row" wrap>…</nuri-stack>                 wrap is boolean
 *   <nuri-stack direction="column" fill>…</nuri-stack>             grow to fill (bare = grow)
 *   <nuri-stack direction="row" fill="grow-shrink">…</nuri-stack>  content-pivot (shrinks)
 *   <nuri-stack as="section">…</nuri-stack>                         host = <section>
 *
 * Defaults
 *   direction  → "column"
 *   gap        → none (no gap attr · no data-gap on inner)
 *   align      → none (browser flex default · stretch on column)
 *   justify    → none (browser default · flex-start)
 *   wrap       → false
 *   fill       → none · enum grow | grow-shrink (decision 60 · B1.5 §3);
 *                bare `fill`/`fill="grow"` = grow (flex:1 0 auto · back-compat),
 *                `fill="grow-shrink"` = flex:1 1 auto + min-inline-size:0
 *   as         → "div"
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['direction', 'gap', 'align', 'justify', 'wrap', 'fill', 'as'];

  class NuriStack extends HTMLElement {
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
      // `as` swaps the host element; recreate the inner if it changed.
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
      this.#inner.className = 'nuri-stack';

      const direction = this.getAttribute('direction');
      const gap       = this.getAttribute('gap');
      const align     = this.getAttribute('align');
      const justify   = this.getAttribute('justify');
      const wrap      = this.hasAttribute('wrap');
      // fill · enum grow | grow-shrink (B1.5 §3). Decision-60 back-compat:
      // a bare `fill` (or `fill="grow"`) still means grow (flex:1 0 auto);
      // `fill="grow-shrink"` is the Topbar content-pivot (flex:1 1 auto +
      // min-inline-size:0). Anything present but unrecognized defaults to
      // grow — fill present ⇒ at least grows.
      const fillAttr  = this.getAttribute('fill');
      const fill      = fillAttr == null
        ? null
        : (fillAttr === 'grow-shrink' ? 'grow-shrink' : 'grow');

      this.#setData('direction', direction);
      this.#setData('gap',       gap);
      this.#setData('align',     align);
      this.#setData('justify',   justify);
      this.#setData('wrap',      wrap ? 'true' : null);
      this.#setData('fill',      fill);
    }

    #setData(key, value) {
      if (value == null) {
        delete this.#inner.dataset[key];
      } else {
        this.#inner.dataset[key] = value;
      }
    }
  }

  customElements.define('nuri-stack', NuriStack);
})();
