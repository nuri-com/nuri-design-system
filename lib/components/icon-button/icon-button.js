/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ICON-BUTTON · CUSTOM ELEMENT
 * <nuri-icon-button> is a circular, icon-only action — the first
 * real consumer of <nuri-icon> (decision 38 · validates Icon at the
 * consumer level). It mirrors Button's RN-side API shape (variant
 * /accent/disabled) but is locked to a single size (decision 40) and
 * takes a `name` (icon registry key) instead of text children.
 *
 * The wrapper exists for API mapping in docs HTML — it does NOT port
 * to RN. The RN consumer is generated separately (same prop names,
 * different mechanism · RISKS R1).
 *
 * Markup
 *   <nuri-icon-button name="gear"></nuri-icon-button>            · default: variant=soft
 *   <nuri-icon-button name="plus" variant="solid"></nuri-icon-button>
 *   <nuri-icon-button name="x" variant="ghost"></nuri-icon-button>   · tertiary (decision 39)
 *   <nuri-icon-button name="scan" variant="solid" accent="orange"></nuri-icon-button>
 *   <nuri-icon-button name="gear" label="Open settings"></nuri-icon-button>
 *   <nuri-icon-button name="plus" disabled></nuri-icon-button>
 *
 * Defaults
 *   variant  → "soft"
 *   size     → md (LOCKED · decision 40 · no size attr)
 *   accent   → inherited from CSS cascade
 *
 * Accessibility (F-ARIA-LABEL-1)
 *   An icon-only control has no text, so aria-label is REQUIRED. It
 *   is auto-derived from the kebab `name` (gear → "gear",
 *   arrows-down-up → "arrows down up") unless an explicit `label`
 *   attribute overrides it. The inner <nuri-icon> is aria-hidden, so
 *   the label is the only thing AT announces.
 *
 * Accent override · Tier 2 self-scope
 *   When `accent` is set, it is mirrored as data-accent on the inner
 *   <button> so accent tokens resolve for that button only.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['name', 'variant', 'accent', 'label', 'disabled', 'fill'];

  class NuriIconButton extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #btn = null;
    #icon = null;

    connectedCallback() {
      if (this.#btn) return;

      // First-time mount: create the inner native button and the
      // single <nuri-icon> glyph it wraps. We never tear these down on
      // subsequent attribute changes — listeners stay alive.
      const btn = document.createElement('button');
      btn.type = 'button';
      const icon = document.createElement('nuri-icon');
      icon.setAttribute('size', 'md');
      // Seed the glyph name BEFORE the subtree enters the document, so
      // <nuri-icon>'s connectedCallback resolves a real registry key on
      // first render instead of upgrading name-less and warning
      // `unknown name "null"`. #sync re-asserts it below.
      icon.setAttribute('name', this.getAttribute('name') || '');
      btn.appendChild(icon);
      this.appendChild(btn);
      this.#btn = btn;
      this.#icon = icon;
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#btn) this.#sync();
    }

    #sync() {
      const name = this.getAttribute('name') || '';
      const variant = this.getAttribute('variant') || 'soft';
      const accent = this.getAttribute('accent');
      const explicitLabel = this.getAttribute('label');
      const isDisabled = this.hasAttribute('disabled');

      this.#icon.setAttribute('name', name);

      // Glyph weight passthrough: `fill` on the host selects the
      // filled icon weight (decision 40.1 amendment · single-size
      // lock unchanged). Empty-string value registers as present in
      // <nuri-icon>'s hasAttribute('fill') check.
      if (this.hasAttribute('fill')) {
        this.#icon.setAttribute('fill', '');
      } else {
        this.#icon.removeAttribute('fill');
      }

      this.#btn.className = `nuri-icon-button nuri-icon-button--${variant}`;

      // F-ARIA-LABEL-1: an icon-only control needs an accessible name.
      // Explicit `label` wins; otherwise derive from the kebab `name`.
      this.#btn.setAttribute('aria-label', explicitLabel || name.replace(/-/g, ' '));

      // Tier 2 self-scope: mirror `accent` to data-accent on the inner
      // button so accent tokens resolve with that override.
      if (accent) {
        this.#btn.dataset.accent = accent;
      } else {
        delete this.#btn.dataset.accent;
      }

      if (isDisabled) {
        this.#btn.setAttribute('disabled', '');
      } else {
        this.#btn.removeAttribute('disabled');
      }
    }
  }

  customElements.define('nuri-icon-button', NuriIconButton);
})();
