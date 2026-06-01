/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TYPOGRAPHY · CUSTOM ELEMENT
 *
 * <nuri-typography size emphasis muted> applies the `.nuri-type-{step}` /
 * `.nuri-type-{step}--em` utility class (styles/typography.css) to
 * the host element on every attribute change. No inner span, no
 * @layer tokens — just declarative prop-to-utility-class dispatch.
 *
 * Markup
 *   <nuri-typography>Hello</nuri-typography>                  · md default
 *   <nuri-typography size="lg">Headline</nuri-typography>     · lg regular
 *   <nuri-typography size="md" emphasis>Strong</nuri-typography>  · md semibold
 *   <nuri-typography size="sm" muted>Caption</nuri-typography>    · sm, muted tone
 *
 * Defaults
 *   size      → "md"     (any of xs · sm · md · lg · xl · 3xl)
 *   emphasis  → absent   (regular weight; presence flips to em-weight)
 *   muted     → absent   (currentColor; presence → --nuri-text-muted)
 *
 * `muted` is attribute-dispatch (decision 42 / 53): JS reflects the
 * boolean as `data-muted`, CSS owns the colour. It is a BOOLEAN, not a
 * tone enum — there is no `tone="primary|muted|accent"` (P11). Because
 * #sync() rewrites `className` wholesale for the size/emphasis utility,
 * the muted state rides a separate `data-muted` attribute rather than a
 * class (which would be clobbered).
 *
 * Unknown size values warn `[NuriTypography] unknown size "<value>"`
 * and fall back to md (same warn pattern as <nuri-icon>).
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['size', 'emphasis', 'muted'];
  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '3xl'];

  class NuriTypography extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    connectedCallback() {
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.#sync();
    }

    #sync() {
      let size = this.getAttribute('size') || 'md';
      if (!SIZES.includes(size)) {
        console.warn(`[NuriTypography] unknown size "${size}" — falling back to md`);
        size = 'md';
      }
      const emphasis = this.hasAttribute('emphasis');
      this.className = emphasis ? `nuri-type-${size}--em` : `nuri-type-${size}`;
      // muted reflects state; typography.css owns the colour (decision 42 / 53).
      this.toggleAttribute('data-muted', this.hasAttribute('muted'));
    }
  }

  customElements.define('nuri-typography', NuriTypography);
})();
