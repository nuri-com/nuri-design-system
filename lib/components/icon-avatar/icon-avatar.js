/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-AVATAR · CUSTOM ELEMENT
 * <nuri-icon-avatar> is the static, decorative twin of IconButton
 * (decision 50 · N+6.9): an icon centred on a coloured circle, with
 * NO interaction. It shares IconButton's variant→surface matrix
 * (solid/soft/ghost) plus an avatar-only `subtle` variant, and accent
 * self-scope, but strips press/disabled/focus/aria-label. It is the
 * second direct <nuri-icon> consumer, unblocked by the F-ICON-RN-1
 * closure (decision 48 · N+6.8).
 *
 * The wrapper exists for API mapping in docs HTML — it does NOT port
 * to RN. The RN consumer is generated separately (same prop names,
 * different mechanism · RISKS R1).
 *
 * Markup
 *   <nuri-icon-avatar name="gear"></nuri-icon-avatar>             · default: variant=soft
 *   <nuri-icon-avatar name="clock" variant="solid"></nuri-icon-avatar>
 *   <nuri-icon-avatar name="vault" variant="ghost"></nuri-icon-avatar>
 *   <nuri-icon-avatar name="clock" variant="subtle"></nuri-icon-avatar>                · muted glyph (avatar-only)
 *   <nuri-icon-avatar name="scan" variant="solid" accent="orange"></nuri-icon-avatar>  · self-scope
 *   <nuri-icon-avatar name="vault" variant="solid" fill></nuri-icon-avatar>            · filled glyph
 *
 * Defaults
 *   variant  → "soft"
 *   size     → lg circle / md glyph (LOCKED · decision 50 · no size attr ·
 *              mirrors IconButton's geometry exactly)
 *   accent   → inherited from CSS cascade
 *
 * Accessibility
 *   IconAvatar is DECORATIVE — it conveys no information the
 *   surrounding text doesn't already. The host is aria-hidden, not
 *   focusable, and carries no role. There is no aria-label burden
 *   (it is NOT an icon-only control · F-ARIA-LABEL-1 does not apply ·
 *   decision 50). Pair it with a visible text label in the row.
 *
 * Accent override · Tier 2 self-scope
 *   When `accent` is set, it is mirrored as data-accent on the inner
 *   <span> so accent tokens resolve for that avatar only.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['name', 'variant', 'accent', 'fill'];

  class NuriIconAvatar extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #surface = null;
    #icon = null;

    connectedCallback() {
      if (this.#surface) return;

      // Decorative · the whole element is hidden from AT (decision 50).
      // No role, no tabindex, no accessible name.
      this.setAttribute('aria-hidden', 'true');

      // First-time mount: create the inner circle (a non-interactive
      // <span>, unlike IconButton's <button>) and the single
      // <nuri-icon> glyph it wraps.
      const surface = document.createElement('span');
      const icon = document.createElement('nuri-icon');
      icon.setAttribute('size', 'md');
      // Seed the glyph name BEFORE the subtree enters the document so
      // <nuri-icon>'s connectedCallback resolves a real registry key on
      // first render instead of warning `unknown name "null"`. #sync
      // re-asserts it below.
      icon.setAttribute('name', this.getAttribute('name') || '');
      surface.appendChild(icon);
      this.appendChild(surface);
      this.#surface = surface;
      this.#icon = icon;
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#surface) this.#sync();
    }

    #sync() {
      const name = this.getAttribute('name') || '';
      const variant = this.getAttribute('variant') || 'soft';
      const accent = this.getAttribute('accent');

      this.#icon.setAttribute('name', name);

      // Glyph weight passthrough: `fill` on the host selects the
      // filled icon weight. Empty-string value registers as present
      // in <nuri-icon>'s hasAttribute('fill') check.
      if (this.hasAttribute('fill')) {
        this.#icon.setAttribute('fill', '');
      } else {
        this.#icon.removeAttribute('fill');
      }

      this.#surface.className = `nuri-icon-avatar nuri-icon-avatar--${variant}`;

      // Tier 2 self-scope: mirror `accent` to data-accent on the inner
      // span so accent tokens resolve with that override.
      if (accent) {
        this.#surface.dataset.accent = accent;
      } else {
        delete this.#surface.dataset.accent;
      }
    }
  }

  customElements.define('nuri-icon-avatar', NuriIconAvatar);
})();
