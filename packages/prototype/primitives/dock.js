/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · DOCK · CUSTOM ELEMENT
 * <nuri-dock edge="top|bottom"> mirrors RN <Dock edge> and reports its
 * rendered block size to the nearest screen scope for matching Scroll insets.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['edge'];

  class NuriDock extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #inner = null;
    #resizeObserver = null;
    #screen = null;

    connectedCallback() {
      if (!this.#inner) {
        const inner = document.createElement('div');
        while (this.firstChild) inner.appendChild(this.firstChild);
        this.appendChild(inner);
        this.#inner = inner;
      }

      if ('ResizeObserver' in window) {
        this.#resizeObserver = new ResizeObserver(() => this.#measure());
        this.#resizeObserver.observe(this.#inner);
      }
      this.#sync();
      queueMicrotask(() => this.#measure());
    }

    disconnectedCallback() {
      this.#resizeObserver?.disconnect();
      this.#resizeObserver = null;
      this.#setScreenInset('top', 0);
      this.#setScreenInset('bottom', 0);
      this.#screen = null;
    }

    attributeChangedCallback(_name, oldValue) {
      if (!this.#inner) return;
      if (oldValue && oldValue !== this.#edge()) this.#setScreenInset(oldValue, 0);
      this.#sync();
      this.#measure();
    }

    #edge() {
      return this.getAttribute('edge') || 'bottom';
    }

    #sync() {
      this.#inner.className = 'nuri-dock';
      this.#inner.dataset.edge = this.#edge();
    }

    #nearestScreen() {
      return this.closest('.nuri-screen');
    }

    #setScreenInset(edge, px) {
      const screen = this.#screen || this.#nearestScreen();
      if (!screen) return;
      screen.style.setProperty(`--nuri-screen-dock-${edge}`, `${px}px`);
    }

    #measure() {
      const edge = this.#edge();
      this.#screen = this.#nearestScreen();
      const height = this.#inner?.getBoundingClientRect().height || 0;
      this.#setScreenInset(edge, height);
    }
  }

  customElements.define('nuri-dock', NuriDock);
})();
