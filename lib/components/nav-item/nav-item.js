/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · NAV-ITEM · CUSTOM ELEMENT  (closed scalar recipe · decision 52 · 64 · N+8/N+17)
 *
 * A recipe = a named, CLOSED composition over primitives, configured by
 * SCALAR props only (decision 64). nav-item.js builds its internal
 * structure by CLONING a native <template> (composition, not imperative
 * createElement soup, not lit-html / JSX · decision 52), then maps its
 * scalar attributes onto the composed primitives:
 *
 *   <nuri-nav-item text="Activate card" onpress="…"></nuri-nav-item>
 *     →
 *   <nuri-list-interactive-item onpress="…">
 *     <nuri-list-item>
 *       <nuri-list-item-content>
 *         <nuri-typography size="md" emphasis>Activate card</nuri-typography>
 *       </nuri-list-item-content>
 *       <nuri-icon name="caret-right" size="md"></nuri-icon>   ← always
 *     </nuri-list-item>
 *   </nuri-list-interactive-item>
 *
 * SCALAR PROPS (amendment 52.2 · was a children-distribution hybrid that
 * diverged web↔RN):
 *   text     (required)  the row label · drives the composed <nuri-typography>
 *   icon?    IconName     → a leading <nuri-icon-avatar name=…>
 *   variant? / accent?    forwarded to that leading IconAvatar (NO-OP without `icon`)
 *   onpress  (required)   forwarded to the interactive wrapper (which fires `press`)
 *
 * The label composes <nuri-typography size="md" emphasis> (decision 53) —
 * components compose the Typography primitive, not the raw .nuri-type-*
 * utility — inside the content PIVOT (a layout part · decision 64), never
 * a hand-applied --nuri-type-* block.
 *
 * The disclosure caret is ALWAYS present (not a prop), a positional
 * trailing sibling muted in CSS (the caret reads in border-strong, Icon
 * inherits via currentColor · decision 38), so nothing here touches Icon's
 * prop surface.
 *
 * CLOSED — the children-distribution `while`-loop / `localName`
 * type-routing of the old hybrid is GONE: arbitrary leading / rich
 * content is the ListItem primitive's job (the escalation rule · drop to
 * the primitive · decision 64). Because the source of truth is now
 * scalar attributes (not moved children), re-composition is idempotent.
 *
 * nav-item is NAV-AGNOSTIC — it forwards `onpress` to the interactive
 * wrapper; routing is the author's handler. Skip-emit (no recipe tokens ·
 * empty @layer tokens). It does NOT port to RN as an element; RN generates
 * the same recipe from the same scalar props.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML =
    '<nuri-list-interactive-item>' +
      '<nuri-list-item>' +
        '<nuri-list-item-content>' +
          '<nuri-typography class="nuri-nav-item__label" size="md" emphasis></nuri-typography>' +
        '</nuri-list-item-content>' +
        '<nuri-icon class="nuri-nav-item__caret" name="caret-right" size="md"></nuri-icon>' +
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
      const item = frag.querySelector('nuri-list-item');
      const content = frag.querySelector('nuri-list-item-content');
      const label = frag.querySelector('.nuri-nav-item__label');

      // Forward the press contract to the composed interactive wrapper
      // (forward only — routing is the author's onpress handler · decision 52).
      const onpress = this.getAttribute('onpress');
      if (onpress) interactive.setAttribute('onpress', onpress);

      // text → the composed em label (the content pivot's text · decision 53).
      // (The label's `nuri-nav-item__label` class is the compose-time query
      // hook; typography.js rewrites className to the size/emphasis utility
      // once the line connects.)
      label.textContent = this.getAttribute('text') ?? '';

      // icon → a leading <nuri-icon-avatar> positional sibling, inserted
      // BEFORE the content pivot. variant / accent are forwarded to that
      // avatar (NO-OP without `icon`). Arbitrary leading is NOT a nav-item
      // concern — drop to <nuri-list-item> to compose it (decision 64).
      const icon = this.getAttribute('icon');
      if (icon) {
        const avatar = document.createElement('nuri-icon-avatar');
        avatar.setAttribute('name', icon);
        const variant = this.getAttribute('variant');
        const accent = this.getAttribute('accent');
        if (variant) avatar.setAttribute('variant', variant);
        if (accent) avatar.setAttribute('accent', accent);
        item.insertBefore(avatar, content);
      }

      // Replace any authored content with the composed row — the scalar
      // API takes text/icon from attributes, so the host owns no authored
      // children (and re-composition stays idempotent).
      this.replaceChildren(frag);
    }
  }

  customElements.define('nuri-nav-item', NuriNavItem);
})();
