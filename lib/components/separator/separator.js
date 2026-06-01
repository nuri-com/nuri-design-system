/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · SEPARATOR · CUSTOM ELEMENT
 * <nuri-separator> is a behaviour-free 1px hairline (decision 49 ·
 * N+6.9). The element exists only to carry semantics — the paint and
 * the `y-space` dispatch are entirely in separator.css on the host. It
 * mirrors the RN-side Separator (a 1px <View>) for prop parity.
 *
 * ONE prop: `y-space` (amendment 49.1 · N+8.1) — the vertical breathing
 * room above/below the line, over the semantic space scale (default
 * `sm`, accepts `none`). It is dispatched PURELY in CSS via an
 * attribute selector (`nuri-separator[y-space="lg"]`) — no JS
 * reflection is needed (the default lives on the base rule), so this
 * element stays behaviour-free.
 *
 * The wrapper exists for API mapping in docs HTML; it does NOT port
 * to RN (the RN consumer is a thin <View> with marginVertical from the
 * space scale). No component-token aliasing — the line colour comes
 * straight from --nuri-border-subtle and `y-space` selects a
 * --nuri-space-* leaf directly in @layer rules (decision 37 / 49).
 *
 * Markup
 *   <nuri-separator></nuri-separator>                default y-space="sm"
 *   <nuri-separator y-space="lg"></nuri-separator>
 *   <nuri-separator y-space="none"></nuri-separator>  flush hairline
 *
 * Accessibility
 *   The host is exposed as role="separator" with an explicit
 *   aria-orientation="horizontal" — a non-focusable structural
 *   divider, the ARIA analogue of <hr>. No label (it carries no
 *   meaning beyond "section break").
 * ────────────────────────────────────────────────────────────── */

(() => {
  class NuriSeparator extends HTMLElement {
    connectedCallback() {
      // Structural divider · the ARIA analogue of <hr>. Horizontal
      // only (decision 49 · no orientation prop). Behaviour-free —
      // nothing else to wire up.
      if (!this.hasAttribute('role')) this.setAttribute('role', 'separator');
      if (!this.hasAttribute('aria-orientation')) {
        this.setAttribute('aria-orientation', 'horizontal');
      }
    }
  }

  customElements.define('nuri-separator', NuriSeparator);
})();
