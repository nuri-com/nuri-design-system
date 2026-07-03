/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-SEPARATOR · CUSTOM ELEMENT
 *
 * The list-family separator preset: a fixed-inset wrapper around the generic
 * <nuri-separator y-space="sm"> hairline. Paint and vertical rhythm stay
 * single-sourced in separator.css; this element owns only the row-aligned inset.
 * ────────────────────────────────────────────────────────────── */

(() => {
  class NuriListSeparator extends HTMLElement {
    connectedCallback() {
      if (this.querySelector(':scope > nuri-separator')) return;
      const separator = document.createElement('nuri-separator');
      separator.setAttribute('y-space', 'sm');
      this.append(separator);
    }
  }

  if (!customElements.get('nuri-list-separator')) {
    customElements.define('nuri-list-separator', NuriListSeparator);
  }
})();
