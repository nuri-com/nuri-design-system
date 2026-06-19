/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SPACER · CUSTOM ELEMENT
 * <nuri-spacer> is a behaviour-free flexible gap (decision 59 · N+11).
 * The element exists only to carry the API shape — the grow/size
 * dispatch is entirely in spacer.css on the host (attribute selectors),
 * so no JS reflection is needed. Mirrors the Separator pattern.
 *
 * It is purely presentational (it holds space, carries no content or
 * meaning), so the host is marked aria-hidden — AT skips it.
 *
 * API (resolved in CSS · see spacer.css)
 *   direction → "row" (default) | "column"
 *   size      → "xs".."xl" · omitted = grow (flex:1)
 *
 * RN mapping: grow → <View style={{flex:1}} />; size → a <View> with a
 * fixed width (row) / height (column) from the space scale.
 * ────────────────────────────────────────────────────────────── */

(() => {
  class NuriSpacer extends HTMLElement {
    connectedCallback() {
      // Presentational spacing only — no role, no content. Hide from
      // the accessibility tree (the gap has no meaning to AT).
      if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true');
    }
  }

  customElements.define('nuri-spacer', NuriSpacer);
})();
