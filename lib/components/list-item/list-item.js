/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST-ITEM · CUSTOM ELEMENTS  (content-pivot · decision 51 · 52 · 64 · N+7/N+8/N+17)
 *
 * Two light-DOM elements, one IIFE:
 *   <nuri-list-item>          the row · role="listitem". PURELY
 *                             presentational — no interactivity (that
 *                             is composed around it by
 *                             <nuri-list-interactive-item> · decision 52).
 *   <nuri-list-item-content>  the named layout PIVOT (flex:1 · marker only ·
 *                             all paint + layout in list-item.css).
 *
 * CONTENT-PIVOT (decision 64 · amendment 52.2): only the content is
 * wrapped, in <nuri-list-item-content>; leading / trailing are plain
 * POSITIONAL siblings around it (anything before the pivot is leading,
 * anything after is trailing). The old <nuri-list-item-leading> /
 * <nuri-list-item-trailing> book-end wrappers are DELETED — the pivot's
 * `flex:1` pushes trailing by construction, so no wrapper and no
 * margin-auto patch are needed. This mirrors the validated RN ListItem
 * shape 1:1 (a <View {flex:1}> pivot between positional siblings · R1).
 *
 * NO reparenting (unlike the old Topbar · decision 46): the pivot and the
 * positional siblings stay in document order; CSS flexes them. The row
 * element carries ONLY its role — it manages no overlay, no keyboard
 * handler, no derived aria-label (the N+7 press overlay + copied
 * aria-label that caused the screen-reader double-read are gone ·
 * interactivity now lives in the list-interactive-item WRAPPER, whose
 * actionable element WRAPS the content so the content IS the accessible
 * name · decision 52).
 *
 * The content pivot exists for API mapping in docs HTML — it does NOT
 * port to RN as an element; the RN consumer is generated separately (same
 * pivot shape, different mechanism · RISKS R1).
 * ────────────────────────────────────────────────────────────── */

(() => {
  /* ── Named content pivot · marker only (styled entirely in CSS) ── */
  class NuriListItemContent extends HTMLElement {}

  /* ── <nuri-list-item> · the presentational row ───────────────── */
  class NuriListItem extends HTMLElement {
    connectedCallback() {
      // The row is a list entry — nothing more. Interactivity is
      // composed around it (decision 52).
      if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
    }
  }

  customElements.define('nuri-list-item-content', NuriListItemContent);
  customElements.define('nuri-list-item', NuriListItem);
})();
