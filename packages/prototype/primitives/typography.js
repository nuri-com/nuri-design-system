/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TYPOGRAPHY · CUSTOM ELEMENT
 *
 * <nuri-typography size emphasis muted align> reflects its two ORTHOGONAL type
 * inputs (decision 77 · the N+45 de-fusion) onto the host as data-attrs that
 * the type-scale CSS (styles/typography.css) dispatches on:
 *   size      → data-type-style="{size}"   (font-size · line-height · tracking · regular weight)
 *   emphasis  → data-type-emphasis          (the semibold weight override · source-order-last)
 * and observes the raw align attr the wrapper CSS dispatches directly:
 *   align     → align="{start|center|end}" (display:block + text-align)
 * No inner span, no @layer tokens — just declarative prop-to-data-attr dispatch.
 *
 * Markup
 *   <nuri-typography>Hello</nuri-typography>                  · md default
 *   <nuri-typography size="lg">Headline</nuri-typography>     · lg regular
 *   <nuri-typography size="md" emphasis>Strong</nuri-typography>  · md semibold
 *   <nuri-typography size="sm" muted>Caption</nuri-typography>    · sm, muted tone
 *   <nuri-typography align="center">Centered</nuri-typography>     · block centered text
 *
 * Defaults
 *   size      → "md"     (any of xs · sm · md · lg · xl · 3xl)
 *   emphasis  → absent   (regular weight; presence flips to semibold via the override)
 *   muted     → absent   (currentColor; presence → --nuri-text-muted)
 *
 * size/emphasis/muted are attribute-dispatch (decision 42 / 53): JS
 * reflects the props as `data-*`, the CSS owns the values/colour. Because the
 * inputs are orthogonal, each reflects independently — size → data-type-style,
 * emphasis → data-type-emphasis, muted → data-muted — with no class to clobber.
 * `muted` is a BOOLEAN, not a tone enum (there is no tone="primary|muted|accent" · P11).
 * align stays as the raw attr (decision 59): CSS selects nuri-typography[align="…"].
 *
 * Unknown size values warn `[NuriTypography] unknown size "<value>"`
 * and fall back to md (same warn pattern as <nuri-icon>). Unknown align values warn
 * and otherwise no-op because the CSS equality selectors do not match them.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['size', 'emphasis', 'muted', 'align'];
  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '3xl'];
  const ALIGNS = ['start', 'center', 'end'];

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
      const align = this.getAttribute('align');
      if (align && !ALIGNS.includes(align)) {
        console.warn(`[NuriTypography] unknown align "${align}" — expected start, center, or end`);
      }
      // Orthogonal type-scale dispatch (decision 77): the size rule sets the
      // metrics + regular weight; the emphasis override (source-order-last in
      // typography.css) wins font-weight when present. data-* aren't observed,
      // so reflecting them here does not re-enter attributeChangedCallback.
      this.setAttribute('data-type-style', size);
      this.toggleAttribute('data-type-emphasis', this.hasAttribute('emphasis'));
      // muted reflects state; the wrapper CSS owns the colour (decision 42 / 53).
      this.toggleAttribute('data-muted', this.hasAttribute('muted'));
    }
  }

  // Idempotent define (decision 74) — the factory-backed recipes self-import this
  // primitive, so a page's classic <script> tag for it coexists with that import.
  if (!customElements.get('nuri-typography')) customElements.define('nuri-typography', NuriTypography);
})();
