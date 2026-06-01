/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · NAV-ITEM · CUSTOM ELEMENT  (the first RECIPE · decision 52 · N+8)
 *
 * A recipe = a named COMPOSITION over primitives. nav-item.js builds
 * its internal structure by CLONING a native <template> (composition,
 * not imperative createElement soup, not lit-html / JSX · decision 52),
 * then forwards the author's contract to the composed primitives:
 *
 *   <nuri-nav-item onpress="…">Activate card</nuri-nav-item>
 *     →
 *   <nuri-list-interactive-item onpress="…">
 *     <nuri-list-item>
 *       <nuri-typography size="md" emphasis>Activate card</nuri-typography>
 *       <nuri-list-item-trailing>
 *         <nuri-icon name="caret-right" size="md"></nuri-icon>
 *       </nuri-list-item-trailing>
 *     </nuri-list-item>
 *   </nuri-list-interactive-item>
 *
 * The label composes <nuri-typography size="md" emphasis> (decision 53)
 * rather than applying the raw .nuri-type-md--em utility — components
 * compose the Typography primitive, not the utility class directly.
 *
 * nav-item is NAV-AGNOSTIC — it forwards `onpress` to the interactive
 * wrapper (which fires a bubbling `press`); routing is the author's
 * handler.
 *
 * OPTIONAL LEADING book-end: an authored <nuri-list-item-leading> child
 * (e.g. an icon-avatar) is hoisted into the composed list-item, so the
 * disclosure row can carry a leading marker. list-item positions it by
 * element type (decision 51); everything else is the label.
 *
 *   <nuri-nav-item><nuri-list-item-leading><nuri-icon-avatar …/>
 *     </nuri-list-item-leading>Activate card</nuri-nav-item>
 *
 * The auto-filled caret is muted in CSS (trailing → border-strong,
 * Icon inherits via currentColor · decision 38), so nothing here
 * touches Icon's prop surface.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML =
    '<nuri-list-interactive-item>' +
      '<nuri-list-item>' +
        '<nuri-typography class="nuri-nav-item__label" size="md" emphasis></nuri-typography>' +
        '<nuri-list-item-trailing>' +
          '<nuri-icon name="caret-right" size="md"></nuri-icon>' +
        '</nuri-list-item-trailing>' +
      '</nuri-list-item>' +
    '</nuri-list-interactive-item>';

  class NuriNavItem extends HTMLElement {
    connectedCallback() {
      // Idempotent — compose once even across detach / re-attach.
      if (this.dataset.nuriComposed) return;
      this.#compose();
      this.dataset.nuriComposed = '';
    }

    #compose() {
      const frag = TEMPLATE.content.cloneNode(true);
      const interactive = frag.querySelector('nuri-list-interactive-item');
      const label = frag.querySelector('.nuri-nav-item__label');

      // Forward the press contract to the composed interactive wrapper
      // (forward only — routing is the author's onpress handler · decision 52).
      const onpress = this.getAttribute('onpress');
      if (onpress) interactive.setAttribute('onpress', onpress);

      // Distribute the authored children into the composed row. A
      // <nuri-list-item-leading> book-end is hoisted into the list-item
      // as-is (list-item positions it as the start book-end by element
      // type · decision 51); everything else is the label, moved into the
      // composed <nuri-typography> em line. The auto-filled caret stays
      // the trailing. (The label's `nuri-nav-item__label` class is the
      // compose-time query hook; typography.js rewrites className to the
      // size/emphasis utility once the line connects — decision 53.)
      const item = frag.querySelector('nuri-list-item');
      while (this.firstChild) {
        const node = this.firstChild;
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.localName === 'nuri-list-item-leading') {
          item.insertBefore(node, label);
        } else {
          label.appendChild(node);
        }
      }

      this.appendChild(frag);
    }
  }

  customElements.define('nuri-nav-item', NuriNavItem);
})();
