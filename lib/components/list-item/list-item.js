/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-ITEM · CUSTOM ELEMENTS  (decision 51 · 52 · N+7/N+8)
 *
 * Three light-DOM elements, one IIFE:
 *   <nuri-list-item>          the row · role="listitem". PURELY
 *                             presentational — no interactivity (that
 *                             is composed around it by
 *                             <nuri-list-interactive-item> · decision 52).
 *   <nuri-list-item-leading>  optional auto-width book-end (markers only ·
 *   <nuri-list-item-trailing> all paint + layout in list-item.css).
 *
 * NO reparenting (unlike Topbar · decision 46): the wrappers and the
 * unwrapped middle stay in document order; CSS flexes them. The row
 * element carries ONLY its role — it manages no overlay, no keyboard
 * handler, no derived aria-label (the N+7 press overlay + copied
 * aria-label that caused the screen-reader double-read are gone ·
 * interactivity now lives in the list-interactive-item WRAPPER, whose
 * actionable element WRAPS the content so the content IS the
 * accessible name · decision 52).
 *
 * The wrappers exist for API mapping in docs HTML — they do NOT port
 * to RN. The RN consumer is generated separately (same prop names,
 * different mechanism · RISKS R1).
 * ────────────────────────────────────────────────────────────── */

(() => {
  /* ── Named book-ends · markers only (styled entirely in CSS) ──── */
  class NuriListItemLeading extends HTMLElement {}
  class NuriListItemTrailing extends HTMLElement {}

  /* ── <nuri-list-item> · the presentational row ───────────────── */
  class NuriListItem extends HTMLElement {
    connectedCallback() {
      // The row is a list entry — nothing more. Interactivity is
      // composed around it (decision 52).
      if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
    }
  }

  customElements.define('nuri-list-item-leading', NuriListItemLeading);
  customElements.define('nuri-list-item-trailing', NuriListItemTrailing);
  customElements.define('nuri-list-item', NuriListItem);
})();
